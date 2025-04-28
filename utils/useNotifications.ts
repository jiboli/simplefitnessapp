import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { 
  requestNotificationPermissions, 
  scheduleWorkoutNotification, 
  cancelWorkoutNotification,
  getAllScheduledNotifications
} from '../utils/notificationUtils';
import { Alert } from 'react-native';

/**
 * Custom hook for managing notifications in the app
 */
export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const hasPermission = await requestNotificationPermissions();
        setPermissionGranted(hasPermission);

        if (hasPermission) {
          const notifications = await getAllScheduledNotifications();
          setScheduledNotifications(notifications);
        }
      } catch (error) {
        console.error('Error checking notification permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();

    // Set up listener for receiving notifications
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Set up listener for user interactions with notifications
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response received:', response);
      // Handle notification response (e.g., navigate to relevant screen)
    });

    // Clean up listeners
    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // Request permissions manually
  const requestPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const hasPermission = await requestNotificationPermissions();
      setPermissionGranted(hasPermission);
      return hasPermission;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Schedule a workout notification
  const scheduleNotification = useCallback(async (params: {
    workoutName: string;
    dayName: string;
    scheduledDate: Date;
    notificationTime: Date;
  }) => {
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Notification permission is required to set reminders',
          [{ text: 'OK' }]
        );
        return null;
      }
    }

    const notificationId = await scheduleWorkoutNotification(params);
    
    // Refresh list of scheduled notifications
    if (notificationId) {
      const notifications = await getAllScheduledNotifications();
      setScheduledNotifications(notifications);
    }
    
    return notificationId;
  }, [permissionGranted, requestPermissions]);

  // Cancel a scheduled notification
  const cancelNotification = useCallback(async (notificationId: string) => {
    const success = await cancelWorkoutNotification(notificationId);
    
    // Refresh list of scheduled notifications
    if (success) {
      const notifications = await getAllScheduledNotifications();
      setScheduledNotifications(notifications);
    }
    
    return success;
  }, []);

  // Refresh scheduled notifications list
  const refreshNotifications = useCallback(async () => {
    if (permissionGranted) {
      const notifications = await getAllScheduledNotifications();
      setScheduledNotifications(notifications);
    }
  }, [permissionGranted]);

  return {
    permissionGranted,
    loading,
    scheduledNotifications,
    requestPermissions,
    scheduleNotification,
    cancelNotification,
    refreshNotifications,
  };
};