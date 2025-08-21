import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');
  const { user } = useAuth();

  useEffect(() => {
    // Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Save to user profile if logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Load user's theme preference when they login
  useEffect(() => {
    if (user) {
      const loadUserTheme = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('user_id', user.id)
            .single();

          if (data?.theme_preference) {
            setTheme(data.theme_preference as Theme);
          }
        } catch (error) {
          console.error('Error loading user theme:', error);
        }
      };

      loadUserTheme();
    }
  }, [user]);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}