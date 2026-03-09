export function parseListingDate(s: string): Date | null {
  if (!s) return null;
  const m = s.match(/(\d+)월\s*(\d+)일/);
  if (m) {
    const now = new Date();
    return new Date(now.getFullYear(), +m[1] - 1, +m[2]);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function isNewListing(dateStr: string, daysThreshold = 7): boolean {
  const d = parseListingDate(dateStr);
  if (!d) return false;
  const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= daysThreshold;
}
