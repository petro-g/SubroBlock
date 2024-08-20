import { IFetchPaginationParams } from "@/store/types/_common";
import { IUser, IUserBase } from "@/store/types/user";

export interface IFetchActionsLogResponse {
  success: boolean;
  message: string;
  data: IActionsLog[];
  count: number;
}

export interface IActionsLog {
  actionId: number;
  type: "createOffer" | "signOffer" | "createResponse" | "signResponse" | "archiveOffer";
  date: string;
}

export interface IActionsLogStore {
  actionLogs: IActionsLog[] | null;
  logsTotalCount: number;
  lastFetchParams: IFetchPaginationParams;
}

export interface IActionsLogStoreActions {
  fetchActionLogs: (currentUser: IUserBase, user: Pick<IUser, "userId">, fetchParams: IFetchPaginationParams) => void;
}
