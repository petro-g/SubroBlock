import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import { AccordionDefault } from "./Accordion";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Accordion",
  component: AccordionDefault,
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
} satisfies Meta<typeof AccordionDefault>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = {
  args: {
    type: "single",
    value: "item-1",
    triggerText: "Is it accessible?",
    contentText: "Yes. It adheres to the WAI-ARIA design pattern."
  }
};

