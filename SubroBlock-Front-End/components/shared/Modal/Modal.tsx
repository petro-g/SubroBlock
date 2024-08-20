import React, { FC } from "react";
import { ModalContent } from "@/components/shared/Modal/ModalContent";
import { ModalFooter } from "@/components/shared/Modal/ModalFooter";
import { ModalHeaderContent } from "@/components/shared/Modal/ModalHeaderContent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";

interface Modal {
    modalFooter?: React.ReactNode
    modalContent?: React.ReactNode
    modalHeaderContent?: React.ReactNode
}

export const Modal: FC<Modal> = (
  {
    modalFooter = <></>,
    modalContent = <></>,
    modalHeaderContent = <></>
  }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader className="w-full justify-center">
          <ModalHeaderContent>
            {modalHeaderContent}
          </ModalHeaderContent>
        </DialogHeader>
        <ModalContent>
          {modalContent}
        </ModalContent>
        <DialogFooter className="sm:justify-around">
          <ModalFooter>
            {modalFooter}
          </ModalFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
