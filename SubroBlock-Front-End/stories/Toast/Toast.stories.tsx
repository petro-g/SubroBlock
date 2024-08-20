import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { ToastDefault } from "./Toast";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Toast",
  component: ToastDefault,
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
} satisfies Meta<typeof ToastDefault>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = {
  args: {}
};
