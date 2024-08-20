import { IUserBase } from "@/store/types/user";
import type { DefaultSession } from "next-auth";

// augment next-auth types to include our custom properties
declare module "next-auth" {
  // for some reason those types are considered unused, but it works anyway. TS is happy
  /* eslint-disable no-unused-vars */
  export interface Session extends DefaultSession {
    theme: "light" | "dark";
    user: IUserBase;
  }

  export interface JWT {
    access_token: string;
    refresh_token: string;
    csrf_token: string;
    user: IUserBase;
    theme: "light" | "dark";
  }

  export interface User { // response from Django API on /login
    message: "Index successfully" | "User created successfully",
    refresh_token: string;
    access_token: string;
    csrf_token: string;

    user: IUserBase;
  }
}
