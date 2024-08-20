// custom input password. default input doesn't have logic to show/hide password
import Image from "next/image";
import React, { useState } from "react";
import { Input, InputProps } from "@/components/ui/input";
import EyeSlashIcon from "@/public/eye-slash.svg";

const InputPassword = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-center">
      <Input
        ref={ref}
        {...props}
        type={showPassword ? "text" : "password"}
      />
      <span
        className="absolute right-3 cursor-pointer text-secondary-foreground hover:text-primary"
        onClick={() => setShowPassword(!showPassword)}
      >
        <Image
          src={EyeSlashIcon}
          alt=""
        />
      </span>
    </div>
  );
});

InputPassword.displayName = "InputPassword";

export { InputPassword };
