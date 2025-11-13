import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, FileText, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  details: any;
  created_at: string;
  user_id: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // Fetch initial activities
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && !error) {
        setActivities(data);
      }
    };

    fetchActivities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log'
        },
        async (payload) => {
          const { data } = await supabase
            .from('activity_log')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setActivities(prev => [data, ...prev.slice(0, 19)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case 'case':
        return <AlertCircle className="h-4 w-4" />;
      case 'disease':
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-500/10 text-green-600';
      case 'updated':
        return 'bg-blue-500/10 text-blue-600';
      case 'deleted':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="mt-1">{getIcon(activity.entity_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        User Activity
                      </span>
                      <Badge variant="outline" className={getActionColor(activity.action)}>
                        {activity.action}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {activity.entity_type}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.details.disease && `Disease: ${activity.details.disease}`}
                        {activity.details.severity && ` • Severity: ${activity.details.severity}`}
                        {activity.details.confirmed !== undefined && ` • Confirmed: ${activity.details.confirmed ? 'Yes' : 'No'}`}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
