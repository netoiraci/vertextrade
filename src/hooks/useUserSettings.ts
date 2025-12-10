import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserSettings {
  initialBalance: number;
  dailyLossLimit: number;
  maxDrawdownLimit: number;
  theme: "light" | "dark" | "system";
}

const defaultSettings: UserSettings = {
  initialBalance: 100000,
  dailyLossLimit: 5000,
  maxDrawdownLimit: 10000,
  theme: "system",
};

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from database
  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings);
      setIsLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading settings:", error);
          return;
        }

        if (data) {
          setSettings({
            initialBalance: Number(data.initial_balance),
            dailyLossLimit: Number(data.daily_loss_limit),
            maxDrawdownLimit: Number(data.max_drawdown_limit),
            theme: data.theme as UserSettings["theme"],
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Save settings to database
  const saveSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      if (!user) return;

      setIsSaving(true);
      const updatedSettings = { ...settings, ...newSettings };

      try {
        const { error } = await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            initial_balance: updatedSettings.initialBalance,
            daily_loss_limit: updatedSettings.dailyLossLimit,
            max_drawdown_limit: updatedSettings.maxDrawdownLimit,
            theme: updatedSettings.theme,
          }, { onConflict: "user_id" });

        if (error) throw error;

        setSettings(updatedSettings);
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso!",
        });
      } catch (error) {
        console.error("Error saving settings:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar as configurações.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [user, settings, toast]
  );

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
  };
}
