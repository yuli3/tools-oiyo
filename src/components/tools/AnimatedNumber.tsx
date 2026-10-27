interface Props {
  value: number;
  format?: Intl.NumberFormatOptions;
  locales?: string | string[];
  prefix?: string;
  suffix?: string;
  className?: string;
}

/* WHY 2026-10-27 (W8): Blog animated this with @number-flow/react. Tools does not ship that
 * package, so DsrCalculator keeps the same call site and gets a plain formatted number. */
export default function AnimatedNumber({ value, format, locales, prefix = '', suffix = '', className }: Props) {
  return (
    <span className={className}>
      {prefix}
      {new Intl.NumberFormat(locales, format).format(value)}
      {suffix}
    </span>
  );
}
