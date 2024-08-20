import React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";

interface IBadgeDefault extends BadgeProps{
  text: string;
}

/**
 * Primary UI component for user interaction
 */
export const BadgeDefault = ({ variant, text }: IBadgeDefault) => {
  return (
    <Badge variant={variant}>{text}</Badge>
  );
};

