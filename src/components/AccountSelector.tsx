import { useState, useEffect } from "react";
import { Plus, ChevronDown, Settings, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTradingAccounts, TradingAccount } from "@/hooks/useTradingAccounts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export function AccountSelector() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    accounts,
    activeAccount,
    setActiveAccountId,
    createAccount,
    deleteAccount,
    isCreating,
    isDeleting,
  } = useTradingAccounts();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<TradingAccount | null>(null);
  const [hasLinkedOrphanTrades, setHasLinkedOrphanTrades] = useState(false);

  // Auto-link orphan trades (trades without account_id) to the first account
  useEffect(() => {
    const linkOrphanTrades = async () => {
      if (!user || accounts.length === 0 || hasLinkedOrphanTrades) return;
      
      const firstAccount = accounts[0];
      
      // Update all trades without account_id to link to the first account
      const { error } = await supabase
        .from("trades")
        .update({ account_id: firstAccount.id })
        .eq("user_id", user.id)
        .is("account_id", null);
      
      if (!error) {
        setHasLinkedOrphanTrades(true);
        queryClient.invalidateQueries({ queryKey: ["trades"] });
      }
    };

    linkOrphanTrades();
  }, [user, accounts, hasLinkedOrphanTrades, queryClient]);

  const handleCreate = () => {
    if (newAccountName.trim()) {
      createAccount(newAccountName.trim());
      setNewAccountName("");
      setIsCreateOpen(false);
    }
  };

  const handleDeleteAccount = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  // If no accounts, show button to create first one
  if (accounts.length === 0) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 bg-primary/10 border-primary/30 hover:bg-primary/20"
        >
          <Plus className="h-4 w-4" />
          Adicionar Conta
        </Button>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Criar Nova Conta</DialogTitle>
              <DialogDescription>
                Crie uma subconta para separar seus históricos de trading.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Conta</Label>
                <Input
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="Ex: FTMO Challenge, Conta Real, etc."
                  className="bg-secondary/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !newAccountName.trim()}>
                {isCreating ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 min-w-[160px] justify-between bg-primary/10 border-primary/30 hover:bg-primary/20"
          >
            <span className="truncate font-medium">{activeAccount?.name || "Selecionar Conta"}</span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] bg-card border-border z-50">
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => setActiveAccountId(account.id)}
            >
              <span className={account.id === activeAccount?.id ? "font-medium" : "text-muted-foreground"}>
                {account.name}
              </span>
              {account.id === activeAccount?.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => setIsManageOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Editar Portfólios
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Manage Accounts Dialog */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Portfólios</DialogTitle>
            <DialogDescription>
              Crie, edite ou exclua suas contas de trading.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Existing accounts */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Suas Contas</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      account.id === activeAccount?.id 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-secondary/30 border-border hover:bg-secondary/50"
                    }`}
                    onClick={() => {
                      setActiveAccountId(account.id);
                    }}
                  >
                    {editingAccount?.id === account.id ? (
                      <Input
                        value={editingAccount.name}
                        onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                        onBlur={async () => {
                          if (editingAccount.name.trim()) {
                            await supabase
                              .from("trading_accounts")
                              .update({ name: editingAccount.name })
                              .eq("id", editingAccount.id);
                            queryClient.invalidateQueries({ queryKey: ["trading-accounts"] });
                          }
                          setEditingAccount(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="h-7 bg-background"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="font-medium">{account.name}</span>
                    )}
                    <div className="flex items-center gap-1">
                      {account.id === activeAccount?.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAccount({ ...account });
                        }}
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccountToDelete(account);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create new account */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Adicionar Nova</Label>
              <div className="flex gap-2">
                <Input
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="Nome da nova conta..."
                  className="bg-secondary/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreate();
                    }
                  }}
                />
                <Button 
                  onClick={handleCreate} 
                  disabled={isCreating || !newAccountName.trim()}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsManageOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!accountToDelete} onOpenChange={() => setAccountToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta "{accountToDelete?.name}"? 
              Todos os trades vinculados a esta conta também serão excluídos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
