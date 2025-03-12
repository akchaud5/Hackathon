// NotificationService.js
// Service for managing exam notification scheduling

class NotificationService {
  constructor() {
    this.notifications = this.loadNotifications();
  }

  // Load saved notifications from localStorage
  loadNotifications() {
    const storedNotifications = localStorage.getItem('examNotifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  }

  // Save notifications to localStorage
  saveNotifications(notifications) {
    localStorage.setItem('examNotifications', JSON.stringify(notifications));
    this.notifications = notifications;
  }

  // Add a new notification
  addNotification(exam, notifyTime, intervalMinutes = 0, customMessage = '') {
    const notificationId = `exam-${exam.examKey}-${Date.now()}`;
    
    const newNotification = {
      id: notificationId,
      examId: exam.examKey,
      examTitle: `${exam.course} ${exam.exam_type}`,
      examTime: exam.exam_start_time,
      notifyTime, // When to send notification (timestamp)
      intervalMinutes, // Repeat interval (0 = no repeat)
      customMessage, // Custom message for notification
      active: true,
      location: `${exam.building} ${exam.room}`,
    };
    
    const updatedNotifications = [...this.notifications, newNotification];
    this.saveNotifications(updatedNotifications);
    
    // Schedule the notification
    this.scheduleNotification(newNotification);
    
    return newNotification;
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }

  // Get notifications for specific exam
  getExamNotifications(examId) {
    return this.notifications.filter(notification => notification.examId === examId);
  }

  // Delete a notification by ID
  deleteNotification(notificationId) {
    const updatedNotifications = this.notifications.filter(
      notification => notification.id !== notificationId
    );
    
    this.saveNotifications(updatedNotifications);
    
    // Clear any scheduled timers for this notification
    this.clearNotificationTimer(notificationId);
  }

  // Update a notification
  updateNotification(notificationId, updates) {
    const updatedNotifications = this.notifications.map(notification => {
      if (notification.id === notificationId) {
        // Clear existing timers
        this.clearNotificationTimer(notificationId);
        
        // Update notification
        const updatedNotification = { ...notification, ...updates };
        
        // Reschedule if active
        if (updatedNotification.active) {
          this.scheduleNotification(updatedNotification);
        }
        
        return updatedNotification;
      }
      return notification;
    });
    
    this.saveNotifications(updatedNotifications);
  }

  // Schedule a notification to be triggered at the specified time
  scheduleNotification(notification) {
    // Store timer IDs for later cleanup
    if (!window._notificationTimers) {
      window._notificationTimers = {};
    }
    
    const currentTime = new Date().getTime();
    const notificationTime = new Date(notification.notifyTime).getTime();
    let delay = notificationTime - currentTime;
    
    // If notification time has already passed
    if (delay < 0) {
      console.log(`Notification time passed for: ${notification.examTitle}`);
      return;
    }
    
    // Set timeout for the notification
    const timerId = setTimeout(() => {
      this.showNotification(notification);
      
      // If interval is specified, schedule recurring notifications
      if (notification.intervalMinutes > 0) {
        this.scheduleRecurringNotification(notification);
      }
    }, delay);
    
    // Store timer ID for later cancellation if needed
    window._notificationTimers[notification.id] = timerId;
  }
  
  // Schedule recurring notifications at specified intervals
  scheduleRecurringNotification(notification) {
    if (!notification.intervalMinutes || notification.intervalMinutes <= 0) {
      return;
    }
    
    // Convert interval from minutes to milliseconds
    const intervalMs = notification.intervalMinutes * 60 * 1000;
    
    // Set interval for recurring notifications
    const intervalId = setInterval(() => {
      const examTime = new Date(notification.examTime).getTime();
      const currentTime = new Date().getTime();
      
      // Stop recurring notifications once exam time has passed
      if (currentTime >= examTime) {
        clearInterval(intervalId);
        return;
      }
      
      this.showNotification(notification, true);
    }, intervalMs);
    
    // Store interval ID for later cancellation
    if (!window._notificationIntervals) {
      window._notificationIntervals = {};
    }
    window._notificationIntervals[notification.id] = intervalId;
  }
  
  // Clear notification timer
  clearNotificationTimer(notificationId) {
    // Clear timeout
    if (window._notificationTimers && window._notificationTimers[notificationId]) {
      clearTimeout(window._notificationTimers[notificationId]);
      delete window._notificationTimers[notificationId];
    }
    
    // Clear interval
    if (window._notificationIntervals && window._notificationIntervals[notificationId]) {
      clearInterval(window._notificationIntervals[notificationId]);
      delete window._notificationIntervals[notificationId];
    }
  }
  
  // Display browser notification
  showNotification(notification, isRecurring = false) {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      alert(`Exam Reminder: ${notification.examTitle}`);
      return;
    }
    
    // Format notification message
    const title = `Exam Reminder: ${notification.examTitle}`;
    let message = '';
    
    // Use custom message if available, otherwise use default
    if (notification.customMessage) {
      message = notification.customMessage;
    } else {
      message = `Your exam is scheduled at ${new Date(notification.examTime).toLocaleString()}${
        notification.location ? ` in ${notification.location}` : ''
      }${isRecurring ? ' (Recurring reminder)' : ''}`;
    }
    
    const options = {
      body: message,
      icon: '/favicon.ico'
    };
    
    // Request permission and show notification
    if (Notification.permission === "granted") {
      new Notification(title, options);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  }
  
  // Initialize notifications on app start
  initializeNotifications() {
    // Request notification permission early
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    // Schedule all active notifications
    this.notifications.forEach(notification => {
      if (notification.active) {
        this.scheduleNotification(notification);
      }
    });
  }
}

// Singleton instance
const notificationService = new NotificationService();
export default notificationService;