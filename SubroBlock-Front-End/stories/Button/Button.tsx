import React from "react";
import { ButtonProps, Button as DefaultButton } from "@/components/ui/button";
import "@/pages/globals.css";

/**
 * Primary UI component for user interaction
 */
export const Button = ({ ...props }: ButtonProps) => {
  return (
    <DefaultButton
      {...props}
    >
    </DefaultButton>
  );
};

