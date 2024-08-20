import Image from "next/image";
import React from "react";
import TooltipCustom from "@/components/shared/Tooltip/Tooltip";
import { Button } from "@/components/ui/button";
import Info from "@/public/info.svg";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Tooltip",
  component: TooltipCustom,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
} satisfies Meta<typeof TooltipCustom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TopRight: Story = {
  args: {
    side: "top",
    align: "start",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const TopCenter: Story = {
  args: {
    side: "top",
    align: "center",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const TopLeft: Story = {
  args: {
    side: "top",
    align: "end",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const BottomLeft: Story = {
  args: {
    side: "bottom",
    align: "end",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const BottomCenter: Story = {
  args: {
    side: "bottom",
    align: "center",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const BottomRight: Story = {
  args: {
    side: "bottom",
    align: "start",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const RightTop: Story = {
  args: {
    side: "left",
    align: "start",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const RightCenter: Story = {
  args: {
    side: "left",
    align: "center",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const RightBoottom: Story = {
  args: {
    side: "left",
    align: "end",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const LeftTop: Story = {
  args: {
    side: "right",
    align: "start",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const LeftCenter: Story = {
  args: {
    side: "right",
    align: "center",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

export const LeftBoottom: Story = {
  args: {
    side: "right",
    align: "end",
    trigger: <Button variant="outline">Hover</Button>,
    children: <>
      <div className="flex items-center text-background text-sm  max-w-62">
        <Image
          src={Info}
          alt="Info"
          className="w-4 h-4 mr-2"
        />
        <span>
                1 of 3 keys signed. You have signed and 1 more key is required
        </span>
      </div>
    </>
  }
};

