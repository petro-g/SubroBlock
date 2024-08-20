import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import Info from "@/public/info-icon.svg";
import KeyIcon from "@/public/key-filled.svg";
import options from "@/public/options.svg";
import User from "@/public/user-1.svg";
import UserMain from "@/public/user.svg";

export default function Actions() {

  const actions = [
    {
      name: "Delete SubroUser",
      type: "user",
      isSignRequired: false
    },
    {
      name: "Delete SubroOrg",
      type: "user",
      isSignRequired: false
    },
    {
      name: "Delete SubroOrg",
      type: "user",
      isSignRequired: true
    },
    {
      name: "Mint SubroCoin",
      type: "coin",
      isSignRequired: false
    },
    {
      name: "Move SubroCoin",
      type: "coin",
      isSignRequired: false
    }
  ];
  return (

    <div className="w-full">
      {actions.map((action, index) => (
        <div key={`${index}`}className="flex bg-white p-7 m-3 rounded-md items-center">
          <Image src={UserMain} alt="User logo" />

          <div className="leading-6 font-medium text-sm text-primary pl-2">
            {action.name}:
          </div>

          {action.type === "user" ?
            <div className="flex items-center pl-4">
              <Image src={User} alt="User logo" />

              <div className="px-3 leading-6 font-medium text-sm text-primary">Jane Cooper</div>
              <div className="px-3 leading-6 font-medium text-sm text-primary underline">View User Details</div>
            </div>
            :
            <div className="flex pl-4">
              <div className="pl-2 leading-6 font-medium text-sm text-primary text-light" >
                                Origin Name: <div className="pt-1 text-primary">Origin Name</div>
              </div>

              <div className="px-5 leading-6 font-medium text-sm text-primary text-primary">
                                Destination Name: <div className="pt-1 text-light">Destination Name:</div>
              </div>

              <div className="pl-2 leading-6 font-medium text-sm text-primary text-primary">
                                SubroCoin Amount: <div className="pt-1 text-light">2</div>
              </div>
            </div>}

          <div className="flex ml-auto items-center">
            <Image src={KeyIcon} alt="Key logo" />
            <div className="mx-2">1/3 keys</div>
            <Image src={Info} alt="Info logo" />
          </div>

          {action.isSignRequired &&
                        <div className="mx-6">
                          <Button
                            variant="outline"
                          >
                                Sign
                          </Button>
                        </div>}

          <div className="ml-2">
            <Image src={options} alt="Options" />
          </div>
        </div>
      ))}
    </div>
  );
}
