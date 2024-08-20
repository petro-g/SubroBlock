"use client";
import { useSession } from "next-auth/react";
import { IUserBase } from "@/store/types/user";

// client can get jwt info from hook useSession()
// server can get same info from getToken({ req }), but it is not hook and requires request to exist
const useCurrentUser = () => {
  const { data } = useSession();
  // if (typeof window !== "undefined")
  //   console.log(data);
  return data?.user as (IUserBase | null); // returns null if not authorized
}

export default useCurrentUser;
