import { ResponseAPI } from "@/lib/fetchAPI";
import { IFetchPaginationParams } from "@/store/types/_common";

export type TUserRole = "admin" | "arbitrator" | "org_root" | "org_user";

export interface IUserBase {
  email: string;                // required
  firstName: string;            // required
  lastName: string;             // required
  hasKeyAssigned: boolean;      // required
  organization?: {               // from which org the user in. only admin can see this from in other users
    organizationId: number;
    name: string;
    rootUserEmail: string;      // who is owner of org
  };

  roles: TUserRole[];           // roles of current user, but can't see other users' roles
}

// admin -> root user -> org user
// root user or org user, as seen by admin or by root user
export interface IUser extends Omit<IUserBase, "roles"> {
  userId: number;
  status: "ACTIVE" | "SUSPENDED";
  loggedAt: string | null; // if never logged in, this will be null
  createdAt: string;
}

export interface IFetchUsersResponse {
  count: number; // total number of users
  next: string | null; // link to next page
  previous: string | null; // link to previous page
  data: IUser[]; // users on this page
}

export interface IFetchUserResponse {
  success: boolean;
  message: "";
  data: IUser;
}

export interface IFetchUsersParams extends IFetchPaginationParams {
  organizationId?: number;
  hasKeyAssigned?: boolean;
  status?: IUser["status"];
  search: string;
}

export interface ICurrentUserActivityCount {
  draftReceivedOfferResponses: number;
  draftSentOffers: number;
  pendingReceivedOffers: number;
  pendingSentOffers: number;
  signedReceivedOfferResponses: number;
  signedSentOffers: number;
}

export interface IFetchCurrentUserActivityCountResponse {
  success: boolean;
  message: "";
  data: ICurrentUserActivityCount;
}

export interface IUsersStore {
  users: IUser[] | null; // null means we haven't fetched users yet, empty array means no users
  count: number;
  lastFetchParams: IFetchUsersParams; // after mutations, we need to re-fetch users from same page
  selectedUser: IUser | null;
  currentUserActivityCounts: ICurrentUserActivityCount | null;
}

export interface IUsersStoreActions {
  fetchUsers: (
    currentUser: IUserBase,
    isArbitratorsPage: boolean,
    fetchParams: IFetchUsersParams
  ) => void;
  createUser: (
    currentUser: IUserBase,
    email: string,
    password: string,
    organizationId: number,
    firstName?: string,
    lastName?: string,
    isArbitratorsPage?: boolean
  ) => Promise<ResponseAPI>;
  suspendUser: (
    user: Pick<IUser, "userId" | "status">,
    isArbitratorsPage: boolean,
    currentUser: IUserBase
  ) => void;
  fetchUserDetails: (
    currentUser: IUserBase,
    user: Pick<IUser, "userId">
  ) => void;
  setSelectedUser: (user: IUser) => void;
  fetchCurrentUserActivityCount: () => void;
}

export const INITIAL_USERS_STORE_DATA: IUsersStore = {
  users: null,
  count: 0,
  lastFetchParams: {
    page: 1,
    pageSize: 10,
    organizationId: undefined,
    hasKeyAssigned: undefined,
    search: "",
    sort: "",
    order: "asc"
  },
  selectedUser: null,
  currentUserActivityCounts: null
};
