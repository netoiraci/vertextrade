import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { Trade } from "@/lib/parseTradeReport";
import { useToast } from "@/hooks/use-toast";

interface AddTradeDialogProps {
  trigger?: React.ReactNode;
}

export function AddTradeDialog({ trigger }: AddTradeDialogProps) {
  const [open, setOpen] = useState(false);
  const { saveTrades, isSaving } = useTrades();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    symbol: "",
    type: "buy" as "buy" | "sell",
    size: "",
    openPrice: "",
    closePrice: "",
    openTime: "",
    closeTime: "",
    commission: "0",
    swap: "0",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const openTime = new Date(formData.openTime);
    const closeTime = new Date(formData.closeTime);
    const openPrice = parseFloat(formData.openPrice);
    const closePrice = parseFloat(formData.closePrice);
    const size = parseFloat(formData.size);
    const commission = parseFloat(formData.commission) || 0;
    const swap = parseFloat(formData.swap) || 0;

    if (isNaN(openTime.getTime()) || isNaN(closeTime.getTime())) {
      toast({ title: "Erro", description: "Datas inválidas", variant: "destructive" });
      return;
    }

    // Calculate profit based on trade type
    let profit = 0;
    if (formData.type === "buy") {
      profit = (closePrice - openPrice) * size * 100000; // Standard lot calculation
    } else {
      profit = (openPrice - closePrice) * size * 100000;
    }

    // For simpler calculation without pip value complexity
    // Users can input the actual profit if they prefer
    const netProfit = profit + commission + swap;
    const duration = Math.round((closeTime.getTime() - openTime.getTime()) / 60000);

    const trade: Trade = {
      ticket: `MANUAL-${Date.now()}`,
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      size,
      openPrice,
      closePrice,
      openTime,
      closeTime,
      commission,
      swap,
      profit,
      netProfit,
      duration,
      isWin: netProfit > 0,
    };

    saveTrades([trade]);
    setOpen(false);
    setFormData({
      symbol: "",
      type: "buy",
      size: "",
      openPrice: "",
      closePrice: "",
      openTime: "",
      closeTime: "",
      commission: "0",
      swap: "0",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Trade Manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Símbolo</Label>
              <Input
                id="symbol"
                placeholder="EURUSD"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as "buy" | "sell" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Lote</Label>
              <Input
                id="size"
                type="number"
                step="0.01"
                placeholder="0.10"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openPrice">Preço Entrada</Label>
              <Input
                id="openPrice"
                type="number"
                step="0.00001"
                placeholder="1.08500"
                value={formData.openPrice}
                onChange={(e) => setFormData({ ...formData, openPrice: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closePrice">Preço Saída</Label>
              <Input
                id="closePrice"
                type="number"
                step="0.00001"
                placeholder="1.08600"
                value={formData.closePrice}
                onChange={(e) => setFormData({ ...formData, closePrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openTime">Data/Hora Entrada</Label>
              <Input
                id="openTime"
                type="datetime-local"
                value={formData.openTime}
                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeTime">Data/Hora Saída</Label>
              <Input
                id="closeTime"
                type="datetime-local"
                value={formData.closeTime}
                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Comissão ($)</Label>
              <Input
                id="commission"
                type="number"
                step="0.01"
                placeholder="-2.00"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swap">Swap ($)</Label>
              <Input
                id="swap"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.swap}
                onChange={(e) => setFormData({ ...formData, swap: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Trade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
