import React from "react";
import ArrowBackLink from "@/components/shared/ArrowBackLink";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import type { Meta, StoryObj } from "@storybook/react";
import "@/pages/globals.css";

const meta = {
  title: "components/ArrowBackLink",
  component: ArrowBackLink,
  decorators: [
    (Story) => {
      const { globalClassName } = useGlobalStyles();
      return <div className={globalClassName}>
        <Story/>
      </div>
    }
  ],
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
} satisfies Meta<typeof ArrowBackLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base = {
  args: {
    href: "green"
  }
} satisfies Story;

