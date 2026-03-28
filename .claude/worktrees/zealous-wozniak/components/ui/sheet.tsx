"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn("fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm", className)}
    ref={ref}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col gap-6 border-l border-border bg-card px-6 py-6 text-foreground shadow-2xl outline-none",
        className,
      )}
      ref={ref}
      {...props}
    >
      <DialogPrimitive.Close className="ml-auto inline-flex rounded-full p-2 text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground">
        <X className="h-5 w-5" />
        <span className="sr-only">Close menu</span>
      </DialogPrimitive.Close>
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetOverlay, SheetPortal, SheetTrigger };
