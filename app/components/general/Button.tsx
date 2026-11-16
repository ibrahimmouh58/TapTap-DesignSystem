import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-1 whitespace-nowrap font-medium transition-colors enabled:hover:cursor-pointer enabled:active:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        /* ───────── Primary (teal) ───────── */
        primary:
          "bg-brand text-white enabled:hover:bg-brand-hover enabled:active:bg-brand-pressed disabled:bg-brand-disabled",

        outline:
          "border border-neutral-300 bg-white text-neutral-600 enabled:hover:border-brand-hover enabled:hover:text-brand-hover enabled:active:border-brand-pressed enabled:active:text-brand-pressed disabled:border-neutral-200 disabled:text-neutral-400",

        ghost:
          "bg-transparent text-neutral-600 enabled:hover:bg-neutral-100 enabled:active:bg-neutral-300 disabled:text-neutral-400",

        link:
          "bg-transparent text-brand enabled:hover:text-brand-hover enabled:active:text-brand-pressed disabled:text-primary-400",

        /* ───────── Danger (red) ───────── */
        dangerPrimary:
          "bg-danger-600 text-white enabled:hover:bg-danger-500 enabled:active:bg-danger-700 disabled:bg-danger-300",

        dangerOutline:
          "border border-danger-600 bg-white text-danger-600 enabled:hover:border-danger-500 enabled:hover:text-danger-500 enabled:active:border-danger-700 enabled:active:text-danger-700 disabled:border-danger-400 disabled:text-danger-400",

        dangerGhost:
          "bg-transparent text-danger-600 enabled:hover:bg-danger-100 enabled:active:bg-danger-300 disabled:text-danger-400",

        dangerLink:
          "bg-transparent text-danger-600 enabled:hover:text-danger-500 enabled:active:text-danger-700 disabled:text-danger-400",

        /* ───────── Icon buttons (round) ───────── */
        iconPrimary:
          "bg-brand text-white enabled:hover:bg-brand-hover enabled:active:bg-brand-pressed disabled:bg-brand-disabled",

        iconOutline:
          "border border-neutral-300 bg-white text-neutral-600 enabled:hover:bg-neutral-100 enabled:active:border-neutral-300 enabled:active:bg-neutral-300 disabled:border-neutral-200 disabled:text-neutral-400",

        iconGhost:
          "bg-transparent text-neutral-600 enabled:hover:bg-neutral-100 enabled:active:bg-neutral-300 disabled:text-neutral-400",
      },

      size: {
        // Figma: height, min width, padding, icon size
        sm: "h-6 min-w-[54px] gap-1 rounded px-1 text-caption [&>svg]:size-[14px]",
        md: "h-9 min-w-[82px] gap-1 rounded px-2 text-body [&>svg]:size-[16px]",
        lg: "h-10 min-w-[90px] gap-1 rounded px-2 text-subtitle [&>svg]:size-[18px]",

        // Round buttons
        icon: "size-9 rounded-full p-0 [&>svg]:size-4",
        iconSm: "size-6 rounded-full p-0 [&>svg]:size-3.5",
        iconLg: "size-10 rounded-full p-0 [&>svg]:size-[18px]",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  type = "button",
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

interface IconButtonProps extends ButtonProps {
  label: string;
  shape?: "round" | "square";
}

export function IconButton({
  label,
  children,
  variant = "iconGhost",
  size = "iconLg",
  shape = "round",
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      className={cn(shape === "square" && "rounded", className)}
      {...props}
    >
      {children}
    </Button>
  );
}