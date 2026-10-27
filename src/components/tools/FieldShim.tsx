// Minimal stand-ins for Blog's shadcn field/input-group primitives, so ported Blog tools keep their markup.
import type { ComponentProps } from "react";

const cx = (...c: (string | undefined | false)[]) => c.filter(Boolean).join(" ");

export const Field = ({ className, ...p }: ComponentProps<"div">) => <div className={cx("flex flex-col gap-1.5", className)} {...p} />;
export const FieldGroup = ({ className, ...p }: ComponentProps<"div">) => <div className={cx("flex flex-col gap-4", className)} {...p} />;
export const FieldLabel = ({ className, ...p }: ComponentProps<"label">) => <label className={cx("text-sm font-medium text-foreground", className)} {...p} />;
export const FieldError = ({ className, ...p }: ComponentProps<"p">) => <p role="alert" className={cx("text-sm text-destructive", className)} {...p} />;
export const InputGroup = ({ className, ...p }: ComponentProps<"div">) => (
  <div className={cx("flex items-stretch overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring", className)} {...p} />
);
export const InputGroupInput = ({ className, ...p }: ComponentProps<"input">) => (
  <input className={cx("min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none", className)} {...p} />
);
export const InputGroupAddon = ({ className, ...p }: ComponentProps<"div">) => (
  <div className={cx("flex items-center border-l border-input px-3 text-sm text-muted-foreground", className)} {...p} />
);
