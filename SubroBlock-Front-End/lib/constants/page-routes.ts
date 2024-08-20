import { StaticImageData } from "next/image";
import DefaultChatIcon from "@/public/chat-default.svg";
import OrangeChatIcon from "@/public/chat-orange.svg";
import DefaultClockIcon from "@/public/clock-default.svg";
import OrangeClockIcon from "@/public/clock-orange.svg";
import DefaultFileIcon from "@/public/file-default.svg";
import OrangeFileIcon from "@/public/file-orange.svg";
import DefaultKeyIcon from "@/public/key-default.svg";
import OrangeKeyIcon from "@/public/key-orange.svg";
import DefaultMailIcon from "@/public/mail-default.svg";
import OrangeMailIcon from "@/public/mail-orange.svg";
import QuestionMark from "@/public/question-mark.svg";
import DefaultUsersIcon from "@/public/users-default.svg";
import OrangeUsersIcon from "@/public/users-orange.svg";
import DefaultWalletIcon from "@/public/wallet-default.svg";
import OrangeWalletIcon from "@/public/wallet-orange.svg";
import { TUserRole } from "@/store/types/user";
// import { NavbarOfferSubRouteRenderer } from "@/components/shared/PageLayout/LeftNavbar/LeftNavbarSubRouteRenderers";

export interface IPageRoute {
  label: string;
  subRoutes?: IPageSubRoute[];
  href: string;
  icon?: StaticImageData;
  iconSelected?: StaticImageData;
  requiredRoles: TUserRole[];

  bottomPlacement?: boolean;
  // delete when all pages implemented
  notImplemented?: boolean;
}

export type IPageSubRoute = Omit<IPageRoute, "subRoutes">;

export const PageRoutes: ReadonlyArray<IPageRoute> = [
  {
    label: "ActionsQueue",
    href: "/actions",
    icon: DefaultFileIcon,
    iconSelected: OrangeFileIcon,
    requiredRoles: ["admin"],
    notImplemented: true
  },
  {
    label: "Arbitration Queue",
    href: "/arbitration",
    icon: DefaultFileIcon,
    iconSelected: OrangeFileIcon,
    requiredRoles: ["arbitrator"]
  },
  {
    label: "SubroOffers",
    href: "/offers",
    subRoutes: [
      {
        label: "My SubroOffers",
        href: "", // same as parent
        requiredRoles: ["org_user"]
      },
      {
        label: "Received SubroOffers",
        href: "/received",
        requiredRoles: ["org_user"]
      }
    ],
    icon: DefaultFileIcon,
    iconSelected: OrangeFileIcon,
    requiredRoles: ["admin", "org_user"]
  },
  {
    label: "SubroOrgs",
    href: "/orgs",
    icon: DefaultFileIcon,
    iconSelected: OrangeFileIcon,
    requiredRoles: ["admin"]
  },
  {
    label: "SubroUsers",
    href: "/users",
    icon: DefaultUsersIcon,
    iconSelected: OrangeUsersIcon,
    requiredRoles: ["admin", "org_root"]
  },
  {
    label: "Arbitrators",
    href: "/arbitrators",
    icon: DefaultUsersIcon,
    iconSelected: OrangeUsersIcon,
    requiredRoles: ["admin"]
  },
  {
    label: "SubroMessages",
    href: "/messages",
    icon: DefaultMailIcon,
    iconSelected: OrangeMailIcon,
    requiredRoles: ["admin", "org_user"]
  },
  {
    label: "SubroChat",
    href: "/chat",
    icon: DefaultChatIcon,
    iconSelected: OrangeChatIcon,
    requiredRoles: ["admin", "org_user"]
  },
  {
    label: "SubroBlock",
    href: "/block",
    icon: DefaultClockIcon,
    iconSelected: OrangeClockIcon,
    requiredRoles: ["admin"],
    notImplemented: true
  },
  {
    label: "SubroCoin",
    href: "/coins",
    icon: DefaultClockIcon,
    iconSelected: OrangeClockIcon,
    requiredRoles: ["admin"],
    notImplemented: true
  },
  {
    label: "SubroKeys",
    href: "/keys",
    icon: DefaultKeyIcon,
    iconSelected: OrangeKeyIcon,
    requiredRoles: ["org_root"],
    notImplemented: true
  },
  {
    label: "SubroWallet",
    href: "/wallet",
    icon: DefaultWalletIcon,
    iconSelected: OrangeWalletIcon,
    requiredRoles: ["org_root"],
    notImplemented: true
  },
  {
    label: "History",
    href: "/history",
    icon: DefaultClockIcon,
    iconSelected: OrangeClockIcon,
    requiredRoles: ["org_user", "arbitrator"],
    subRoutes: [
      {
        label: "My SubroOffers",
        href: "", // same as parent
        requiredRoles: ["org_user"]
      },
      {
        label: "Received SubroOffers",
        href: "/received",
        requiredRoles: ["org_user"]
      }
    ]
  },
  {
    label: "Performance",
    href: "/performance",
    icon: DefaultClockIcon,
    iconSelected: OrangeClockIcon,
    requiredRoles: ["org_user"],
    notImplemented: true
  },

  {
    label: "StoryBook",
    href: process.env.NEXT_PUBLIC_DEV_STORYBOOK_URL || "/404",
    icon: DefaultClockIcon,
    iconSelected: OrangeClockIcon,
    requiredRoles: ["admin"],
    bottomPlacement: true
  },
  {
    label: "Help Center",
    href: "/support",
    icon: QuestionMark,
    iconSelected: QuestionMark,
    requiredRoles: ["admin", "org_user", "arbitrator", "org_root"],
    bottomPlacement: true
  }
] as const;
