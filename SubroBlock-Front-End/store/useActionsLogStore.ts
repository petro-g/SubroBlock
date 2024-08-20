import { create } from "zustand";
import { URL_TEMPLATE_ADMIN_GET_ACTIONS_LOG, URL_TEMPLATE_ROOT_GET_ACTIONS_LOG } from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { currentUserHasSomeRoles } from "@/lib/utils";
import { IActionsLogStore, IActionsLogStoreActions, IFetchActionsLogResponse } from "@/store/types/actions-log";

const INITIAL_STORE_DATA: IActionsLogStore = {
  actionLogs: null,
  logsTotalCount: 0,
  lastFetchParams: { pageSize: 10, page: 1, search: "", order: "asc", sort: "" }
};

export const useActionsLogStore = create<IActionsLogStore & IActionsLogStoreActions>((set) => ({
  ...INITIAL_STORE_DATA,
  fetchActionLogs: async (currentUser, user, fetchParams) => {
    const isAdmin = currentUserHasSomeRoles(currentUser, ["admin"]);

    const url = isAdmin
      ? URL_TEMPLATE_ADMIN_GET_ACTIONS_LOG(user.userId)
      : URL_TEMPLATE_ROOT_GET_ACTIONS_LOG(user.userId);

    const params = new URLSearchParams({
      pageSize: fetchParams?.pageSize.toString(),
      page: fetchParams?.page.toString(),
      search: fetchParams?.search || ""
    });

    const { ok, data } = await fetchAPI<IFetchActionsLogResponse>(
      url + "?" + params,
      { method: "GET" },
      { errorToast: { title: "Error fetching action logs" } }
    );

    if (ok)
      set({
        actionLogs: data.data || [],
        logsTotalCount: data.count,
        lastFetchParams: fetchParams
      } as Partial<IActionsLogStore>);
    else
      set({
        actionLogs: [],
        logsTotalCount: 0
      } as Partial<IActionsLogStore>);
  }
}));
