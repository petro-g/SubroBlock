import { create } from "zustand";
import {
  URL_CREATE_ORGANIZATIONS,
  URL_GET_ORGANIZATIONS,
  URL_ORGANIZATIONS_UPDATE_ROOT_USER_PASSWORD,
  URL_TEMPLATE_ORGANIZATIONS_SET_STATUS
} from "@/lib/constants/api-urls";
import fetchAPI, { ResponseAPI } from "@/lib/fetchAPI";
import { IFetchPaginationParams } from "@/store/types/_common";
import {
  IFetchOrganizationsResponse,
  IOrganization
} from "@/store/types/organization";

interface IFetchOrganizationsParams extends IFetchPaginationParams {
  organizationName: string;
}

interface IOrganizationsStore {
  organizations: IOrganization[] | null;
  count: number;
  lastFetchParams: IFetchOrganizationsParams;
}

interface IOrganizationsStoreActions {
  fetchOrganizations: (fetchParams: IFetchOrganizationsParams) => void;
  createOrganization: (
    organizationName: string,
    rootUserEmail: string,
    rootUserPassword: string
  ) => Promise<ResponseAPI>;
  changeStatus: (
    organizationId: number,
    organizationStatus: string
  ) => Promise<ResponseAPI>;
  changeRootPassword: (
    organizationId: string,
    newPassword: string
  ) => Promise<ResponseAPI>;
}

const INITIAL_STORE_DATA: IOrganizationsStore = {
  organizations: null,
  count: 0,
  lastFetchParams: {
    page: 1,
    pageSize: 10,
    organizationName: "",
    sort: "",
    order: "asc",
    search: ""
  }
};

export const useOrganizationsStore = create<
  IOrganizationsStore & IOrganizationsStoreActions
>((set, get) => ({
  ...INITIAL_STORE_DATA,
  fetchOrganizations: async (fetchParams) => {
    const { page, pageSize, organizationName = "", order, sort } = fetchParams;

    const params = new URLSearchParams({
      page: organizationName.length ? "1" : page.toString(),
      pageSize: pageSize.toString(),
      name: organizationName
    });

    if (sort) {
      params.append("sort", sort);
      params.append("order", order);
    }

    const { ok, data } = await fetchAPI<IFetchOrganizationsResponse>(
      URL_GET_ORGANIZATIONS + "?" + params,
      { method: "GET" },
      { errorToast: { title: "Error fetching organizations" } }
    );

    if (ok) {
      set({
        organizations: data.data || [],
        count: data.count,
        lastFetchParams: fetchParams
      });
    } else {
      set({ organizations: [], count: 0 });
    }
  },
  createOrganization: async (
    organizationName,
    rootUserEmail,
    rootUserPassword
  ) => {
    const response = await fetchAPI(
      URL_CREATE_ORGANIZATIONS,
      {
        method: "POST",
        body: JSON.stringify({
          organizationName,
          rootUserEmail,
          rootUserPassword
        })
      },
      {
        successToast: { title: "Success creating organization" },
        errorToast: { title: "Error creating organization" }
      }
    );

    if (response.ok) get().fetchOrganizations(get().lastFetchParams);

    return response;
  },
  changeRootPassword: async (organizationId, newPassword) => {
    const response = await fetchAPI(
      URL_ORGANIZATIONS_UPDATE_ROOT_USER_PASSWORD,
      {
        method: "POST",
        body: JSON.stringify({
          organizationId,
          newPassword
        })
      },
      {
        successToast: { title: "Success changing root password" },
        errorToast: { title: "Error changing root password" }
      }
    );

    if (response.ok) get().fetchOrganizations(get().lastFetchParams);

    return response;
  },
  changeStatus: async (organizationId, organizationStatus) => {
    const response = await fetchAPI(
      URL_TEMPLATE_ORGANIZATIONS_SET_STATUS(organizationId),
      {
        method: "PUT",
        body: JSON.stringify({
          status: organizationStatus
        })
      },
      {
        successToast: { title: "Success changing status" },
        errorToast: { title: "Error changing status" }
      }
    );

    if (response.ok) get().fetchOrganizations(get().lastFetchParams);

    return response;
  }
}));
