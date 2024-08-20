import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { AlertDialogDefault } from "./AlertDialog";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/AlertDialog",
  component: AlertDialogDefault,
  parameters: {
    layout: "centered"
  },
  decorators: [
    (Story) => {
      const { globalClassName } = useGlobalStyles();
      return <div className={globalClassName}>
        <Story/>
      </div>
    }
  ],
  tags: ["autodocs"]
} satisfies Meta<typeof AlertDialogDefault>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = {
  args: {
    title: "Are you absolutely sure?",
    description: "This action cannot be undone. This will permanently delete your\n" +
        "                      account and remove your data from our servers."
  }
};

