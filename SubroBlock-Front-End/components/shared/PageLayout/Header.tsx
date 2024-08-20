"use client";
import React from "react";
import CurrentUserDropdown from "@/components/shared/PageLayout/CurrentUserDropdown";
import useCurrentRoute from "@/lib/hooks/useCurrentRoute";

const Header =  () => {
  const currentRoute = useCurrentRoute();

  return (
    <div className="w-full h-24 flex items-center justify-between">
      <h1>
        {currentRoute?.label}
      </h1>
      <CurrentUserDropdown/>
    </div>
  );
};

export default Header;
