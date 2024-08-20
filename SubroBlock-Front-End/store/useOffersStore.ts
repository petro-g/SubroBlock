import { create } from "zustand";
import {
  URL_GET_ADMIN_OFFERS, URL_GET_ARBITRATION_HISTORY_OFFERS, URL_GET_ARBITRATION_OFFERS,
  URL_GET_OFFERS,
  URL_GET_OFFERS_HISTORY,
  URL_GET_RECEIVED_OFFERS, URL_GET_RECEIVED_OFFERS_HISTORY,
  URL_POST_OFFERS,
  URL_TEMPLATE_ADMIN_CANCEL_OFFER,
  URL_TEMPLATE_POST_RECEIVED_OFFERS, URL_TEMPLATE_SIGN_OFFER, URL_TEMPLATE_SIGN_OFFER_RESPONSE
} from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { currentUserHasSomeRoles } from "@/lib/utils";
import {
  IFetchOffersResponse,
  INITIAL_OFFERS_STORE_DATA,
  IOffersStore,
  IOffersStoreActions
} from "@/store/types/offers";

export const useOffersStore = create<IOffersStore & IOffersStoreActions>(
  (set, get) => {
    return {
      ...INITIAL_OFFERS_STORE_DATA,
      fetchOffers: async (config) => {
        const { currentUser, isReceivedOffers, isOffersHistory, fetchParams } = config;
        const { page, pageSize, search, inDraft, sort, order } = (fetchParams || {});

        const params = new URLSearchParams({
          page: page?.toString(),
          pageSize: pageSize?.toString()
        });

        // only user can see drafts
        if (currentUserHasSomeRoles(currentUser, ["org_user"]))
          params.append("inDraft", (inDraft || false).toString());

        if (sort) {
          params.append("sort", sort);
          params.append("order", order);
        }

        if (search)
          params.append("search", search);

        const isAdmin = currentUserHasSomeRoles(currentUser, ["admin"]);
        const isArbitrator = currentUserHasSomeRoles(currentUser, ["arbitrator"]);

        const url = (() => {
          if (isArbitrator)
            return isOffersHistory ? URL_GET_ARBITRATION_HISTORY_OFFERS : URL_GET_ARBITRATION_OFFERS;

          if (isOffersHistory)
            return isReceivedOffers ? URL_GET_RECEIVED_OFFERS_HISTORY : URL_GET_OFFERS_HISTORY;

          if (isAdmin) return URL_GET_ADMIN_OFFERS;

          return isReceivedOffers ? URL_GET_RECEIVED_OFFERS : URL_GET_OFFERS;
        })();

        const { ok, data } = await fetchAPI<IFetchOffersResponse>(
          url + "?" + params,
          { method: "GET" },
          { errorToast: { title: "Error fetching offers" } }
        );

        if (ok)
          set({
            offers: data.data || [],
            count: data.count,
            lastFetchParams: fetchParams
          });
        else
          set({ offers: [], count: 0 });
      },
      createOffer: async (currentUser, newOffer) => {
        const response = await fetchAPI(
          URL_POST_OFFERS,
          {
            method: "POST",
            body: JSON.stringify(newOffer)
          },
          { successToast: { title: "Offer created" } }
        );

        if (response.ok) await get().fetchOffers({ currentUser, fetchParams: get().lastFetchParams });

        return response;
      },
      createResponse: async (currentUser, offerId, responseAmount) => {
        const response = await fetchAPI(
          URL_TEMPLATE_POST_RECEIVED_OFFERS(offerId),
          {
            method: "POST",
            body: JSON.stringify({ responseAmount })
          },
          { successToast: { title: "Response created" } }
        );

        if (response.ok) await get().fetchOffers({ currentUser, fetchParams: get().lastFetchParams, isReceivedOffers: true })

        return response;
      },
      setSelectedOffer: (offer) => set({ selectedOffer: offer }),
      cancelOffer: async (currentUser, offer) => {
        const response = await fetchAPI(
          URL_TEMPLATE_ADMIN_CANCEL_OFFER(offer.id),
          { method: "PUT" },
          { successToast: { title: "Offer canceled" } }
        );
        if (response.ok) await get().fetchOffers({ currentUser, fetchParams: get().lastFetchParams });

        return response;
      },
      signOffer: async (currentUser, offer) => {
        const response = await fetchAPI(
          URL_TEMPLATE_SIGN_OFFER(offer.id),
          { method: "POST" },
          { successToast: { title: "Offer signed" } }
        );

        if (response.ok) await get().fetchOffers({ currentUser, fetchParams: get().lastFetchParams });

        return response;
      },
      signOfferResponse: async (currentUser, offer) => {
        const response = await fetchAPI(
          URL_TEMPLATE_SIGN_OFFER_RESPONSE(offer.response?.responseId || 0),
          { method: "POST" },
          { successToast: { title: "Offer signed" } }
        );

        if (response.ok) await get().fetchOffers({
          currentUser,
          fetchParams: get().lastFetchParams,
          isReceivedOffers: true // can respond only to received offers
        });

        return response;
      }
    };
  }
);
