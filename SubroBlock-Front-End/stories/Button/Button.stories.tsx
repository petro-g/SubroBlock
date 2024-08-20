import { fn } from "@storybook/test";
import Image from "next/image";
import React from "react";
import { useGlobalStyles } from "@/lib/hooks/useGlobalStyles";
import ArrowLeftDefault from "@/public/chevron-left-default.svg";
import ArrowLeftDisabled from "@/public/chevron-left-disabled.svg";
import ArrowLeftOrange from "@/public/chevron-left-orange.svg";
import ArrowRightDefault from "@/public/chevron-right-default.svg";
import ArrowRightDisabled from "@/public/chevron-right-disabled.svg";
import ArrowRightOrange from "@/public/chevron-right-orange.svg";
import { Button } from "./Button";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Button",
  component: Button,
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
  tags: ["autodocs"],
  args: { onClick: fn() }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefaultBig: Story = {
  args: {
    variant: "default",
    size: "default",
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const PrimaryBigDefaultIconLeft: Story = {
  args: {
    variant: "default",
    size: "default",
    children: <>
      <Image src={ArrowLeftDefault} alt="ArrowLeftDefault" />
      <span>Create offer</span>
    </>
  }
};

export const PrimaryBigDefaultIconRight: Story = {
  args: {
    variant: "default",
    size: "default",
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightDefault} alt="ArrowRightDefault" />
    </>
  }
};

export const PrimaryBigDefaultJustIconRight: Story = {
  args: {
    variant: "default",
    size: "default",
    children: <>
      <Image src={ArrowRightDefault} alt="ArrowRightDefault" />
    </>
  }
};

export const PrimaryBigDefaultDisabled: Story = {
  args: {
    variant: "default",
    size: "default",
    disabled: true,
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const PrimaryBigDefaultDisabledWithLeftIcon: Story = {
  args: {
    variant: "default",
    size: "default",
    disabled: true,
    children: <>
      <Image src={ArrowLeftDisabled} alt="Disabled" />
      <span>Create offer</span>
    </>
  }
};

export const PrimaryBigDefaultDisabledWithRightIcon: Story = {
  args: {
    variant: "default",
    size: "default",
    disabled: true,
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const PrimaryBigDefaultDisabledWithJustRightIcon: Story = {
  args: {
    variant: "default",
    size: "default",
    disabled: true,
    children: <>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const MediumDefaultBig: Story = {
  args: {
    variant: "default",
    size: "sm",
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const MediumBigDefaultIconLeft: Story = {
  args: {
    variant: "default",
    size: "sm",
    children: <>
      <Image src={ArrowLeftDefault} alt="ArrowLeftDefault" />
      <span>Create offer</span>
    </>
  }
};

export const MediumBigDefaultIconRight: Story = {
  args: {
    variant: "default",
    size: "sm",
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightDefault} alt="ArrowRightDefault" />
    </>
  }
};

export const MediumBigDefaultJustIconRight: Story = {
  args: {
    variant: "default",
    size: "sm",
    children: <>
      <Image src={ArrowRightDefault} alt="ArrowRightDefault" />
    </>
  }
};

export const MediumBigDefaultDisabled: Story = {
  args: {
    variant: "default",
    size: "sm",
    disabled: true,
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const MediumBigDefaultDisabledWithLeftIcon: Story = {
  args: {
    variant: "default",
    size: "sm",
    disabled: true,
    children: <>
      <Image src={ArrowLeftDisabled} alt="Disabled" />
      <span>Create offer</span>
    </>
  }
};

export const MediumBigDefaultDisabledWithRightIcon: Story = {
  args: {
    variant: "default",
    size: "sm",
    disabled: true,
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const MediumBigDefaultDisabledWithJustRightIcon: Story = {
  args: {
    variant: "default",
    size: "sm",
    disabled: true,
    children: <>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

/*Secondary Buttons Preview*/
export const SecondaryDefaultBig: Story = {
  args: {
    variant: "secondary",
    size: "default",
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const SecondaryBigDefaultIconLeft: Story = {
  args: {
    variant: "secondary",
    size: "default",
    children: <>
      <Image src={ArrowLeftOrange} alt="ArrowLeftOrange" />
      <span>Create offer</span>
    </>
  }
};

export const SecondaryBigDefaultIconRight: Story = {
  args: {
    variant: "secondary",
    size: "default",
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightOrange} alt="ArrowRightOrange" />
    </>
  }
};

export const SecondaryBigDefaultJustIconRight: Story = {
  args: {
    variant: "secondary",
    size: "default",
    children: <>
      <Image src={ArrowRightOrange} alt="ArrowRightOrange" />
    </>
  }
};

export const SecondaryBigDefaultDisabled: Story = {
  args: {
    variant: "secondary",
    size: "default",
    disabled: true,
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const SecondaryBigDefaultDisabledWithLeftIcon: Story = {
  args: {
    variant: "secondary",
    size: "default",
    disabled: true,
    children: <>
      <Image src={ArrowLeftDisabled} alt="ArrowLeftDisabled" />
      <span>Create offer</span>
    </>
  }
};

export const SecondaryBigDefaultDisabledWithRightIcon: Story = {
  args: {
    variant: "secondary",
    size: "default",
    disabled: true,
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const SecondaryBigDefaultDisabledWithJustRightIcon: Story = {
  args: {
    variant: "secondary",
    size: "default",
    disabled: true,
    children: <>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const SecondaryDefaultMedium: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const SecondaryMediumDefaultIconLeft: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    children: <>
      <Image src={ArrowLeftOrange} alt="ArrowLeftOrange" />
      <span>Create offer</span>
    </>
  }
};

export const SecondaryMediumDefaultIconRight: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightOrange} alt="ArrowRightOrange" />
    </>
  }
};

export const SecondaryMediumDefaultJustIconRight: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    children: <>
      <Image src={ArrowRightOrange} alt="ArrowRightOrange" />
    </>
  }
};

export const SecondaryMediumDefaultDisabled: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    disabled: true,
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const SecondaryMediumDefaultDisabledWithLeftIcon: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    disabled: true,
    children: <>
      <Image src={ArrowLeftDisabled} alt="ArrowLeftDisabled" />
      <span>Create offer</span>
    </>
  }
};

export const SecondaryMediumDefaultDisabledWithRightIcon: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    disabled: true,
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const SecondaryMediumDefaultDisabledWithJustRightIcon: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    disabled: true,
    children: <>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const LinkDefaultBig: Story = {
  args: {
    variant: "link",
    size: "default",
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const LinkBigDefaultIconLeft: Story = {
  args: {
    variant: "link",
    size: "default",
    children: <>
      <Image src={ArrowLeftOrange} alt="ArrowLeftOrange" />
      <span>Create offer</span>
    </>
  }
};

export const LinkBigDefaultIconRight: Story = {
  args: {
    variant: "link",
    size: "default",
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightOrange} alt="ArrowRightOrange" />
    </>
  }
};

export const LinkBigDefaultJustIconRight: Story = {
  args: {
    variant: "link",
    size: "default",
    children: <>
      <Image src={ArrowRightOrange} alt="ArrowRightOrange" />
    </>
  }
};

export const LinkBigDefaultDisabled: Story = {
  args: {
    variant: "link",
    size: "default",
    disabled: true,
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const LinkBigDefaultDisabledWithLeftIcon: Story = {
  args: {
    variant: "link",
    size: "default",
    disabled: true,
    children: <>
      <Image src={ArrowLeftDisabled} alt="ArrowLeftDisabled" />
      <span>Create offer</span>
    </>
  }
};

export const LinkBigDefaultDisabledWithRightIcon: Story = {
  args: {
    variant: "link",
    size: "default",
    disabled: true,
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const LinkBigDefaultDisabledWithJustRightIcon: Story = {
  args: {
    variant: "link",
    size: "default",
    disabled: true,
    children: <>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const LinkDefaultMedium: Story = {
  args: {
    variant: "link",
    size: "sm",
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const LinkMediumDefaultIconLeft: Story = {
  args: {
    variant: "link",
    size: "sm",
    children: <>
      <Image src={ArrowLeftOrange} alt="ArrowLeftOrange" />
      <span>Create offer</span>
    </>
  }
};

export const LinkMediumDefaultIconRight: Story = {
  args: {
    variant: "link",
    size: "sm",
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightOrange} alt="ArrowRightOrange" />
    </>
  }
};

export const LinkMediumDefaultJustIconRight: Story = {
  args: {
    variant: "link",
    size: "sm",
    children: <>
      <Image src={ArrowRightOrange} alt="ArrowRightOrange" />
    </>
  }
};

export const LinkMediumDefaultDisabled: Story = {
  args: {
    variant: "link",
    size: "sm",
    disabled: true,
    children: <>
      <span>Create offer</span>
    </>
  }
};

export const LinkMediumDefaultDisabledWithLeftIcon: Story = {
  args: {
    variant: "link",
    size: "sm",
    disabled: true,
    children: <>
      <Image src={ArrowLeftDisabled} alt="ArrowLeftDisabled" />
      <span>Create offer</span>
    </>
  }
};

export const LinkMediumDefaultDisabledWithRightIcon: Story = {
  args: {
    variant: "link",
    size: "sm",
    disabled: true,
    children: <>
      <span>Create offer</span>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

export const LinkMediumDefaultDisabledWithJustRightIcon: Story = {
  args: {
    variant: "link",
    size: "sm",
    disabled: true,
    children: <>
      <Image src={ArrowRightDisabled} alt="ArrowRightDisabled" />
    </>
  }
};

