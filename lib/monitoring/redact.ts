const SENSITIVE_KEY = /(^|_)(authorization|cookie|email|ip|password|secret|token)(_|$)/i;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const TOKEN_QUERY = /([?&](?:token|code)=)[^&\s]+/gi;

function redactString(value: string): string {
  return value
    .replace(EMAIL, '[REDACTED_EMAIL]')
    .replace(IPV4, '[REDACTED_IP]')
    .replace(BEARER, 'Bearer [REDACTED]')
    .replace(TOKEN_QUERY, '$1[REDACTED]');
}

export function redactSensitiveData<T>(value: T): T {
  const seen = new WeakSet<object>();

  const visit = (input: unknown, key?: string): unknown => {
    if (key && SENSITIVE_KEY.test(key)) return '[REDACTED]';
    if (typeof input === 'string') return redactString(input);
    if (input === null || typeof input !== 'object') return input;
    if (seen.has(input)) return '[Circular]';
    seen.add(input);

    if (input instanceof Error) {
      return {
        name: input.name,
        message: redactString(input.message),
        stack: input.stack ? redactString(input.stack) : undefined,
      };
    }

    if (Array.isArray(input)) return input.map((item) => visit(item));

    return Object.fromEntries(
      Object.entries(input).map(([entryKey, entryValue]) => [entryKey, visit(entryValue, entryKey)])
    );
  };

  return visit(value) as T;
}
