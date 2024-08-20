"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import { Toolbar } from "../PageLayout/Toolbar";
import {
  ITicket,
  SupportTicketItem
} from "./SupportTicketItem/SupportTicketItem";
import { SupportTicketView } from "./SupportTicketView/SupportTicketView";

const mockTikets: ITicket[] = [
  {
    id: "fsd3r",
    originalName: "Original Name",
    userName: "Jane Cooper",
    severity: "High",
    createdAt: "18 Jun 2024",
    status: "Pending"
  },
  {
    id: "fsfsdfd",
    originalName: "Original Name",
    userName: "Dave Cavin",
    severity: "High",
    createdAt: "18 Jun 2024",
    status: "Pending"
  },
  {
    id: "fsfsdfd",
    originalName: "Original Name",
    userName: "Gonzo Velt",
    severity: "Medium",
    createdAt: "18 Jun 2024",
    status: "Pending"
  },
  {
    id: "ffssfsd3r",
    originalName: "Original Name",
    userName: "Sarah Voke",
    severity: "Low",
    createdAt: "18 Jun 2024",
    status: "Pending"
  }
];

export default function SupportTicketComponent() {
  const [ticket, setTicket] = useState<null | ITicket>(null);
  const { setOpenPanel } = useSidePanelStore();

  return (
    <div>
      <Toolbar extraButtons={
        <Button onClick={() => setOpenPanel("createSupportTicket")}>
          Create Ticket
        </Button>} />
      {ticket ? (
        <SupportTicketView ticket={ticket} />
      ) : (
        <div className="flex flex-col gap-1">
          {mockTikets.map((ticket: ITicket, index: number) => (
            <SupportTicketItem
              key={ticket?.id + index}
              item={ticket}
              onViewClick={() => setTicket(ticket)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
