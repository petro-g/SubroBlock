import { useMemo } from "react";
import useCurrentRoute from "@/lib/hooks/useCurrentRoute";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { currentUserHasSomeRoles } from "@/lib/utils";

// Returns details of what kind offer page is opened
// e.g. Arbitrator can open offers on Arbitrating Queue page
// But also can see history page
// also offers can be sent/received
// So we have 3 kinds of filters for offer page
const useOfferPageTypeDetails = () => {
  const currentRoute = useCurrentRoute();
  const currentUrl = useCurrentUser();

  return useMemo(() => {
    const isReceivedOffers = currentRoute.subRoute?.href === "/received";

    const isArbitratingOffers = currentUserHasSomeRoles(currentUrl, ["arbitrator"]);

    const isOffersHistory = currentRoute?.href === "/history";

    return {
      isReceivedOffers,
      isArbitratingOffers,
      isOffersHistory
    }
  }, [currentRoute, currentUrl]);
}

export default useOfferPageTypeDetails;
