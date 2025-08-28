import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover,
  {
    variants,
        outline,
      },
      size,
        sm,
        lg,
      },
    },
    defaultVariants,
      size,
    },
  }
)

const Toggle = React.forwardRef,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
