import React from "react";
import CreateOffer_PanelContent from "@/components/shared/SidePanel/Content/CreateOffer_PanelContent";
import CreateOrg_PanelContent from "@/components/shared/SidePanel/Content/CreateOrg_PanelContent";
import CreateResponse_PanelContent from "@/components/shared/SidePanel/Content/CreateResponse_PanelContent";
import CreateTransaction_PanelContent from "@/components/shared/SidePanel/Content/CreateTransaction_PanelContent";
import CreateUser_PanelContent from "@/components/shared/SidePanel/Content/CreateUser_PanelContent";
import CurrentUserChangePassword_PanelContent from "@/components/shared/SidePanel/Content/CurrentUserChangePassword_PanelContent";
import { OfferDetails_PanelContent } from "@/components/shared/SidePanel/Content/OfferDetails_PanelContent/OfferDetails_PanelContent";
import OrganizationChangeRootPassword_PanelContent from "@/components/shared/SidePanel/Content/OrganizationChangeRootPassword_PanelContent";
import DetailsUser_PanelContent from "@/components/shared/SidePanel/Content/UserDetails_PanelContent/UserDetails_PanelContent";
import { FilesView_PanelHeader } from "@/components/shared/SidePanel/Header/FilesView_PanelHeader";
import OfferFiles_PanelContent from "@/components/shared/UploadFile/OfferFiles_PanelContent";
import { TPanelType } from "@/store/useSidePanelStore";

export interface ISidePanelContent {
  title?: string;
  header?: () => React.ReactNode;
  content: () => React.ReactNode;
  type: TPanelType;
}

export const SIDE_PANEL_CONTENTS: ReadonlyArray<ISidePanelContent> = [
  {
    title: "Create Offer",
    content: CreateOffer_PanelContent,
    type: "createOffer"
  },
  {
    title: "Files View",
    content: OfferFiles_PanelContent,
    type: "viewFiles"
  },
  {
    title: "Change Password",
    content: CurrentUserChangePassword_PanelContent,
    type: "changePassword"
  },
  {
    title: "Change Root Password",
    content: OrganizationChangeRootPassword_PanelContent,
    type: "changeOrganizationRootPassword"
  },
  {
    title: "Offer Details",
    header: FilesView_PanelHeader,
    content: OfferDetails_PanelContent,
    type: "offerDetails"
  },
  {
    content: DetailsUser_PanelContent,
    type: "userDetails"
  },
  {
    title: "Create Transaction",
    content: CreateTransaction_PanelContent,
    type: "createTransaction"
  },
  {
    title: "Create Organization",
    content: CreateOrg_PanelContent,
    type: "createOrg"
  },
  {
    title: "Create User",
    content: CreateUser_PanelContent,
    type: "createUser"
  },
  {
    title: "Create Arbitrator",
    content: CreateUser_PanelContent,
    type: "createArbitrator"
  },
  {
    title: "Create Response",
    content: CreateResponse_PanelContent,
    type: "createResponse"
  },
  {
    title: "Create Ticket",
    content: () => "todo",
    type: "createSupportTicket"
  }
] as const;
