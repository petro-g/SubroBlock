import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import MoreSvg from "@/public/three-dots.svg";

export interface ITicket {
  id: string;
  originalName: string;
  userName: string;
  severity: "High" | "Medium" | "Low";
  createdAt: string;
  status: "Pending";
}

interface Props {
  item?: ITicket;
  onViewClick: () => void;
}

export const SupportTicketItem = ({ item, onViewClick }: Props) => {
  return (
    <div className="flex items-center gap-10 p-5 bg-background rounded-lg border text-sm">
      <div className="flex-1 flex items-center gap-5 justify-between">
        <span className="flex flex-col gap-1 text-secondary-foreground">
          Ticket ID:
          <span className="text-primary">{item?.id}</span>
        </span>
        <span className="flex flex-col gap-1 text-secondary-foreground">
          Severity:
          <span className="text-primary">{item?.severity}</span>
        </span>
        <span className="flex flex-col gap-1 text-secondary-foreground">
          Organization name:
          <span className="text-primary">{item?.originalName}</span>
        </span>
        <span className="flex flex-col gap-1 text-secondary-foreground">
          User name:
          <span className="text-primary">{item?.userName}</span>
        </span>
        <span className="flex flex-col gap-1 text-secondary-foreground">
          Date created:
          <span className="text-primary">{item?.createdAt}</span>
        </span>
        <span className="flex flex-col gap-1 text-secondary-foreground">
          <span className="py-2 px-4 rounded-3xl text-primary font-semibold bg-input">
            {item?.status}
          </span>
        </span>
      </div>
      <div className="w-fit flex items-center gap-5">
        <Button onClick={onViewClick} variant="outline">
          View
        </Button>
        <Image src={MoreSvg} alt="icon" className="cursor-pointer" />
      </div>
    </div>
  );
};
