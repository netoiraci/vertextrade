import { differenceInMinutes, differenceInHours } from 'date-fns';
import { Trade } from '@/lib/parseTradeReport';

export interface TradePricePoint {
  timestamp: number;
  price: number;
}

export function formatPnL(value: number): string {
  const formatted = Math.abs(value).toFixed(2);
  return value >= 0 ? `+$${formatted}` : `-$${formatted}`;
}

export function getPnLColor(value: number): string {
  return value >= 0 ? 'text-success' : 'text-danger';
}

export function getPnLBgColor(value: number): string {
  return value >= 0 ? 'bg-success/10' : 'bg-danger/10';
}

export function calculateDuration(openTime: Date, closeTime: Date): string {
  const minutes = differenceInMinutes(closeTime, openTime);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
}

export function generateTradePriceEvolution(trade: Trade): TradePricePoint[] {
  const points: TradePricePoint[] = [];
  const duration = differenceInMinutes(trade.closeTime, trade.openTime);
  const numPoints = Math.min(Math.max(duration, 20), 50);
  
  const priceChange = trade.closePrice - trade.openPrice;
  const volatility = Math.abs(priceChange) * 0.3;
  
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const timestamp = trade.openTime.getTime() + (progress * duration * 60 * 1000);
    
    // Random walk with bias towards final price
    const basePrice = trade.openPrice + (priceChange * progress);
    const randomWalk = (Math.random() - 0.5) * volatility * (1 - progress);
    const price = basePrice + randomWalk;
    
    points.push({
      timestamp,
      price: parseFloat(price.toFixed(5))
    });
  }
  
  // Ensure last point matches closePrice
  if (points.length > 0) {
    points[points.length - 1].price = trade.closePrice;
  }
  
  return points;
}
