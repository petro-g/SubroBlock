import { FC } from "react";
import { ModalContent } from "@/components/shared/Modal/ModalContent";
import { ModalFooter } from "@/components/shared/Modal/ModalFooter";
import { ModalHeaderContent } from "@/components/shared/Modal/ModalHeaderContent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CreateNewChannel {
    open?: boolean
    handleClose?: () => void;
    handleNext?: () => void;
}

export const CreateNewChannel: FC<CreateNewChannel> = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg bg-background">
        <DialogHeader>
          <ModalHeaderContent>
            <div className="leading-6 font-medium text-2xl text-primary">Create New Channel</div>
          </ModalHeaderContent>
        </DialogHeader>
        <ModalContent>
          <div>

            <div className="leading-6 font-medium text-sm text-primary">
                            Channel Name
              <Input

                className="h-[55px] mt-1"
                type="text"
                id="name"
                placeholder="Enter name"
                required
              />
            </div>

            <div className="mt-3">
              <div className="leading-6 font-medium text-sm text-primary">Visibility:</div>
              <div className="mt-2">

                <div className="leading-6 font-medium text-sm text-primary">Public - anyone in your organisation</div>

                <div className="mt-2">
                  <div className="leading-6 font-medium text-sm text-primary">Private - only specific person</div>
                  <div className="leading-6 font-medium text-sm text-light">
                                        Can only be viewed or joined by invitation
                  </div>
                </div>

              </div>
            </div>
          </div>
        </ModalContent>
        <DialogFooter className="sm:justify-around">
          <ModalFooter>
            <Button type="submit" className="w-full">
                            Next
            </Button>
          </ModalFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
