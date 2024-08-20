import Image, { StaticImageData } from "next/image";
import React from "react";
import LinkSafe from "@/components/shared/link-safe";
import {
  NavbarSubRouteLabelPostfixRenderer
} from "@/components/shared/PageLayout/Navbar/NavbarSubRouteLabelPostfixRenderer";
import { IPageRoute } from "@/lib/constants/page-routes";
import useCurrentRoute from "@/lib/hooks/useCurrentRoute";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { cn, currentUserHasSomeRoles } from "@/lib/utils";

const NavbarItem: React.FC<{
  route: IPageRoute,
  icon?: string | StaticImageData;
  iconSelected?: string | StaticImageData;
}> = ({ route, icon, iconSelected }) => {
  const currentRoutePage = useCurrentRoute();
  const isOpen = currentRoutePage?.href === route.href;
  const currentUser = useCurrentUser();

  return (
    <li className="hover:bg-background-secondary rounded-lg">
      <LinkSafe
        href={route.href}
        className={cn(
          "cursor-pointer min-w-[231px] py-3 px-4 relative",
          route.subRoutes ? "flex items-center" : "flex items-center",
          isOpen && "bg-background-secondary rounded-lg"
        )}
      >
        {icon && iconSelected && (
          <Image
            src={isOpen ? iconSelected : icon}
            alt="LeftIcon"
            className="mr-2"
          />
        )}
        <h4>
          {route.label}
        </h4>
        {isOpen && (
          <div className="absolute -left-3 top-0 w-[3px] bg-accent-active h-full rounded-lg" />
        )}
      </LinkSafe>
      {isOpen && route.subRoutes && (
        <ul className="ml-11">
          {route.subRoutes.map((subRoute) => currentUserHasSomeRoles(currentUser, subRoute.requiredRoles) && (
            <LinkSafe
              href={route.href + subRoute.href}
              key={subRoute.href + subRoute.href}
              className="flex items-center relative cursor-pointer"
            >
              <span
                className={cn(
                  "hover:text-primary-foreground py-3 text-sm",
                  currentRoutePage.subRoute?.href === subRoute.href
                    ? "text-primary-foreground font-medium"
                    : "text-secondary-foreground"
                )}
              >
                {subRoute.label}
                <NavbarSubRouteLabelPostfixRenderer
                  route={route}
                  subRoute={subRoute}
                />
              </span>
            </LinkSafe>
          ))}
        </ul>
      )}
    </li>
  );
};

export default NavbarItem;
