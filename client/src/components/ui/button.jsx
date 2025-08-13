import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible,
  {
    variants,
        destructive,
        outline,
        secondary,
        ghost,
        link,
      },
      size,
        sm,
        lg,
        icon,
      },
    },
    defaultVariants,
      size,
    },
  }
)

export , ref) => {
    const Comp = asChild ? Slot, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
