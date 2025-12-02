import type React from "react"
import { cn } from "@/lib/utils"

// <CHANGE> Custom brutalist square spinner instead of circular
function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div role="status" aria-label="Loading" className={cn("relative size-4", className)} {...props}>
      <div className="absolute inset-0 animate-spin">
        <div className="size-full rounded-[2px] border-2 border-foreground/20 border-t-foreground" />
      </div>
    </div>
  )
}

export { Spinner }
