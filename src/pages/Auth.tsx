import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, ArrowLeft } from "lucide-react";
import { z } from "zod";
import GridGlowBackground from "@/components/GridGlowBackground";

const authSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type AuthMode = "login" | "signup" | "forgot" | "reset";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "reset" ? "reset" : "login";
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível conectar com Google.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && mode !== "reset") {
      navigate("/");
    }
  }, [user, navigate, mode]);

  useEffect(() => {
    if (searchParams.get("mode") === "reset") {
      setMode("reset");
    }
  }, [searchParams]);

  const validateForm = () => {
    if (mode === "forgot") {
      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        setErrors({ email: result.error.errors[0]?.message });
        return false;
      }
    } else if (mode === "reset") {
      const result = passwordSchema.safeParse({ password });
      if (!result.success) {
        setErrors({ password: result.error.errors[0]?.message });
        return false;
      }
    } else {
      const result = authSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: { email?: string; password?: string } = {};
        result.error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Email enviado!",
            description: "Verifique sua caixa de entrada para redefinir sua senha.",
          });
          setMode("login");
        }
      } else if (mode === "reset") {
        const { error } = await updatePassword(password);
        if (error) {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Senha atualizada!",
            description: "Sua senha foi alterada com sucesso.",
          });
          navigate("/");
        }
      } else {
        const { error } = mode === "login" 
          ? await signIn(email, password)
          : await signUp(email, password);

        if (error) {
          let message = error.message;
          if (error.message.includes("Invalid login credentials")) {
            message = "Credenciais inválidas. Verifique seu email e senha.";
          } else if (error.message.includes("User already registered")) {
            message = "Este email já está cadastrado. Faça login.";
          }
          
          toast({
            title: "Erro",
            description: message,
            variant: "destructive",
          });
        } else {
          if (mode === "signup") {
            toast({
              title: "Conta criada!",
              description: "Você foi conectado automaticamente.",
            });
          }
          navigate("/");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <GridGlowBackground>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </GridGlowBackground>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Criar Conta";
      case "forgot": return "Recuperar Senha";
      case "reset": return "Nova Senha";
      default: return "Entrar";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signup": return "Comece a acompanhar suas operações";
      case "forgot": return "Digite seu email para receber o link de recuperação";
      case "reset": return "Digite sua nova senha";
      default: return "Acesse seu diário de trading";
    }
  };

  return (
    <GridGlowBackground>
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 bg-primary rotate-45 rounded-sm" />
                <div className="absolute inset-0 w-10 h-10 bg-primary/50 rotate-45 rounded-sm translate-x-1 -translate-y-1" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-primary">Vertex</span>
                <span className="text-foreground">Trade</span>
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            )}
            
            {(mode === "login" || mode === "signup" || mode === "reset") && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === "reset" ? "Nova Senha" : "Senha"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" && "Entrar"}
              {mode === "signup" && "Criar Conta"}
              {mode === "forgot" && "Enviar Link"}
              {mode === "reset" && "Salvar Senha"}
            </Button>

            {(mode === "login" || mode === "signup") && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar com Google
                </Button>
              </>
            )}
          </form>
          
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="w-full mt-3 text-sm text-muted-foreground hover:text-primary text-center"
                disabled={isSubmitting}
              >
                Esqueceu sua senha?
              </button>
              
              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Não tem uma conta? </span>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline"
                  disabled={isSubmitting}
                >
                  Criar conta
                </button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary hover:underline"
                disabled={isSubmitting}
              >
                Entrar
              </button>
            </div>
          )}

          {(mode === "forgot" || mode === "reset") && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para login
            </button>
          )}
        </CardContent>
      </Card>
    </GridGlowBackground>
  );
}
