import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";
import {
  URL_ADMIN_CREATE_ARBITRATOR_USER,
  URL_ADMIN_CREATE_USER, URL_ADMIN_GET_ARBITRATORS,
  URL_ADMIN_GET_USERS,
  URL_GET_CURRENT_USER_ACTIVITY_COUNT,
  URL_ROOT_CREATE_USER,
  URL_ROOT_GET_USERS,
  URL_TEMPLATE_ADMIN_GET_USER,
  URL_TEMPLATE_ADMIN_SUSPEND_USER,
  URL_TEMPLATE_ROOT_GET_USER, URL_TEMPLATE_ROOT_SUSPEND_USER
} from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { currentUserHasSomeRoles } from "@/lib/utils";
import {
  IFetchCurrentUserActivityCountResponse,
  IFetchUserResponse,
  IFetchUsersResponse,
  INITIAL_USERS_STORE_DATA,
  IUser,
  IUsersStore,
  IUsersStoreActions
} from "@/store/types/user";

export const useUsersStore =
  create<IUsersStore & IUsersStoreActions>((set, get) => ({
    ...INITIAL_USERS_STORE_DATA,
    fetchUsers: async (currentUser, isArbitratorsPage, fetchParams) => {
      const {
        page,
        pageSize,
        organizationId,
        hasKeyAssigned,
        search,
        sort,
        order,
        status
      } = fetchParams;

      const isAdmin = currentUserHasSomeRoles(currentUser, ["admin"]);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (isAdmin && organizationId)
        params.append("organizationId", organizationId.toString());

      if (hasKeyAssigned !== undefined)
        params.append("hasKeyAssigned", hasKeyAssigned.toString());

      if (search)
        params.append("search", search);

      if (sort) {
        params.append("sort", sort);
        params.append("order", order);
      }

      if (status)
        params.append("status", status);

      const url = (() => {
        if (isArbitratorsPage)
          return URL_ADMIN_GET_ARBITRATORS;

        return isAdmin
          ? URL_ADMIN_GET_USERS
          : URL_ROOT_GET_USERS;
      })();

      const { data } = await fetchAPI<IFetchUsersResponse>(
        url + "?" + params,
        { method: "GET" },
        { errorToast: { title: "Error fetching users" } }
      );

      if (data)
        set({
          users: data.data || [],
          count: data.count,
          lastFetchParams: fetchParams
        });
      else
        set({
          users: [],
          count: 0
        });
    },
    createUser: async (currentUser, email, password, organizationId, firstName, lastName, isArbitratorUser) => {
      const isAdmin = currentUserHasSomeRoles(currentUser, ["admin"]);

      // admin needs to select org, root user creates in his only org
      if (isAdmin && !isArbitratorUser && organizationId <= -1) {
        toast({
          variant: "error",
          title: "Error",
          description: "Please select an existing organization"
        });

        return { ok: false, error: "No organization selected", data: {} };
      }

      let url: string;
      if (isAdmin) {
        if (isArbitratorUser)
          url = URL_ADMIN_CREATE_ARBITRATOR_USER;
        else
          url = URL_ADMIN_CREATE_USER;
      } else
        url = URL_ROOT_CREATE_USER;

      const response = await fetchAPI(url, {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          organizationId,
          firstName,
          lastName
        })
      }, {
        successToast: {
          title: isArbitratorUser
            ? "Arbitrator user has been successfully created"
            : "User has been successfully created"
        },
        errorToast: { title: "Error creating user" }
      });

      // update users list after creating user
      if (response.ok)
        get().fetchUsers(currentUser, isArbitratorUser || false, get().lastFetchParams);

      return response;
    },
    suspendUser: async (user, isArbitratorUser, currentUser) => {
      const userId = user.userId;

      const userNewStatus = user.status.toUpperCase() === "ACTIVE" ? "SUSPENDED" : "ACTIVE" as IUser["status"];

      const url = currentUserHasSomeRoles(currentUser, ["admin"])
        ? URL_TEMPLATE_ADMIN_SUSPEND_USER(userId)
        : URL_TEMPLATE_ROOT_SUSPEND_USER(userId);

      const response = await fetchAPI(url, {
        method: "PUT",
        body: JSON.stringify({ status: userNewStatus })
      },
      {
        successToast: { title: `User ${userNewStatus === "ACTIVE"  ? "unsuspended" : "suspended"}` },
        errorToast: { title: "Error suspending user" }
      });

      if (response.ok)
        get().fetchUsers(currentUser, isArbitratorUser, get().lastFetchParams);

      return response;
    },
    setSelectedUser: (user) => set({ selectedUser: user }),
    fetchUserDetails: async (currentUser, user) => {
      const isAdmin = currentUserHasSomeRoles(currentUser, ["admin"]);

      const url = isAdmin
        ? URL_TEMPLATE_ADMIN_GET_USER(user.userId)
        : URL_TEMPLATE_ROOT_GET_USER(user.userId);

      const { ok, data, ...rest } = await fetchAPI<IFetchUserResponse>(
        url,
        { method: "GET" },
        { errorToast: { title: "Error fetching user details" } }
      );

      if (ok)
        set({ selectedUser: data.data });

      return { ok, data, ...rest };
    },
    fetchCurrentUserActivityCount: async () => {
      const { ok, data } = await fetchAPI<IFetchCurrentUserActivityCountResponse>(
        URL_GET_CURRENT_USER_ACTIVITY_COUNT,
        { method: "GET" },
        // { errorToast: { title: "Error fetching user activity counts" } }
        { errorToast: false }
      );

      if (ok)
        set({ currentUserActivityCounts: data.data });
      else
        set({ currentUserActivityCounts: null });
    }
  }))
