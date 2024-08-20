import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { IUser } from "@/store/types/user";

const BadgeUserStatus = ({ user, ...rest }: {
  user: Pick<IUser, "status">
} & React.HTMLAttributes<HTMLDivElement>) =>
  <Badge
    variant={user.status?.toUpperCase() === "ACTIVE" ? "success" : "default"}
    {...rest}
  >
    <div
      className="w-2 h-2 bg-current rounded-full mr-1 border border-background"
    />
    {user.status}
  </Badge>

export { BadgeUserStatus };
