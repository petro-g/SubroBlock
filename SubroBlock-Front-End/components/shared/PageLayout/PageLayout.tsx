import React from "react";
import Header from "@/components/shared/PageLayout/Header";
import Navbar from "@/components/shared/PageLayout/Navbar/Navbar";
import SidePanelRoot from "@/components/shared/SidePanel";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { cn } from "@/lib/utils";

// Wraps around any content, adding LeftNavBar and Header to page
// also adds styles and fonts to page
export default function PageLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, toggleTheme, globalClassName } = useGlobalStyles();

  return (
    <div className={cn("flex", theme, globalClassName)}>
      <div
        className="cursor-pointer z-50 fixed -bottom-8 -left-8 w-16 h-16 rounded-full hover:bg-accent-active"
        onClick={toggleTheme}
      />
      <Navbar />
      <div className="w-full bg-background-secondary px-8">
        <Header />
        {children}
      </div>
      <SidePanelRoot/>
    </div>
  );
}
