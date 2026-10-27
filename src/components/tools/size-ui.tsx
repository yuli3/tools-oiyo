import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';

/* WHY 2026-10-27 (W6b): Blog's size converters were written against shadcn primitives
 * (radix-ui toggle group, field, input group, table). Tools has no radix dependency, so these
 * are plain-HTML stand-ins with the same names and props the three converters use. */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

export function Button({ variant, size, className, ...p }: ComponentProps<'button'> & { variant?: string; size?: string }) {
  const look = variant === 'ghost' ? 'border-transparent bg-transparent' : 'border-border bg-background';
  const box = size === 'icon' || size === 'icon-sm' ? 'size-11 justify-center' : 'min-h-11 px-3';
  return <button type="button" className={cx('inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium text-foreground', look, box, className)} {...p} />;
}

export const Card = ({ className, ...p }: ComponentProps<'div'>) => <div className={cx('rounded-2xl border border-border bg-card', className)} {...p} />;
export const CardHeader = ({ className, ...p }: ComponentProps<'div'>) => <div className={cx('space-y-1 p-4 pb-2', className)} {...p} />;
export const CardTitle = ({ className, ...p }: ComponentProps<'div'>) => <div className={cx('text-base font-bold', className)} {...p} />;
export const CardDescription = ({ className, ...p }: ComponentProps<'div'>) => <div className={cx('text-sm text-muted-foreground', className)} {...p} />;
export const CardContent = ({ className, ...p }: ComponentProps<'div'>) => <div className={cx('p-4 pt-2', className)} {...p} />;

export const FieldGroup = ({ className, ...p }: ComponentProps<'div'>) => <div className={cx('grid gap-4', className)} {...p} />;
export const Field = ({ className, ...p }: ComponentProps<'div'>) => <div className={cx('grid gap-1.5', className)} {...p} />;
export const FieldLabel = ({ className, ...p }: ComponentProps<'label'>) => <label className={cx('text-sm font-medium', className)} {...p} />;
export const FieldDescription = ({ className, ...p }: ComponentProps<'p'>) => <p className={cx('text-xs text-muted-foreground', className)} {...p} />;

export const InputGroup = ({ className, ...p }: ComponentProps<'div'>) => <div className={cx('flex min-h-11 items-center rounded-lg border border-input bg-background', className)} {...p} />;
export const InputGroupAddon = ({ className, align: _align, ...p }: ComponentProps<'div'> & { align?: string }) => <div className={cx('px-3 text-sm text-muted-foreground', className)} {...p} />;
export const InputGroupInput = ({ className, ...p }: ComponentProps<'input'>) => <input className={cx('min-h-11 w-full min-w-0 bg-transparent px-3 text-base outline-none', className)} {...p} />;

export const Table = ({ className, ...p }: ComponentProps<'table'>) => <div className="w-full overflow-x-auto"><table className={cx('w-full text-sm', className)} {...p} /></div>;
export const TableHeader = (p: ComponentProps<'thead'>) => <thead {...p} />;
export const TableBody = (p: ComponentProps<'tbody'>) => <tbody {...p} />;
export const TableRow = ({ className, ...p }: ComponentProps<'tr'>) => <tr className={cx('border-b border-border', className)} {...p} />;
export const TableHead = ({ className, ...p }: ComponentProps<'th'>) => <th className={cx('px-2 py-2 text-left font-semibold text-muted-foreground', className)} {...p} />;
export const TableCell = ({ className, ...p }: ComponentProps<'td'>) => <td className={cx('px-2 py-2', className)} {...p} />;

const ToggleCtx = createContext<{ value: string; set: (v: string) => void }>({ value: '', set: () => {} });

export function ToggleGroup({ value, onValueChange, className, children }: { type?: 'single'; value: string; onValueChange: (v: string) => void; variant?: string; className?: string; children: ReactNode }) {
  return (
    <ToggleCtx.Provider value={{ value, set: onValueChange }}>
      <div role="group" className={cx('flex flex-wrap gap-2', className)}>{children}</div>
    </ToggleCtx.Provider>
  );
}

export function ToggleGroupItem({ value, className, children, ...p }: Omit<ComponentProps<'button'>, 'value'> & { value: string }) {
  const g = useContext(ToggleCtx);
  const on = g.value === value;
  return (
    <button type="button" aria-pressed={on} onClick={() => g.set(value)} {...p}
      className={cx('min-h-11 flex-1 whitespace-nowrap rounded-lg border px-3 text-sm font-semibold', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground', className)}>
      {children}
    </button>
  );
}

// lucide's rotate-ccw path, inlined because Tools does not ship lucide-react.
export const RotateCcw = ({ className }: { className?: string }) => (
  <svg className={cx('size-4', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);
