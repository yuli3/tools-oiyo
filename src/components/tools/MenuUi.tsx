import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react';

// WHY 2026-10-27: Tools has no shadcn Button/Card or lucide; the menu roulette moved from Blog
// keeps its markup with these small theme-token stand-ins.
type Variant = 'default' | 'outline' | 'secondary' | 'ghost';
type Size = 'default' | 'sm' | 'lg';
const VARIANT: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-border bg-background text-foreground hover:bg-muted',
  secondary: 'bg-muted text-foreground hover:opacity-90',
  ghost: 'text-foreground hover:bg-muted',
};
const SIZE: Record<Size, string> = { default: 'min-h-11 px-4 text-sm', sm: 'min-h-11 px-3 text-sm', lg: 'min-h-11 px-6 text-base' };

export function Button({ variant = 'default', size = 'default', asChild = false, className = '', children, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; asChild?: boolean }) {
  const cls = `inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-50 ${VARIANT[variant]} ${SIZE[size]} ${className}`;
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, { className: `${cls} ${child.props.className ?? ''}` });
  }
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

const box = (base: string) => ({ className = '', children }: { className?: string; children?: ReactNode }) => <div className={`${base} ${className}`}>{children}</div>;
export const Card = box('rounded-2xl border border-border bg-card text-foreground');
export const CardHeader = box('p-4 sm:p-6');
export const CardContent = box('p-4 pt-0 sm:p-6 sm:pt-0');
export const CardTitle = box('text-lg font-bold');
export const CardDescription = box('mt-1 text-sm text-muted-foreground');

const icon = (glyph: string) => ({ className = '' }: { className?: string }) => <span aria-hidden="true" className={`inline-flex items-center justify-center leading-none ${className}`}>{glyph}</span>;
export const Shuffle = icon('🔀');
export const Heart = icon('♥');
export const Share2 = icon('↗');
export const History = icon('🕘');
export const Trash2 = icon('✕');
export const Search = icon('🔍');
export const CheckCircle = icon('✓');
export const Swords = icon('⚔');
