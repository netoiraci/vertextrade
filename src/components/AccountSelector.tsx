import { useState } from "react";
import { Plus, ChevronDown, Settings, Trash2 } from "lucide-react";
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

export function AccountSelector() {
  const {
    accounts,
    activeAccount,
    setActiveAccountId,
    createAccount,
    updateAccount,
    deleteAccount,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTradingAccounts();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const handleCreate = () => {
    if (newAccountName.trim()) {
      createAccount(newAccountName.trim());
      setNewAccountName("");
      setIsCreateOpen(false);
    }
  };

  const handleEdit = () => {
    if (editingAccount && editingAccount.name.trim()) {
      updateAccount({ id: editingAccount.id, name: editingAccount.name });
      setIsEditOpen(false);
      setEditingAccount(null);
    }
  };

  const handleDelete = () => {
    if (deletingAccountId) {
      deleteAccount(deletingAccountId);
      setIsDeleteOpen(false);
      setDeletingAccountId(null);
    }
  };

  const openEditDialog = (account: TradingAccount) => {
    setEditingAccount({ ...account });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (accountId: string) => {
    setDeletingAccountId(accountId);
    setIsDeleteOpen(true);
  };

  if (accounts.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCreateOpen(true)}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Criar Conta
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 min-w-[150px] justify-between">
            <span className="truncate">{activeAccount?.name || "Selecionar Conta"}</span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] bg-popover border-border z-50">
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setActiveAccountId(account.id)}
            >
              <span className={account.id === activeAccount?.id ? "font-semibold text-primary" : ""}>
                {account.name}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(account);
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                {accounts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(account.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Dialog */}
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
            <DialogDescription>
              Altere o nome da conta de trading.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Conta</Label>
              <Input
                value={editingAccount?.name || ""}
                onChange={(e) => setEditingAccount(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Nome da conta"
                className="bg-secondary/30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isUpdating || !editingAccount?.name.trim()}>
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá excluir permanentemente a conta e todo o histórico de trades associado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
