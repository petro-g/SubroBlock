import Image from "next/image";
import Link from "next/link";
import React from "react";
import LoginLogoIcon from "@/public/logo.svg";

const LoginLogo = () => {
  return (
    <Link
      href="/login"
      className="max-w-10"
    >
      <Image
        src={LoginLogoIcon}
        alt="SubroBlock Logo"
      />
    </Link>
  );
};

export default LoginLogo;
