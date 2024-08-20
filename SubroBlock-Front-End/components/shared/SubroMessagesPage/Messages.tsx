"use client"
import Image from "next/image";
import React, { useState } from "react";
import { AvatarUser } from "@/components/shared/avatar";
import { InputSearch } from "@/components/shared/input-search";
import NewMessagesCounter from "@/components/shared/SubroMessagesPage/NewMessagesCounter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Plus from "@/public/plus-2.svg";
import SeenTick from "@/public/seen-message.svg";
import singleTick from "@/public/singleTick.svg";

export default function Messages() {
  const [searchValue, setSearchValue] = useState("")

  const messages = [{
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    time: "12:11 am",
    isNew: true,
    isSeen: false
  },
  {
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    time: "12:11 am",
    isNew: false,
    isSeen: false
  },
  {
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    time: "12:11 am",
    isNew: false,
    isSeen: false
  },
  {
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    time: "12:11 am",
    isNew: false,
    isSeen: false
  },
  {
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    time: "12:11 am",
    isNew: false,
    isSeen: true
  }
  ];

  const handleSearch = (value: string): void => {
    setSearchValue(value);
  }

  return (
    <div className="border-r w-1/4 bg-background ">
      <div className="flex flex-row font-medium text-xl p-6 text-primary justify-between">
        <InputSearch className="mr-5" value={searchValue} onChange={handleSearch}/>
        <Button>
          <Image src={Plus} alt="Plus" className="w-5 h-5" />
        </Button>
      </div>
      <div className="p-3">
        {messages.map(({ name,time,description, isSeen, isNew }, index) => {
          const tickType = isSeen ? SeenTick : singleTick;
          const newMessagesCount: number = 1;

          return (
            <div key={`${index}`}
              className={cn("flex items-center hover:bg-gray-100 hover:rounded-lg mb-5 p-3", isSeen ? "bg-accent rounded-lg": null)}>
              <div className="flex">
                <AvatarUser user={{ firstName: "SubroChat", email: "a", lastName: "1", hasKeyAssigned: true }} />
              </div>
              <div className="w-full pl-4">
                <div className="flex">
                  <div className="text-primary-foreground text-sm font-medium leading-6">{name}</div>
                  <div className="ml-auto text-xs leading-6 text-primary">{time}</div>
                </div>
                <div className="flex">
                  <div className="text-sm font-medium leading-6 text-light">{description}</div>
                  <div className="ml-auto text-sm">
                    {isNew ?
                      <NewMessagesCounter messagesCounter={newMessagesCount}/> :
                      <Image src={tickType} alt="Logo" /> }
                  </div>
                </div>
              </div>
            </div>
          )})}
      </div>
    </div>
  );
}
