export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
  }
}

export function validateString(
  val: unknown,
  field: string,
  opts?: { maxLen?: number; required?: boolean }
): string {
  if (opts?.required && (val === undefined || val === null || val === "")) {
    throw new ValidationError(field, `${field} is required`);
  }
  if (val === undefined || val === null) return "";
  if (typeof val !== "string")
    throw new ValidationError(field, `${field} must be a string`);
  const s = val.trim();
  if (opts?.maxLen && s.length > opts.maxLen)
    throw new ValidationError(
      field,
      `${field} exceeds max length ${opts.maxLen}`
    );
  return s;
}

export function validateNumber(
  val: unknown,
  field: string,
  opts?: { min?: number; max?: number }
): number | null {
  if (val === undefined || val === null || val === "") return null;
  const n = Number(val);
  if (isNaN(n))
    throw new ValidationError(field, `${field} must be a number`);
  if (opts?.min !== undefined && n < opts.min)
    throw new ValidationError(field, `${field} must be >= ${opts.min}`);
  if (opts?.max !== undefined && n > opts.max)
    throw new ValidationError(field, `${field} must be <= ${opts.max}`);
  return n;
}

export function validateEnum<T extends string>(
  val: unknown,
  field: string,
  allowed: T[]
): T {
  if (!allowed.includes(val as T))
    throw new ValidationError(
      field,
      `${field} must be one of: ${allowed.join(", ")}`
    );
  return val as T;
}

export function handleValidationError(err: unknown): Response | null {
  if (err instanceof ValidationError) {
    return Response.json(
      { error: err.message, field: err.field },
      { status: 400 }
    );
  }
  return null;
}
