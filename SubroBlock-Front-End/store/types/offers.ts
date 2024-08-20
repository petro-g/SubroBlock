import { ResponseAPI } from "@/lib/fetchAPI";
import { IFetchPaginationParams } from "@/store/types/_common";
import { IOfferFile } from "@/store/types/offerFiles";
import { IUserBase } from "@/store/types/user";

export interface IOffer {
  id: number; // TODO rename backend to offerId for consistency with other interfaces
  status:
    | "0/2 keys"      // no-one signed
    | "1/2 keys"      // one signed
    | "Signed"        // both signed
    | "AP1"           // agreed price from 1st attempt
    | "AP2"           // agreed price from 2nd attempt
    | "AP3"           // agreed price from 3rd attempt
    | "Arbitration"   // arbitrator user must judge the offer after 3 failed attempts
    | "Cancelled";     // offer was cancelled

  responderCompany: string;
  issuerCompanyId: number;
  issuerCompany: string;
  responderCompanyId: number;

  offerVehicleVin: string;
  offerVehicleVinId: number;
  responderVehicleVin: string;
  responderVehicleVinId?: string;

  dateOfOffer: string;
  arbitrationMethod: "Manual" | "AI"; // TODO add more types
  offerAmount: string;
  accidentDate: string;
  modifiedDate: string; // FIXME fix backend to camelCase
  priorResponseAmount: number | null;
  failedResponses: number;
  cycleTime: number | null;
  cycleTimeDurDecimal: number | null;

  // only used to creating offer?
  publicOfferAmount: string;
  secretOfferAmount: string;

  // my offer
  responseAmount: number | null;
  signatures?: { signedAt: string; signedBy: IUserBase["email"]; }[];
  signedByMe: boolean;

  // their offer
  response?: {
    responseId: number;
    status: IOffer["status"];
    responseAmount: string;
    responseSignedByMe: IOffer["signedByMe"];
    responseSignatures: IOffer["signatures"];
  },
  arbitratedAmount: string | null;
}

export type IOffersHistory = IOffer;

export interface IFetchOffersResponse {
  success: boolean;
  message: string;
  data: IOffer[];
  count: number;
}

export interface IFetchOffersHistoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  data: IOffersHistory[];
}

export interface IOfferFetchParams extends IFetchPaginationParams {
  responderCompany?: string;
  status?: IOffer["status"];
  inDraft?: boolean;
}

export interface IFetchOfferFileSignedUrl {
  url: string;
  key: IOfferFile["key"];
  uuid: IOfferFile["uuid"];
}

export interface IOffersStore {
  offers: IOffer[] | null;
  count: number;
  selectedOffer: IOffer | null;
  lastFetchParams: IOfferFetchParams;
}

export interface IOffersStoreActions {
  fetchOffers: (config: {
    currentUser: IUserBase
    isReceivedOffers?: boolean,
    isOffersHistory?: boolean,
    fetchParams: IOfferFetchParams
  }) => Promise<void>;
  setSelectedOffer: (offer: IOffer) => void;
  createResponse: (
    currentUser: IUserBase,
    offerId: number,
    responseAmount: string
  ) => Promise<ResponseAPI>;
  createOffer: (
    currentUser: IUserBase,
    newOffer: Pick<
      IOffer,
      | "responderCompany"
      | "accidentDate"
      | "offerVehicleVin"
      | "responderVehicleVin"
      | "publicOfferAmount"
      | "secretOfferAmount"
    >
  ) => Promise<ResponseAPI>;
  cancelOffer: (
    currentUser: IUserBase,
    offer: Pick<IOffer, "id">
  ) => Promise<ResponseAPI>;
  signOffer: (
    currentUser: IUserBase,
    offer: Pick<IOffer, "id">
  ) => Promise<ResponseAPI>;
  signOfferResponse: (
    currentUser: IUserBase,
    offer: Pick<IOffer, "response">
  ) => Promise<ResponseAPI>;
}

export const INITIAL_OFFERS_STORE_DATA: IOffersStore = {
  offers: null,
  count: 0,
  selectedOffer: null,
  lastFetchParams: {
    page: 1,
    pageSize: 10,
    responderCompany: undefined,
    search: "",
    order: "asc",
    sort: "",
    inDraft: false
  }
};
