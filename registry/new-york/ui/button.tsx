"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium font-mono uppercase rounded-[2px] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function getDitherColor(variant: string | null | undefined): string {
  switch (variant) {
    case "secondary":
      return "rgba(0, 0, 0, 0.15)"
    case "destructive":
      return "rgba(255, 255, 255, 0.25)"
    default:
      return "rgba(255, 255, 255, 0.15)"
  }
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  dither?: boolean
  hotkey?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, dither = false, hotkey, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const [isHovered, setIsHovered] = React.useState(false)
    const animationRef = React.useRef<number>(0)
    const progressRef = React.useRef(0)

    React.useImperativeHandle(ref, () => buttonRef.current!)

    React.useEffect(() => {
      if (!dither || !canvasRef.current || !buttonRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const updateCanvasSize = () => {
        const rect = buttonRef.current!.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
      }

      updateCanvasSize()

      const bayerMatrix = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5],
      ]

      const ditherColor = getDitherColor(variant)

      const drawDither = (progress: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const pixelSize = 3
        const threshold = progress * 16

        for (let y = 0; y < canvas.height; y += pixelSize) {
          for (let x = 0; x < canvas.width; x += pixelSize) {
            const matrixX = Math.floor(x / pixelSize) % 4
            const matrixY = Math.floor(y / pixelSize) % 4
            const ditherValue = bayerMatrix[matrixY][matrixX]

            if (ditherValue < threshold) {
              ctx.fillStyle = ditherColor
              ctx.fillRect(x, y, pixelSize, pixelSize)
            }
          }
        }
      }

      const animate = () => {
        const targetProgress = isHovered ? 1 : 0
        const speed = 0.08

        progressRef.current += (targetProgress - progressRef.current) * speed

        if (Math.abs(targetProgress - progressRef.current) > 0.01) {
          drawDither(progressRef.current)
          animationRef.current = requestAnimationFrame(animate)
        } else {
          progressRef.current = targetProgress
          drawDither(progressRef.current)
        }
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        cancelAnimationFrame(animationRef.current)
      }
    }, [isHovered, dither, variant])

    const HotkeyBadge = hotkey ? (
      <span className="ml-2 inline-flex items-center justify-center rounded-[2px] border border-current/20 bg-current/10 px-1.5 py-0.5 text-[10px] font-mono uppercase leading-none">
        {hotkey}
      </span>
    ) : null

    if (!dither) {
      if (asChild) {
        return (
          <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
            {children}
          </Comp>
        )
      }
      return (
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
          {HotkeyBadge}
        </Comp>
      )
    }

    return (
      <button
        ref={buttonRef}
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
        <span className="relative z-10 inline-flex items-center">
          {children}
          {HotkeyBadge}
        </span>
      </button>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
