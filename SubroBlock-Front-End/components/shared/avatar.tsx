import { VariantProps, cva } from "class-variance-authority";
import Image from "next/image";
import React from "react";
import { cn, getUserInitials } from "@/lib/utils";
import KeyIcon from "@/public/key-circle-orange.svg";
import { IUserBase } from "@/store/types/user";

const avatarVariants = cva(
  "flex relative rounded-full border-[2px] font-medium",
  {
    variants: {
      size: {
        xs: "w-6 h-6",
        sm: "w-9 h-9",
        md: "w-10 h-10",
        lg: "w-13 h-13 text-2xl",
        xl: "w-16 h-16 text-2xl"
      },
      colorScheme: {
        currentUser: "bg-[#002EFF] text-white cursor-pointer border-background-secondary hover:border-[#bfcbff]",
        primary: "bg-accent select-none text-accent-foreground border-accent"
      }
    },
    defaultVariants: {
      size: "md",
      colorScheme: "primary"
    }
  });

const keySize = {
  xs: "w-3.5 h-3.5",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-7 h-7",
  xl: "w-8 h-8"
};

export interface AvatarProps
  extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  showKey?: boolean;
}

const Avatar = ({ src, alt = "??", size, showKey, colorScheme }: AvatarProps) => {
  return (
    <div className={avatarVariants({ size, colorScheme: src ? undefined : colorScheme })}>
      {showKey && (
        <Image
          src={KeyIcon}
          alt="SubroBlock KeyIcon"
          className={cn(
            "absolute -left-4 -bottom-1.5 !text-accent-foreground",
            keySize[size as keyof typeof keySize]
          )}
        />
      )}
      {src && (
        <Image src={src} alt="" className="w-full h-full" />
      )}
      {!src && (
        <div className="w-full h-full flex items-center justify-center uppercase">{alt}</div>
      )}
    </div>
  );
}

Avatar.displayName = "Avatar";

export const AvatarUser = ({ user, ...rest }: AvatarProps & { user: Pick<IUserBase, "firstName" | "lastName" | "email" | "hasKeyAssigned"> | null }) => {
  return (
    <Avatar
      // src={user.avatar} // TODO add avatar later
      alt={getUserInitials(user)}
      showKey={user?.hasKeyAssigned}
      {...rest}
    />
  );
}

export default Avatar;
