import Image from "next/image";
import { FC } from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import DeleteIcon from "@/public/delete.svg";

interface SubroOfferModal {
  handleCancel?: () => void;
  isError?: boolean;
}

export const SubroOfferCancelModal: FC<SubroOfferModal> = ({ handleCancel, isError = false }) => {
  return (
    <Modal
      modalHeaderContent={(
        <div className="flex justify-center bg-destructive-foreground w-16 h-16 rounded-full">
          <Image src={DeleteIcon} alt="Delete Icon" />
        </div>)
      }
      modalContent={(
        <>
          <div className="grid flex-1 gap-2 text-6 text-center text-primary-foreground pl-28 pr-28">
            Are you sure you want to delete file?
          </div>
          {isError ? <div className="text-base text-center">
            This action have to be signed by 2 admins
          </div> : null}
        </>
      )}
      modalFooter={(
        <>
          <DialogClose asChild>
            <Button type="button" variant="secondary"
              className="w-full max-w-44 border border-solid border-accent-foreground">
              No
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleCancel}
            className="w-full max-w-44 text-background"
          >
            Yes
          </Button>
        </>
      )}
    />
  );
};
