import { type ClassValue, clsx } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";
import { IUserBase, TUserRole } from "@/store/types/user";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currentUserHasSomeRoles = (currentUser: IUserBase | null, roles: TUserRole[]) => Boolean(currentUser?.roles?.some((role) => roles.includes(role)));

export const getUserInitials = (user: Pick<IUserBase, "email" | "firstName" | "lastName"> | null) => {
  if (!user) return "??";

  if (Boolean(user.firstName) && Boolean(user.lastName)) {
    return `${user.firstName[0]}${user.lastName[0]}`;
  }

  // first to letters of email, but not symbols. use regex
  return user.email?.replace(/[^a-zA-Z]/g, "").slice(0, 2);
}

export const getUserFullNameOrEmail = (user: Pick<IUserBase, "firstName" | "lastName" | "email"> | null) => {
  if (!user) return "??";

  if (Boolean(user.firstName) && Boolean(user.lastName)) {
    return `${user.firstName} ${user.lastName}`;
  }

  return user.email;
}

export const isClickedInsideCurrentTarget = (e: React.MouseEvent) => {
  let target = e.target as HTMLElement;
  while (target && target !== e.currentTarget) {
    if (target === e.currentTarget) break;
    target = target.parentElement!;
  }
  return target === e.currentTarget;
}

export const pluralize = (count: number, singular: string, plural: string) => count === 1 ? singular : plural;

