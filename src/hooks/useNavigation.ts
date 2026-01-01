import { useState, useEffect } from 'react';
import { config } from '../config';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  order: number;
  enabled: boolean;
  description?: string;
  requiredRoles?: string[];
}

interface NavigationResponse {
  items: NavigationItem[];
  version: string;
}

// Fallback navigation (オフライン時のデフォルト)
const DEFAULT_NAVIGATION: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "🏠", order: 1, enabled: true },
  { id: "targets", label: "Targets", href: "/targets", icon: "🎯", order: 2, enabled: true },
  { id: "operations", label: "Operations", href: "/operations", icon: "⚡", order: 3, enabled: true },
  { id: "findings", label: "Findings", href: "/findings", icon: "🔍", order: 4, enabled: true },
  { id: "reports", label: "Reports", href: "/reports", icon: "📄", order: 5, enabled: true },
  { id: "settings", label: "Settings", href: "/settings", icon: "⚙️", order: 6, enabled: true },
  { id: "admin", label: "Admin", href: "/admin", icon: "🛡️", order: 7, enabled: true },
];

export function useNavigation() {
  const [items, setItems] = useState<NavigationItem[]>(DEFAULT_NAVIGATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.api.baseUrl}/navigation/`, {
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: NavigationResponse = await response.json();
        setItems(data.items);
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch navigation, using fallback:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep using DEFAULT_NAVIGATION (already set)
      } finally {
        setLoading(false);
      }
    };

    fetchNavigation();
  }, []);

  return { items, loading, error };
}
