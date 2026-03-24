export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return 'Bs. 0';

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return 'Bs. 0';

  return 'Bs. ' + num.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseNumeric(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  return isNaN(num) ? 0 : num;
}

export function calculatePercentage(partial: number, total: number): number {
  if (total === 0) return 0;
  return (partial / total) * 100;
}
