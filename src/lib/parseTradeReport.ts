export interface Trade {
  ticket: string;
  openTime: Date;
  type: 'buy' | 'sell';
  size: number;
  symbol: string;
  openPrice: number;
  closeTime: Date;
  closePrice: number;
  commission: number;
  swap: number;
  profit: number;
  netProfit: number;
  duration: number;
  isWin: boolean;
}

export function parseTradeReport(fileContent: string): Trade[] {
  const lines = fileContent.split('\n');
  const trades: Trade[] = [];
  
  // Find the start of closed transactions
  let startIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Closed Transactions:')) {
      startIndex = i + 2; // Skip "Closed Transactions:" and header line
      break;
    }
  }
  
  if (startIndex === -1) return trades;
  
  // Parse each trade line
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.includes('Total:') || line.includes('Closed P/L:') || line.includes('Open Trades:')) break;
    
    // Split by tab
    const parts = line.split('\t').filter(Boolean);
    if (parts.length < 10) continue;
    
    // Skip balance/deposit lines and cancelled orders
    const type = parts[2].toLowerCase();
    if (type === 'balance' || (parts.length > 10 && parts[parts.length - 1] === 'cancelled')) {
      continue;
    }
    
    try {
      const ticket = parts[0];
      const openTime = parseDateTime(parts[1]);
      const tradingType = type.includes('buy') ? 'buy' : 'sell';
      const size = parseFloat(parts[3]);
      const symbol = parts[4].toLowerCase();
      const openPrice = parseFloat(parts[5]);
      // Parts 6 and 7 are S/L and T/P - skip them
      const closeTime = parseDateTime(parts[8]);
      const closePrice = parseFloat(parts[9]);
      const commission = parseFloat(parts[10]) || 0;
      // Part 11 is Taxes - skip it
      const swap = parseFloat(parts[12]) || 0;
      const profit = parseFloat(parts[13]) || 0;
      
      const netProfit = profit + commission + swap;
      const duration = (closeTime.getTime() - openTime.getTime()) / (1000 * 60); // in minutes
      const isWin = netProfit > 0;
      
      trades.push({
        ticket,
        openTime,
        type: tradingType,
        size,
        symbol,
        openPrice,
        closeTime,
        closePrice,
        commission,
        swap,
        profit,
        netProfit,
        duration,
        isWin,
      });
    } catch (error) {
      console.warn('Failed to parse line:', line, error);
    }
  }
  
  return trades;
}

function parseDateTime(dateStr: string): Date {
  // Handle format: YYYY.MM.DD HH:MM
  const cleanStr = dateStr.trim();
  const [datePart, timePart] = cleanStr.split(' ');
  const [year, month, day] = datePart.split('.').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes);
}

export function calculateMetrics(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      totalPnL: 0,
      expectancy: 0,
      totalWins: 0,
      totalLosses: 0,
      grossProfit: 0,
      grossLoss: 0,
      avgWin: 0,
      avgLoss: 0,
      largestWin: 0,
      largestLoss: 0,
    };
  }
  
  const wins = trades.filter(t => t.isWin);
  const losses = trades.filter(t => !t.isWin);
  
  const grossProfit = wins.reduce((sum, t) => sum + t.netProfit, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.netProfit, 0));
  const totalPnL = trades.reduce((sum, t) => sum + t.netProfit, 0);
  
  const winRate = (wins.length / trades.length) * 100;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const expectancy = totalPnL / trades.length;
  
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  
  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.netProfit)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.netProfit)) : 0;
  
  return {
    totalTrades: trades.length,
    winRate,
    profitFactor,
    totalPnL,
    expectancy,
    totalWins: wins.length,
    totalLosses: losses.length,
    grossProfit,
    grossLoss,
    avgWin,
    avgLoss,
    largestWin,
    largestLoss,
  };
}
