import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:ring-2 focus:ring-offset-1",
  {
    variants: {
      variant: {
        primary: "bg-[#3B5935] text-white hover:bg-[#3B5935]/90 shadow-lg shadow-[#3B5935]/20 focus:ring-[#3B5935]/50",
        danger: "bg-[#EC3759] text-white hover:bg-[#EC3759]/90 shadow-sm focus:ring-[#EC3759]/30",
        warning: "bg-[#F2C94C] text-[#1E1E1E] hover:bg-[#F2C94C]/90 shadow-sm focus:ring-[#F2C94C]/30",
        outline: "bg-white border border-[#8C3A27]/20 text-[#1E1E1E] hover:bg-gray-100 focus:ring-[#3B5935]/30",
        ghost: "text-[#1E1E1E] hover:bg-gray-100 focus:ring-[#3B5935]/20",
        link: "text-[#3B5935] font-bold hover:underline focus:ring-0",
      },
      size: {
        sm: "px-3 py-2 text-xs",
        default: "px-4 py-2.5",
        lg: "px-6 py-3.5",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
