export type Formatter = (value: unknown, pattern: string) => string;

const builtInFormatters: Record<string, Formatter> = {
  date: (value, pattern) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(String(value));
    if (isNaN(d.getTime())) return String(value);
    if (!pattern) return d.toLocaleDateString();
    return pattern
      .replace('YYYY', String(d.getFullYear()))
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(d.getDate()).padStart(2, '0'));
  },
  number: (value, pattern) => {
    const n = Number(value);
    if (isNaN(n)) return String(value);
    if (!pattern) return n.toLocaleString();
    const decimals = parseInt(pattern, 10);
    return isNaN(decimals) ? n.toLocaleString() : n.toFixed(decimals);
  },
  uppercase: (value) => String(value ?? '').toUpperCase(),
  lowercase: (value) => String(value ?? '').toLowerCase(),
};

// Matches {{fieldName}} or {{fieldName,formatter::pattern}}
const TEMPLATE_RE = /\{\{([^}]+)\}\}/g;

export function resolveTemplate(
  template: string,
  values: Record<string, unknown>,
  formatters?: Record<string, Formatter>
): string {
  const allFormatters = { ...builtInFormatters, ...formatters };

  return template.replace(TEMPLATE_RE, (match, expr: string) => {
    const commaIdx = expr.indexOf(',');
    if (commaIdx === -1) {
      const fieldName = expr.trim();
      const val = values[fieldName];
      return val !== undefined ? String(val) : match;
    }

    const fieldName = expr.slice(0, commaIdx).trim();
    const rest = expr.slice(commaIdx + 1).trim();
    const colonIdx = rest.indexOf('::');
    const formatterName = colonIdx === -1 ? rest : rest.slice(0, colonIdx);
    const pattern = colonIdx === -1 ? '' : rest.slice(colonIdx + 2);

    const val = values[fieldName];
    if (val === undefined) return match;

    const fn = allFormatters[formatterName];
    if (!fn) return String(val);
    return fn(val, pattern);
  });
}

export function extractTemplateFields(template: string): string[] {
  const fields: string[] = [];
  let m: RegExpExecArray | null;
  const re = /\{\{([^}]+)\}\}/g;
  while ((m = re.exec(template)) !== null) {
    const expr = m[1];
    const commaIdx = expr.indexOf(',');
    const fieldName = (commaIdx === -1 ? expr : expr.slice(0, commaIdx)).trim();
    if (!fields.includes(fieldName)) fields.push(fieldName);
  }
  return fields;
}
