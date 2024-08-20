import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { AlertDefault } from "./Alert";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Alert",
  component: AlertDefault,
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
} satisfies Meta<typeof AlertDefault>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = {
  args: {
    title: "Heads up!",
    description: "You can add components to your app using the cli."
  }
};

