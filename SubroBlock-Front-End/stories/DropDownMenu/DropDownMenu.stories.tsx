import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { DropDownMenuDefault } from "./DropDownMenu";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/DropDownMenu",
  component: DropDownMenuDefault,
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
} satisfies Meta<typeof DropDownMenuDefault>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = {
  args: {}
};

