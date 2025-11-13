# Real-Time Features Documentation

## Overview
Your HealthWatch application has been enhanced with comprehensive real-time features and backend processing capabilities. The system now provides live updates, notifications, and activity tracking across the entire platform.

## New Features

### 1. **Real-Time Notifications** 🔔
- **Location**: Bell icon in the sidebar
- **Features**:
  - Instant notifications when new cases are reported
  - Badge showing unread notification count
  - Click to mark notifications as read
  - "Mark all as read" functionality
  - Shows case details including disease and severity

### 2. **Live Case Updates** 📊
- **Location**: Cases page and Dashboard
- **Features**:
  - Automatic updates when new cases are added
  - Real-time toast notifications for new cases
  - No page refresh needed
  - Maintains data consistency across all users

### 3. **Live Statistics Dashboard** 📈
- **Location**: Dashboard page (top section)
- **Metrics tracked in real-time**:
  - Total cases
  - Active cases
  - Confirmed cases
  - Severe cases
  - All metrics update automatically when new data arrives

### 4. **Activity Feed** 📝
- **Location**: Dashboard page (right sidebar)
- **Features**:
  - Real-time stream of all system activities
  - Color-coded action badges (create, update, delete)
  - Shows user who performed the action
  - Displays entity details (disease, severity, etc.)
  - Timestamps with relative time display
  - Scrollable feed with last 20 activities

### 5. **Backend Analytics API** 🔧
- **Endpoint**: `/functions/v1/analytics`
- **Features**:
  - Generates comprehensive case analytics
  - Disease distribution analysis
  - Severity breakdown statistics
  - Outcome tracking
  - Can be called from frontend or external services

## Technical Implementation

### Database Changes
1. **New Tables**:
   - `notifications` - Stores user notifications
   - `activity_log` - Tracks all system activities

2. **Triggers**:
   - `on_case_created` - Automatically creates notifications and activity logs when cases are added

3. **Real-time Enabled**:
   - `cases` table
   - `notifications` table
   - `activity_log` table

### Security (RLS Policies)
- ✅ Users can only view their own notifications
- ✅ Users can only update their own notifications
- ✅ Officers and admins can create notifications
- ✅ All authenticated users can view activity logs
- ✅ Only officers and admins can create activity entries

### Custom Hooks
- `useRealtimeNotifications` - Manages notification state and real-time updates
- `useRealtimeCases` - Handles case data with live synchronization
- `useRealtimeStats` - Provides live statistics

## How to Use

### For End Users
1. **Viewing Notifications**:
   - Look for the bell icon in the sidebar
   - Red badge shows unread count
   - Click to see all notifications
   - Click individual notifications to mark as read

2. **Monitoring Live Updates**:
   - Dashboard statistics update automatically
   - Activity feed shows real-time changes
   - Cases page displays new cases instantly
   - Toast notifications alert you to important events

3. **Tracking Activity**:
   - Check the Activity Feed on the dashboard
   - See who did what and when
   - View details about each action

### For Developers

#### Calling the Analytics API
```typescript
import { supabase } from '@/integrations/supabase/client';

// Get analytics summary
const { data } = await supabase.functions.invoke('analytics', {
  body: { type: 'summary' }
});

console.log(data);
// Returns: {
//   totalCases: number,
//   activeCases: number,
//   confirmedCases: number,
//   severityBreakdown: { mild, moderate, severe, critical },
//   diseaseBreakdown: Array<{ name, count }>,
//   timestamp: string
// }
```

#### Subscribing to Real-Time Updates
```typescript
useEffect(() => {
  const channel = supabase
    .channel('my-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'cases'
      },
      (payload) => {
        console.log('New case:', payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Performance Considerations

1. **Real-time Subscriptions**: Each component manages its own subscription and properly cleans up on unmount
2. **Data Limits**: 
   - Cases: Limited to 50 most recent
   - Notifications: Limited to 10 most recent
   - Activity Log: Limited to 20 most recent
3. **Optimistic Updates**: Toast notifications provide immediate feedback

## Future Enhancements

Potential additions to consider:
- Push notifications for mobile devices
- Email notifications for critical cases
- Advanced filtering in activity feed
- Export analytics reports
- Real-time map visualization
- Collaborative case editing with presence indicators
- Real-time chat between officers

## Troubleshooting

**Notifications not appearing?**
- Check that you have the correct role (officer/admin)
- Verify RLS policies are enabled
- Check browser console for errors

**Real-time updates not working?**
- Ensure stable internet connection
- Check that REPLICA IDENTITY FULL is enabled on tables
- Verify Supabase project has realtime enabled

**Performance issues?**
- Consider pagination for large datasets
- Implement virtual scrolling for long lists
- Add debouncing to frequent updates

## Support

For issues or questions:
1. Check the browser console for errors
2. Review RLS policies in Lovable Cloud
3. Test with different user roles
4. Verify network connectivity
