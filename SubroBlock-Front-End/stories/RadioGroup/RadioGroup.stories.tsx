import RadioGroup from "@/components/shared/RadioGroup/RadioGroup";
import { listItems } from "./listItemsData";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RadioButtonDefault: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    disabled: false,
    variant: "default",
    size: "default"
  }
};

export const RadioButtonDefaultError: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    variant: "error",
    size: "default"
  }
};

export const RadioButtonDefaultDisabled: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    disabled: true,
    variant: "default",
    size: "default"
  }
};

export const RadioButtonMediumDefault: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    variant: "default",
    size: "sm"
  }
};

export const RadioButtonMediumError: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    variant: "default",
    size: "sm"
  }
};

export const RadioButtonMediumDisabled: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    disabled: true,
    variant: "default",
    size: "sm"
  }
};

export const RadioButtonSmallDefault: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    variant: "default",
    size: "xs"
  }
};

export const RadioButtonSmallError: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    variant: "error",
    size: "xs"
  }
};

export const RadioButtonSmallDisabled: Story = {
  args: {
    listItems,
    defaultValue: "Item1",
    disabled: true,
    variant: "default",
    size: "xs"
  }
};

