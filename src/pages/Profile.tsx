import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { User, Settings, Lock, DollarSign, TrendingDown, AlertTriangle, Save, Eye, EyeOff, Sun, Moon, Monitor, Clock } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Profile() {
  const { user, updatePassword } = useAuth();
  const { settings, saveSettings, isSaving, isLoading } = useUserSettings();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  
  // Trading settings state
  const [initialBalance, setInitialBalance] = useState("");
  const [dailyLossLimit, setDailyLossLimit] = useState("");
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState("");
  const [brokerUtcOffset, setBrokerUtcOffset] = useState("3");

  // Update local state when settings load from DB
  useEffect(() => {
    if (!isLoading) {
      setInitialBalance(settings.initialBalance.toString());
      setDailyLossLimit(settings.dailyLossLimit.toString());
      setMaxDrawdownLimit(settings.maxDrawdownLimit.toString());
      setBrokerUtcOffset(settings.brokerUtcOffset.toString());
    }
  }, [settings, isLoading]);

  // Sync theme with saved settings
  useEffect(() => {
    if (!isLoading && settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, isLoading, setTheme]);

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
    const newInitialBalance = parseFloat(initialBalance) || 100000;
    const newDailyLossLimit = parseFloat(dailyLossLimit) || 5000;
    const newMaxDrawdownLimit = parseFloat(maxDrawdownLimit) || 10000;
    const newBrokerUtcOffset = parseInt(brokerUtcOffset) || 3;
    
    saveSettings({
      initialBalance: newInitialBalance,
      dailyLossLimit: newDailyLossLimit,
      maxDrawdownLimit: newMaxDrawdownLimit,
      brokerUtcOffset: newBrokerUtcOffset,
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    saveSettings({ theme: newTheme });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
      </div>
    );
  }

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

          {/* Theme Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sun className="h-5 w-5 text-primary" />
                Aparência
              </CardTitle>
              <CardDescription>Escolha o tema de sua preferência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => handleThemeChange("light")}
                  className="flex-1"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Claro
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => handleThemeChange("dark")}
                  className="flex-1"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Escuro
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => handleThemeChange("system")}
                  className="flex-1"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Sistema
                </Button>
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
              {/* Broker UTC Offset */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Offset UTC do Broker (New York Close)
                </Label>
                <Select value={brokerUtcOffset} onValueChange={setBrokerUtcOffset}>
                  <SelectTrigger className="bg-secondary/30">
                    <SelectValue placeholder="Selecione o offset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">+0 (UTC)</SelectItem>
                    <SelectItem value="1">+1</SelectItem>
                    <SelectItem value="2">+2</SelectItem>
                    <SelectItem value="3">+3 (Padrão - NY Close)</SelectItem>
                    <SelectItem value="4">+4</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Ajuste o offset do servidor do seu broker. +3 é o padrão para New York Close (vela diária fecha 17h NY).
                </p>
              </div>

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
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Preferências"}
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
