import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { DialogDefault } from "./Dialog";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Dialog",
  component: DialogDefault,
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
} satisfies Meta<typeof DialogDefault>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = {
  args: {
    title: "Edit Profile",
    description: "Make changes to your profile here. Click save when you're done."
  }
};

