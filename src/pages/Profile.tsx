import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useTradeContext } from "@/contexts/TradeContext";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, Lock, DollarSign, TrendingDown, AlertTriangle, Save, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Profile() {
  const { user, updatePassword } = useAuth();
  const { settings, updateSettings } = useTradeContext();
  const { toast } = useToast();
  
  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  
  // Trading settings state
  const [initialBalance, setInitialBalance] = useState(settings.initialBalance.toString());
  const [dailyLossLimit, setDailyLossLimit] = useState(settings.dailyLossLimit.toString());
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState(settings.maxDrawdownLimit.toString());
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    
    const validation = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!validation.success) {
      const errors: { newPassword?: string; confirmPassword?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "newPassword") errors.newPassword = err.message;
        if (err.path[0] === "confirmPassword") errors.confirmPassword = err.message;
      });
      setPasswordErrors(errors);
      return;
    }
    
    setIsChangingPassword(true);
    const { error } = await updatePassword(newPassword);
    setIsChangingPassword(false);
    
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha. Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    
    const newInitialBalance = parseFloat(initialBalance) || 100000;
    const newDailyLossLimit = parseFloat(dailyLossLimit) || 5000;
    const newMaxDrawdownLimit = parseFloat(maxDrawdownLimit) || 10000;
    
    updateSettings({
      initialBalance: newInitialBalance,
      dailyLossLimit: newDailyLossLimit,
      maxDrawdownLimit: newMaxDrawdownLimit,
    });
    
    setTimeout(() => {
      setIsSavingSettings(false);
      toast({
        title: "Sucesso",
        description: "Preferências de trading salvas!",
      });
    }, 300);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
            <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
          </div>

          {/* Account Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Informações da Conta
              </CardTitle>
              <CardDescription>Seus dados de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-secondary/50 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">ID do Usuário</Label>
                <Input
                  value={user?.id || ""}
                  disabled
                  className="bg-secondary/50 text-foreground font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Trading Preferences */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="h-5 w-5 text-primary" />
                Preferências de Trading
              </CardTitle>
              <CardDescription>Configure os parâmetros da sua conta de trading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Saldo Inicial ($)
                  </Label>
                  <Input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="bg-secondary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <TrendingDown className="h-4 w-4" />
                    Limite Perda Diária ($)
                  </Label>
                  <Input
                    type="number"
                    value={dailyLossLimit}
                    onChange={(e) => setDailyLossLimit(e.target.value)}
                    className="bg-secondary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    Max Drawdown ($)
                  </Label>
                  <Input
                    type="number"
                    value={maxDrawdownLimit}
                    onChange={(e) => setMaxDrawdownLimit(e.target.value)}
                    className="bg-secondary/30"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSavingSettings}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSavingSettings ? "Salvando..." : "Salvar Preferências"}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lock className="h-5 w-5 text-primary" />
                Alterar Senha
              </CardTitle>
              <CardDescription>Atualize sua senha de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-muted-foreground">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="bg-secondary/30 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-muted-foreground">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className="bg-secondary/30"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                <Button type="submit" disabled={isChangingPassword} className="w-full sm:w-auto">
                  {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
