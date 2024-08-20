import { IUser } from "@/store/types/user";

export interface IOrganization {
  id: number;
  company: string;
  status: "ACTIVE" | "SUSPENDED";
  rootUserEmail: string;
  subroCoins: number;
  subroOffers: number;
  users: [
    // backend returns this mess, yes. refactor to proper user if needed
    IUser["firstName"][], // array of names
    number // count of users
  ]
}

export interface IFetchOrganizationsResponse {
  count: number; // total number of users
  next: string | null; // link to next page
  previous: string | null; // link to previous page
  data: IOrganization[]; // organizations on this page
}
