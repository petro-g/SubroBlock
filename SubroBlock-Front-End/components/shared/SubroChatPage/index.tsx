"use client";
import Image from "next/image";
import React from "react";
import { AvatarUser } from "@/components/shared/avatar";
import Download from "@/public/download-icon.svg";
import options from "@/public/options.svg";
import search from "@/public/search.svg";
import ChannelList from "./ChannelList";
import Chat from "./ChatPage";
import MemberList from "./MemberList";

export default function SubroChat() {
  return (
    <div className="flex w-full">
      <ChannelList />
      <div className="w-full">
        <div className="flex border-b p-3 items-center bg-background">
          <AvatarUser user={{ firstName: "SubroChat", email: "a", lastName: "1", hasKeyAssigned: true }} />

          <div className="pl-3">
            <div className="text-sm text-primary-foreground font-medium">Group Name</div>
            <div className="leading-6 font-medium text-xs text-primary">7 Participants</div>
          </div>

          <div className="flex ml-auto">
            <div className="flex items-center">
              <Image src={Download} alt="Download"/>
            </div>
            <div className="leading-6 text-sm text-accent-foreground pr-6 pl-1 cursor-pointer"> Download Chat Data</div>

            <div className="flex">
              <div className="cursor-pointer">
                <Image src={search} alt="Search"/>
              </div>
              <div className="pl-3 cursor-pointer">
                <Image src={options} alt="Options"/>

              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Chat/>
          <MemberList/>
        </div>
      </div>

    </div>
  );
}
