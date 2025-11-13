import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Case {
  id: string;
  report_date: string;
  severity: string;
  confirmed: boolean;
  outcome: string;
  diseases: { name: string };
  households: { household_code: string };
}

export const useRealtimeCases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial cases
    const fetchCases = async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          diseases (name),
          households (household_code)
        `)
        .order('report_date', { ascending: false })
        .limit(50);

      if (data && !error) {
        setCases(data as Case[]);
      }
      setLoading(false);
    };

    fetchCases();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('cases-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cases'
        },
        async (payload) => {
          // Fetch the complete case data with relations
          const { data } = await supabase
            .from('cases')
            .select(`
              *,
              diseases (name),
              households (household_code)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setCases(prev => [data as Case, ...prev]);
            toast.success('New case reported in real-time!');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases'
        },
        async (payload) => {
          const { data } = await supabase
            .from('cases')
            .select(`
              *,
              diseases (name),
              households (household_code)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setCases(prev =>
              prev.map(c => c.id === data.id ? data as Case : c)
            );
            toast.info('Case updated in real-time');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { cases, loading };
};
