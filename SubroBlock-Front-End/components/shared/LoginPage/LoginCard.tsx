import Image from "next/image";
import React from "react";
import LoginBackground from "@/public/login-background.svg";
import tailwindConfig from "@/tailwind.config";

interface IProps {
  children: React.ReactNode;
}

const colorA = tailwindConfig.theme.extend.colors.background.secondary;
const colorC = tailwindConfig.theme.extend.colors.background.DEFAULT;
const transparent = "#ffffff00";

export default function LoginCard({ children }: IProps) {
  return (
    <div className="flex flex-col fixed top-1/2 left-1/2 bg-background max-w-screen w-full max-w-96 justify-between items-center p-8 box-content -translate-x-1/2 -translate-y-1/2 rounded gap-6">
      <Image
        alt="Login Background"
        className="rounded absolute -z-10 top-0 m-1.5 w-[calc(100%-3rem/4)] h-[200px]"
        src={LoginBackground} // image doesn't have gradients, only wireframe
        // custom gradient under the image. grey at top, transparent at bottom
        style={{ background: `linear-gradient(180deg, ${colorA} 0%, ${transparent} 100%)` }}
      />
      <div
        // second gradient over the image. transparent at top, white at bottom
        className="rounded absolute -z-0 top-0 m-1.5 w-[calc(100%-3rem/4)] h-[200px] "
        style={{ background: `linear-gradient(0deg, ${colorC} 0%, ${transparent} 100%)` }}
      />
      {children}
    </div>
  );
}
