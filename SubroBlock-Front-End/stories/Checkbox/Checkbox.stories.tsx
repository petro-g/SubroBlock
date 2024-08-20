import { Checkbox } from "@/components/checkbox/Checkbox";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/Checkbox",
  component: Checkbox,
  decorators: [
    (Story) => (
      <Story />
    )
  ],
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base = {
  args: {
    id: "1",
    children: "Text",
    checked: false,
    onCheckedChange: () => {}
  }
} satisfies Story;

