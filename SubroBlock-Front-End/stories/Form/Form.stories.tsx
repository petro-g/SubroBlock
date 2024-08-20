import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { DefaultForm } from "./Form";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Form",
  component: DefaultForm,
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
} satisfies Meta<typeof DefaultForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = {
  args: {}
};
