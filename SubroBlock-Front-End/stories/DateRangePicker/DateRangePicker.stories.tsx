import { DatePickerWithRange } from "@/components/shared/DateRangePicker/DateRangePicker";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/DateRangePicker",
  component: DatePickerWithRange,
  decorators: [
    (Story) => (
      <Story />
    )
  ],
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {

  }
} satisfies Meta<typeof DatePickerWithRange>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base = {
  args: {
  }
} satisfies Story;

