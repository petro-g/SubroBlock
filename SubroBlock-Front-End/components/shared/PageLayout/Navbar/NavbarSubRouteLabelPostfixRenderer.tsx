import { IPageRoute, IPageSubRoute } from "@/lib/constants/page-routes";
import { useUsersStore } from "@/store/useUsersStore";

// labels of sub-routes are static and do not change
// but rarely some text is dynamic and on client
// this handles exceptions
export const NavbarSubRouteLabelPostfixRenderer = ({ route, subRoute }: { route: IPageRoute; subRoute: IPageSubRoute }) => {
  const { currentUserActivityCounts } = useUsersStore();

  if (route.href === "/offers") {
    if ("" === subRoute.href) {
      return ` ${currentUserActivityCounts ? currentUserActivityCounts.pendingSentOffers : ""}`;
    } else if ("/received" === subRoute.href) {
      return ` ${currentUserActivityCounts ? currentUserActivityCounts.pendingReceivedOffers : ""}`;
    }
  }

  return "";
}
