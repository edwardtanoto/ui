import type React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // <CHANGE> Changed rounded-md to rounded-[2px] for brutalist style
      className={cn("bg-accent animate-pulse rounded-[2px]", className)}
      {...props}
    />
  )
}

export { Skeleton }
