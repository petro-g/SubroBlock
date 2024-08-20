import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import addEmoji from "@/public/addEmoji.svg";
import AvatarIcon from "@/public/avatar.svg";
import plus from "@/public/plus.svg";
import send from "@/public/send.svg";

const chatMessages = [{
  id: 1,
  name: "Jane Cooper",
  avatar: AvatarIcon,
  description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,",
  time: "12:11 am",
  isNew: true,
  isSeen: false,
  isYouAuthor: false
},
{
  id: 2,
  name: "You",
  avatar: AvatarIcon,
  description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,",
  time: "12:11 am",
  isNew: true,
  isSeen: false,
  isYouAuthor: true
},
{
  id: 3,
  name: "You",
  avatar: AvatarIcon,
  description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,",
  time: "12:11 am",
  isNew: true,
  isSeen: false,
  isYouAuthor: true
}]

export default function Chat() {

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between bg-background">
        <div className="w-full px-5 flex flex-col justify-between">
          <div className="flex flex-col mt-5">
            <div className="flex justify-center">
              <div
                className="bg-background-secondary text-xs text-primary leading-3 p-1.5 mb-5 rounded-lg">Yesterday
              </div>
            </div>
            <div className="overflow-auto">
              {chatMessages.map(({ id, name, avatar, description, isYouAuthor, time }) => {
                return (
                  <div key={id} className="mb-9 w-full">
                    <div className={cn("flex justify-start mb-1.5", isYouAuthor ? "flex-row-reverse" : null)}>
                      <div className={cn("flex items-end h-auto", isYouAuthor ? "ml-2" : null)}>
                        <Image src={avatar} alt={`avatar_${name}`}/>
                      </div>
                      <div
                        className={cn("ml-2 p-3 bg-background rounded-xl w-full max-w-2xl", !isYouAuthor ? "bg-accent rounded-bl-none" : "border border-secondary rounded-br-none shadow-[0_2px_4px_0_rgba(0,0,0,0.03)]")}>
                        <div className="leading-6 font-medium text-lg text-primary">{name}</div>
                        <div className="leading-6 font-medium text-sm text-primary">{description}</div>
                      </div>
                    </div>
                    <div
                      className={cn("flex justify-start pl-11 font-medium text-xs text-primary", isYouAuthor ? "justify-end pr-11" : null)}>{time}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div
            className="p-3 flex bg-background rounded-xl w-full items-center border border-secondary shadow-[0_2px_4px_0_rgba(0,0,0,0.03)]">
            <div className="mr-3">
              <Image src={plus} alt="plus Logo"/>
            </div>
            <div className="mr-3">
              <Image src={addEmoji} alt="addEmoji Logo"/>
            </div>
            <Input
              className="w-full border-none hover:enabled:border-none focus-visible:ring-transparent"
              placeholder="Send a message..."
            />
            <Button variant="outline" size="icon" className="ml-4">
              <Image src={send} alt="send Logo"/>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
