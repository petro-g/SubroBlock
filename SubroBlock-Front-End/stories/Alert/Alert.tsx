import { Terminal } from "lucide-react"
import React from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert"
import "@/pages/globals.css";

interface IAlertDefault {
  title:  string;
  description: string;
}

/**
 * Primary UI component for user interaction
 */
export const AlertDefault = ({ title, description }: IAlertDefault) => {
  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  );
};

