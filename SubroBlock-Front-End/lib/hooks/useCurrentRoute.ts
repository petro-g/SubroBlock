import { useRouter } from "next/router";
import { useMemo } from "react";
import { IPageRoute, IPageSubRoute, PageRoutes } from "@/lib/constants/page-routes";

interface ICurrentRoute extends Omit<IPageRoute, "subRoutes"> {
  // subRoutes: undefined; // use subItem instead. only 1 subItem is selected or none
  subRoute: IPageSubRoute | null; // filled or empty, only 1 subItem is selected or none
}

// get info about current page, route, href, label
export default function useCurrentRoute() {
  const router = useRouter();
  return useMemo(() => {
    const route = PageRoutes.find((item) =>
      item.href === router.asPath
        || item.subRoutes?.some(child => item.href + child.href === router.asPath)
    );

    const subRoute = route?.subRoutes?.find(child => route.href + child.href === router.asPath) || null;

    return {
      ...route,
      subRoute,
      subRoutes: undefined
    } as ICurrentRoute;

    // remove
  }, [router.asPath]);
}
