import React from "react";
import { cn } from "@/lib/utils";

const Box = (props: { color: string, number: number, hex: string }) => {
  const {
    color,
    number,
    hex
  } = props;

  return (
    <div className="flex p-4 flex-col items-start gap-3.5 border">
      <div className={cn("w-[156px] h-[100px] border", color)}/>
      <div>
        <div className="text-base font-bold text-primary">{color}</div>
        <div className="text-base font-normal text-textSecondary">{number}</div>
        <div className="text-base font-normal text-textSecondary">{hex}</div>
      </div>
    </div>
  );
};

const ColorsView = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-4xl font-bold text-primary mb-2.5">
        Colors
      </div>
      Orange - Accent
      <div className="grid grid-cols-4">
        <Box
          color="bg-accent-active"
          number={400}
          hex="#FF6B00"
        />
        <Box
          color="bg-accent-foreground"
          number={300}
          hex="#FE891D"
        />
        <Box
          color="bg-accent-muted"
          number={200}
          hex="#FFE7D2"
        />
        <Box
          color="bg-accent"
          number={100}
          hex="#FFF4E9"
        />
      </div>
      Black - Primary
      <div className="grid grid-cols-4">
        <Box
          color="bg-primary-foreground"
          number={300}
          hex="#0D1C2C"
        />
        <Box
          color="bg-primary"
          number={200}
          hex="#51667D"
        />
        <Box
          color="bg-secondary-foreground"
          number={100}
          hex="#8694A4"
        />
        <Box
          color="bg-secondary"
          number={50}
          hex="#E5E5E5"
        />
      </div>
      Background
      <div className="grid grid-cols-4">
        <Box
          color="bg-background"
          number={200}
          hex="#F6F6F6"
        />
        <Box
          color="bg-background-secondary"
          number={100}
          hex="#51667D"
        />
      </div>
      Red - Destructive - Error
      <div className="grid grid-cols-4">
        <Box
          color="bg-destructive"
          number={200}
          hex="#FF2B00"
        />
        <Box
          color="bg-destructive-foreground"
          number={100}
          hex="#FFE7E4"
        />
      </div>
      Yellow - Warning
      <div className="grid grid-cols-4">
        <Box
          color="bg-warning"
          number={200}
          hex="#FFB525"
        />
        <Box
          color="bg-warning-foreground"
          number={100}
          hex="#FFF4DF"
        />
      </div>
      Green - Success
      <div className="grid grid-cols-4">
        <Box
          color="bg-success"
          number={200}
          hex="#2FC385"
        />
        <Box
          color="bg-success-foreground"
          number={100}
          hex="#E0F6ED"
        />
      </div>
    </div>
  );
};

export default ColorsView;
