import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg transform hover:scale-105",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 hover:shadow-xl",
        outline:
          "border-2 border-purple-600 bg-background text-purple-600 hover:bg-purple-50",
        secondary:
          "bg-purple-100 text-purple-700 hover:bg-purple-200",
        ghost: "hover:bg-purple-50 hover:text-purple-700",
        link: "text-purple-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 text-sm rounded-full",
        lg: "h-12 px-8 text-lg rounded-full",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

