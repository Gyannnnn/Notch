type ClassValue = string | false | null | undefined;

/** Joins class names, dropping falsy ones so conditionals read inline. */
export const cn = (...parts: ClassValue[]) => parts.filter(Boolean).join(" ");
