export function getInitials(nomeCompleto: string | null | undefined): string {
  if (!nomeCompleto?.trim()) return '?';
  const parts = nomeCompleto.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
