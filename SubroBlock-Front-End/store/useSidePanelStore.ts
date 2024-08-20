import { create } from "zustand";

export type TPanelType =
  | null
  | "createOffer"
  | "offerDetails"
  | "createUser"
  | "changePassword"
  | "changeOrganizationRootPassword"
  | "viewFiles"
  | "createTransaction"
  | "createOrg"
  | "createResponse"
  | "createSupportTicket"
  | "userDetails"
  | "createArbitrator";

interface StatePanel {
  open: boolean | false;
  type: TPanelType;
}

interface ActionsPanel {
  setOpenPanel: (newOpenedPanelType: TPanelType) => void;
}

const INITIAL_DATA: StatePanel = {
  open: false,
  type: null
};
export const useSidePanelStore = create<StatePanel & ActionsPanel>((set) => ({
  ...INITIAL_DATA,
  setOpenPanel: (panelTypeToOpen) => set(() => {
    if (panelTypeToOpen)
      return ({ open: true, type: panelTypeToOpen })

    // don't reset panel type so no flickering when closing. it has animation
    return ({ open: false })
  })
}));
