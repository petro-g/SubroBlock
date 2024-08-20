"use client";
import Image from "next/image";
import React, { useState } from "react";
import { InputSearch } from "@/components/shared/input-search";
import { Button } from "@/components/ui/button";
import Plus from "@/public/plus-2.svg";

export default function ChannelList() {
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (value: string): void => {
    setSearchValue(value);
  }

  const channels = [
    {
      name: "general",
      id: 1
    },
    {
      name: "channel name",
      id: 2
    },
    {
      name: "channel name",
      id: 3
    },
    {
      name: "channel name",
      id: 4
    },
    {
      name: "channel name",
      id: 5
    }
  ];

  return (
    <div className="border-r border bg-background w-1/5">
      <div className="flex flex-row font-medium text-xl p-6 text-primary justify-between">
        <InputSearch className="mr-5" value={searchValue} onChange={handleSearch}/>
        <Button>
          <Image src={Plus} alt="Plus" className="w-5 h-5"/>
        </Button>
      </div>
      <div className="m-4">
        {channels.map((channel, index) => (
          <div key={`${index}`}
            className="p-3 leading-6 font-medium text-sm cursor-pointer rounded-md hover:text-md hover:bg-gray-100 text-primary">
                # {channel.name}
          </div>
        ))}
      </div>
    </div>
  );
}
