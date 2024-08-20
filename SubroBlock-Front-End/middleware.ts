import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PageRoutes } from "@/lib/constants/page-routes";
import { currentUserHasSomeRoles } from "@/lib/utils";
import { IUserBase } from "@/store/types/user";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // if not logged in and not on login page - return login page instead of original page
  if (!token) {
    return NextResponse.rewrite(new URL("/login", request.url));
  }

  // if logged in, user exists, user has role, and route requires role - check if user has role. otherwise page doesn't exist
  if (token.user) {
    const route = PageRoutes.find(route => route.href === request.nextUrl.pathname);

    // if route has requiredRoles and user does not have any of the roles - redirect
    if (
      route?.requiredRoles &&
      !currentUserHasSomeRoles(token.user as IUserBase, route.requiredRoles)
    )
      return NextResponse.redirect(new URL("/", request.url));

    // show offers page on root (not redirect)
    if (request.nextUrl.pathname === "/") {
      const firstPageWithAccess = PageRoutes.find(route => !route.notImplemented && currentUserHasSomeRoles(token.user as IUserBase, route.requiredRoles));
      const href = firstPageWithAccess? firstPageWithAccess.href : "/404";

      return NextResponse.redirect(new URL(href, request.url));
    }
  }
}

// exclude api, login, static files, and images from middleware
export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|.*\\.png$).*)"]
};
