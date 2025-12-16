import { Briefcase } from "lucide-react";
import { useTradingAccounts } from "@/hooks/useTradingAccounts";

export function ActiveAccountBanner() {
  const { activeAccount, accounts } = useTradingAccounts();

  if (!activeAccount || accounts.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm">
      <Briefcase className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">Conta ativa:</span>
      <span className="font-medium text-foreground">{activeAccount.name}</span>
    </div>
  );
}
