type Options = {
  variants: Record<string, Record<string, string>>;
  defaultVariants?: Record<string, string>;
};

export function cva(base: string, options?: Options) {
  return function getClasses(variantInput?: Record<string, string>) {
    const parts = [base];
    const variants = options?.variants ?? {};
    const defaults = options?.defaultVariants ?? {};
    const active = { ...defaults, ...(variantInput ?? {}) };
    for (const key of Object.keys(variants)) {
      const val = active[key];
      if (val && variants[key]?.[val]) parts.push(variants[key][val]);
    }
    return parts.filter(Boolean).join(" ");
  };
}
