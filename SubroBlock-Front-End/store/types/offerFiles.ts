import { ResponseAPI } from "@/lib/fetchAPI";
import { IOffer } from "@/store/types/offers";

export interface IOfferFile {
  fileFormat: string;
  fileName: string;
  offerId: number;
  uuid: string;
  key: `${string}/${string}/${string}/${string}`; // generated as `orgId/offerId/uuid/fileType`
}

export interface IOffersStore {
  offerFiles: IOfferFile[] | null;
}

type TFileUploadHandler = (file: File, selectedOffer: IOffer, onProgressUpdateCallback: (progress: number) => void) => Promise<void>;

export interface IOfferFilesStoreActions {
  uploadAnySizeFile: TFileUploadHandler;
  uploadSmallFile: TFileUploadHandler;
  uploadBigFile: TFileUploadHandler;

  downloadFile: (file: IOfferFile, selectedOffer: IOffer, openNewTab?: boolean) => Promise<void>;
  deleteFile: (file: IOfferFile, selectedOffer: IOffer) => Promise<ResponseAPI>;

  fetchOfferFiles: (offerId: number, clearCache?: boolean) => Promise<void>;
  saveUploadedFileToOffer: (file: File, uuid: IOfferFile["uuid"], key: string, selectedOffer: IOffer) => Promise<void>;
}

export const INITIAL_OFFERS_STORE_DATA: IOffersStore = {
  offerFiles: null
}
