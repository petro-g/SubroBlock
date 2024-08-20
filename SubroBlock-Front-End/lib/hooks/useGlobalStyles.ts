import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export const inter = Inter({ subsets: ["latin"] });

const globalFontClassName = inter.className;

// adds global styles and font to any component this class is used in
// this needed for layout, sidebar, modal or any other portal. Otherwise, they don't have styles
// the only way to wrap into layout EVERYTHING including portals - _document.js. But it can't import any fonts anyway...
// _app.js only wraps the page component. So portals remain not styled, and we need to apply this wrapper to each of them
// So the easiest way to just expose font className and use it in each portal. globals.css imported first time this file is used
type TTheme = "light" | "dark";

// controls theme and gives full global className with font and theme
export const useGlobalStyles = () => {
  // FIXME useSession makes fetch request to server to get session when page loaded, adding delay and flicker for client non-default theme
  const { data, update } = useSession();
  const theme: TTheme = (data?.theme) || "light";

  return {
    theme,
    toggleTheme: async () => await update({ theme: theme === "light" ? "dark" : "light" }),
    globalClassName: cn(
      theme,
      globalFontClassName
    )
  };
}
