import Image from "next/image";
import { FC } from "react";
import { ModalContent } from "@/components/shared/Modal/ModalContent";
import { ModalFooter } from "@/components/shared/Modal/ModalFooter";
import { ModalHeaderContent } from "@/components/shared/Modal/ModalHeaderContent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ChevronLeft from "@/public/chevron-left.svg";

interface InvitePeopleModal {
    open?: boolean
    handleClose?: () => void;
    handleNext?: () => void;
    handleBack?: () => void;
}

export const InvitePeopleModal: FC<InvitePeopleModal> = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg bg-background">
        <DialogHeader>
          <ModalHeaderContent>
            <div className="leading-6 font-medium text-2xl text-primary">Invite People</div>
          </ModalHeaderContent>
        </DialogHeader>
        <ModalContent>
          <div className="py-0">
            <Input
              className="h-[55px]"
              type="text"
              id="name"
              placeholder="Enter email or name"
              required
            />
          </div>
          <div className="leading-6 font-medium text-sm mb-5 text-primary">Email or name:</div>
        </ModalContent>
        <DialogFooter className="sm:justify-around">
          <ModalFooter>
            <div className="flex items-center w-full">
              <Button type="submit" variant={"ghost"} size="lg">
                <Image src={ChevronLeft} alt="Back" />
                                Back
              </Button>

              <div className="flex items-center ml-auto">
                <Button type="submit" variant={"ghost"}>
                                    Skip for Now
                </Button>
                <Button type="submit" size="lg">
                                    Next
                </Button>
              </div>
            </div>

          </ModalFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

