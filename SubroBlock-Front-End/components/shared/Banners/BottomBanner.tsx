import React from "react";
import { Button } from "@/components/ui/button";
const BottomBanner =  () => {
  return (
    <div className="w-full h-28 rounded-lg bg-accent-foreground absolute bottom-0 z-10 flex justify-between px-8 text-accent items-center">
      <div>
        <div className="text-2xl">My SubroOffers</div>
        <div className="text-xl mt-2">
          Lorem ipsum dolor sit amet consectetur. Fringilla
        </div>
      </div>
      <div>
        <Button className="hover:bg-accent border-none hover:text-accent-foreground mr-2">
          Create Offer
        </Button>
        <Button className="hover:bg-accent border-none hover:text-accent-foreground">
          Create Offer
        </Button>
      </div>
    </div>
  );
};
export default BottomBanner;
