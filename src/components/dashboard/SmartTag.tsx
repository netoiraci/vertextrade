import { Trade } from "@/lib/parseTradeReport";

interface SmartTagProps {
  trade: Trade;
}

type TagType = {
  label: string;
  color: string;
};

export function getSmartTags(trade: Trade): TagType[] {
  const tags: TagType[] = [];
  
  // Scalp: duration < 5 min
  if (trade.duration < 5) {
    tags.push({ label: 'Scalp', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' });
  }
  
  // Swing: duration > 4 hours (240 min)
  if (trade.duration > 240) {
    tags.push({ label: 'Swing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' });
  }
  
  // Tarde: open time > 12:00
  const hour = trade.openTime.getHours();
  if (hour >= 12 && hour < 18) {
    tags.push({ label: 'Tarde', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' });
  } else if (hour >= 18) {
    tags.push({ label: 'Noite', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' });
  } else if (hour < 9) {
    tags.push({ label: 'Abertura', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' });
  }
  
  // Carry Negativo: swap < -1
  if ((trade.swap || 0) < -1) {
    tags.push({ label: 'Carry -', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' });
  }
  
  // Big Win ou Big Loss (>= $100 ou <= -$100)
  if (trade.netProfit >= 100) {
    tags.push({ label: 'Big Win', color: 'bg-success/20 text-success border-success/30' });
  } else if (trade.netProfit <= -100) {
    tags.push({ label: 'Big Loss', color: 'bg-danger/20 text-danger border-danger/30' });
  }
  
  return tags;
}

export function SmartTag({ trade }: SmartTagProps) {
  const tags = getSmartTags(trade);
  
  if (tags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag, index) => (
        <span 
          key={index}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${tag.color}`}
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
