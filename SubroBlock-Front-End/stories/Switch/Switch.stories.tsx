import Switch from "@/components/shared/Switch/Switch";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Switch",
  component: Switch,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SwitchDefault: Story = {
  args: {
    id: "switch",
    size: "default",
    disabled: false
  }
};

export const SwitchMediumDefault: Story = {
  args: {
    id: "switch",
    size: "sm"
  }
};

export const SwitchSmallDefault: Story = {
  args: {
    id: "switch",
    size: "xs"
  }
};

