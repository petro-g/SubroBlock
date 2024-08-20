"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import NavbarItem
  from "@/components/shared/PageLayout/Navbar/NavbarItem";
import { PageRoutes } from "@/lib/constants/page-routes";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { currentUserHasSomeRoles } from "@/lib/utils";
import LoginLogoIcon from "@/public/logo.svg";
import { useUsersStore } from "@/store/useUsersStore";

const Navbar =  () => {
  const currentUser = useCurrentUser();
  const visibleRoutes = PageRoutes.filter(
    (route) =>
      !route.requiredRoles ||
      currentUserHasSomeRoles(currentUser, route.requiredRoles)
  );

  // needed for route labels to render notifications count, see LeftNavbarSubRouteRenderers
  const { fetchCurrentUserActivityCount } = useUsersStore();
  useEffect(() => {
    fetchCurrentUserActivityCount(); // initial fetch
    // repeat each minute
    const interval = setInterval(fetchCurrentUserActivityCount, 60000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <nav className="bg-background h-screen flex flex-col border-r sticky top-0">
      <div className="flex flex-col justify-start items-start">
        <h3 className="mb-8 text-center pt-4 pl-6 pr-5 flex items-center gap-2">
          <Link href="/">
            <Image
              src={LoginLogoIcon}
              alt="SubroBlock Logo"
              width={32}
              height={32}
            />
          </Link>
          SubroBlock
        </h3>
        <ul className="px-3">
          {visibleRoutes.filter(item => !item.bottomPlacement).map((item) => (
            <NavbarItem
              key={item.href}
              route={item}
              icon={item.icon}
              iconSelected={item.iconSelected}
            />
          ))}
        </ul>
      </div>
      {/* The only item at bottom of component. It has margin top auto spacing*/}
      <ul className="m-2 mt-auto rounded-lg items-center text-primary-foreground flex cursor-pointer flex-col">
        {visibleRoutes.filter(item => item.bottomPlacement).slice(-2).map((item) => (
          <NavbarItem
            key={item.href}
            route={item}
            icon={item.icon}
            iconSelected={item.iconSelected}
          />
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
