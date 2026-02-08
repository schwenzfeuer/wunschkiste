import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-full border-2 border-black shadow-[0_4px_0_0_black] hover:shadow-[0_7px_0_0_black] hover:translate-y-[-3px] active:translate-y-[1px] active:shadow-[0_2px_0_0_black] transition-all",
        accent:
          "bg-accent text-accent-foreground rounded-full border-2 border-black shadow-[0_4px_0_0_black] hover:shadow-[0_7px_0_0_black] hover:translate-y-[-3px] active:translate-y-[1px] active:shadow-[0_2px_0_0_black] transition-all",
        destructive:
          "bg-destructive text-white rounded-full border-2 border-black shadow-[0_4px_0_0_black] hover:shadow-[0_7px_0_0_black] hover:translate-y-[-3px] active:translate-y-[1px] active:shadow-[0_2px_0_0_black] transition-all",
        outline:
          "border-2 border-primary bg-transparent text-primary rounded-full hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80",
        ghost:
          "hover:bg-primary/5 hover:text-primary rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-full px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-4 has-[>svg]:px-3 text-sm",
        lg: "h-12 px-8 text-base has-[>svg]:px-5",
        xl: "h-14 px-10 text-lg has-[>svg]:px-6",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
