import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { URL_LOGIN, URL_TOKEN_REFRESH } from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { IUserBase } from "@/store/types/user";

export default NextAuth({
  // to where to redirect on certain actions
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    verifyRequest: "/login",
    newUser: "/login"
  },

  // sources of authentication
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Django Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // called when signIn("credentials", { username, password }) is called (first logged in)
      async authorize(credentials) {
        // post credentials to Django API
        const response = await fetch(URL_LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials)
        });

        if (!response.ok) {
          console.log("Error response:", response);
          switch (response.statusText) {
            case "Unauthorized":
              throw new Error("Wrong credentials or user doesn't exist");
            default:
              throw new Error(response.statusText);
          }
        }

        // returns user object to be processed by jwt() and session()
        return await response.json();
      }
    })
  ],
  callbacks: {
    // when token requested by session - automatically refreshed. null if cant refresh
    async jwt({ token, user, session, trigger }) {
      // log in - user has tokens inside, merge them
      // all other times this called without user (because no-one is logging), so line skipped
      if (user) {
        // console.log("User logged in:", user);
        const userResponse = user;
        token.access_token = userResponse.access_token;
        token.refresh_token = userResponse.refresh_token;
        token.csrf_token = userResponse.csrf_token;

        token.user = userResponse.user;
      }

      if (trigger === "update") {
        token.theme = session.theme;
      }

      // Check if the access_token is expired
      if (token.access_token && isTokenExpired(token.access_token as string)) {
        // If the access_token is expired, we want to send a refresh request
        const { ok, data, error } = await fetchAPI<{ access_token: string; refresh_token: string; }>(URL_TOKEN_REFRESH, {
          method: "POST",
          body: JSON.stringify({ refresh_token: token.refresh_token })
        });

        if (ok) {
          console.log(new Date().toTimeString() + " Refreshed access tokens");
          token.access_token = data.access_token;
          token.refresh_token = data.refresh_token;
        } else {
          console.error("Error refreshing access token:", error, ":Error refreshing access token");
        }
      }

      // console.log("JWT:", token);
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user as IUserBase;
        session.theme = token.theme as "light" | "dark";
      }

      return session;
    }
  },
  session: {
    // strategy: "jwt", // same by default
    maxAge: 24 * 60 * 60 // keep the same as REFRESH_TOKEN_LIFETIME on backend
  }
});

// Function to check if the token is expired
function isTokenExpired(token: string): boolean {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
