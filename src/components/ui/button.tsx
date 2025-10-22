import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva } from "./cva";
import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-white shadow-modern hover:shadow-modern-lg hover:scale-105 hover:brightness-110",
        outline:
          "border-2 border-gray-300 bg-background/80 backdrop-blur-sm text-foreground hover:bg-gray-100 hover:border-gray-400 hover:scale-105",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        secondary:
          "bg-gradient-secondary text-white shadow-modern hover:shadow-modern-lg hover:scale-105 hover:brightness-110",
        accent:
          "bg-gradient-accent text-white shadow-modern hover:shadow-modern-lg hover:scale-105 hover:brightness-110",
        success:
          "bg-gradient-success text-white shadow-modern hover:shadow-modern-lg hover:scale-105 hover:brightness-110",
        warning:
          "bg-gradient-warning text-white shadow-modern hover:shadow-modern-lg hover:scale-105 hover:brightness-110",
        danger:
          "bg-gradient-danger text-white shadow-modern hover:shadow-modern-lg hover:scale-105 hover:brightness-110",
        glass:
          "glass text-foreground hover:glass-strong hover:scale-105",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "accent" | "success" | "warning" | "danger" | "glass";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    if (asChild) {
      const { children, ...restProps } = props;
      return (
        <span className={cn(buttonVariants({ variant, size }), className)} {...restProps} ref={ref}>
          {children}
        </span>
      );
    }
    
    return (
      <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  }
);

Button.displayName = "Button";

export { Button };
