import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { BadgeDefault } from "./Badge";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Badge",
  component: BadgeDefault,
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
} satisfies Meta<typeof BadgeDefault>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = {
  args: {
    variant: "default",
    text: "Badge"
  }
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    text: "Badge"
  }
};

export const Success: Story = {
  args: {
    variant: "success",
    text: "Badge"
  }
};
