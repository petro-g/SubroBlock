import Image from "next/image";
import * as React from "react";
import { FC, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import Close from "@/public/close-cross.svg";

interface ITermsOfUse {
    children: ReactNode;
    trigger: ReactNode;
    title: string;
}

const TermsOfUse: FC<ITermsOfUse> = ({
  children,
  trigger,
  title
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex justify-between items-center">
            {title}
            <AlertDialogCancel className="border-none bg-background hover:bg-background">
              <Image
                src={Close}
                alt="Close"
              />
            </AlertDialogCancel>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {children}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="text-background w-full bg-accent-foreground hover:bg-accent-active hover:text-background">
              Got it
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
};

export default TermsOfUse;
