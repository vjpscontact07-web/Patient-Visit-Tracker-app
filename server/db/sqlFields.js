export function timestampFields(alias = "") {
  const prefix = alias ? `${alias}.` : "";
  return `${prefix}created_at, ${prefix}updated_at`;
}
