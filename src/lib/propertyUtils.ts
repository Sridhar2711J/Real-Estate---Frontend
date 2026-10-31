import { Property } from '@/types';

/**
 * Format Indian currency numbers into readable Crores / Lakhs / Thousands
 * e.g., 16500000 -> "₹1.65 Cr", 9200000 -> "₹92 L", 32000 -> "₹32,000"
 */
export function formatPrice(price: number): string {
  if (!price || isNaN(price)) return '₹ Price on Request';

  if (price >= 10000000) {
    const cr = price / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (price >= 100000) {
    const lakh = price / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, '')} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Section 8 from Architecture Document:
 * Similar properties recommendation algorithm (Weighted Multi-Factor Scoring)
 * - Price closeness (40% weight): 1 - |price diff| / price (candidates within +/- 25-35%)
 * - Same location (25% weight): 1 if same location, else 0
 * - Bedrooms (20% weight): 1 if exact, 0.5 if off by one, else 0
 * - Area closeness (15% weight): 1 - |area diff| / area
 */
export function calculateSimilarProperties(
  targetProperty: Property,
  allProperties: Property[],
  limit = 4
): (Property & { score?: number })[] {
  const candidates = allProperties.filter((p) => p.id !== targetProperty.id);

  const scored = candidates.map((p) => {
    // Price closeness (40%)
    const priceDiffRatio = Math.abs(p.price - targetProperty.price) / (targetProperty.price || 1);
    const priceScore = Math.max(0, 1 - Math.min(priceDiffRatio, 1));

    // Same Location (25%)
    const targetLoc = (targetProperty.location || '').toLowerCase().trim();
    const pLoc = (p.location || '').toLowerCase().trim();
    const isSameLocation = Boolean(targetLoc && pLoc && pLoc === targetLoc);

    const targetCity = (targetProperty.city || '').toLowerCase().trim();
    const pCity = (p.city || '').toLowerCase().trim();
    const isSameCity = Boolean(targetCity && pCity && pCity === targetCity);
    const locationScore = isSameLocation ? 1.0 : isSameCity ? 0.4 : 0;

    // Bedrooms (20%)
    const bedDiff = Math.abs(p.bedrooms - targetProperty.bedrooms);
    const bedScore = bedDiff === 0 ? 1.0 : bedDiff === 1 ? 0.5 : 0;

    // Area Closeness (15%)
    const areaDiffRatio = Math.abs(p.area - targetProperty.area) / (targetProperty.area || 1);
    const areaScore = Math.max(0, 1 - Math.min(areaDiffRatio, 1));

    // Weighted composite score (0 - 100)
    const totalScore = (
      0.40 * priceScore +
      0.25 * locationScore +
      0.20 * bedScore +
      0.15 * areaScore
    ) * 100;

    return {
      ...p,
      score: Math.round(totalScore)
    };
  });

  // Sort descending by score
  return scored
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}
