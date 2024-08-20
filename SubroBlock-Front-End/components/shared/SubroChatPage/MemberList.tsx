import React from "react";
import { AvatarUser } from "@/components/shared/avatar";
import { cn } from "@/lib/utils";

export default function MemberList() {

  const members = [{
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    isSeen: false
  },
  {
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    isSeen: false
  },
  {
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    isSeen: false
  },
  {
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    isSeen: false
  },
  {
    name: "Jane Cooper",
    description: "Lorem ipsum dolor sit",
    isSeen: false
  }
  ];

  return (
    <div className="border-l bg-background w-1/5">
      <div className="m-6 leading-6 font-medium text-lg tracking-widest uppercase text-light">Members {members.length}</div>
      <div className="p-3">
        {members.map(({ name, isSeen }, index) => {
          return (
            <div key={`${index}`}
              className={cn("flex items-center hover:bg-gray-100 hover:rounded-lg mb-5 p-3", isSeen ? "bg-accent rounded-lg" : null)}>
              <div className="flex">
                <AvatarUser user={{ firstName: "SubroChat", email: "a", lastName: "1", hasKeyAssigned: true }} />
              </div>
              <div className="w-full pl-4">
                <div className="flex">
                  <div className="text-primary-foreground text-sm font-medium leading-6">{name}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
