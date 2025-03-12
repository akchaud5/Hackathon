import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTrash, faClock, faTimes } from '@fortawesome/free-solid-svg-icons';
import notificationService from '../../services/NotificationService';
import styles from './index.module.css';

const NotificationSettings = ({ exam, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [remindBefore, setRemindBefore] = useState(60); // minutes before exam
  const [intervalMinutes, setIntervalMinutes] = useState(0); // 0 = no repeat
  
  useEffect(() => {
    if (exam) {
      loadNotifications();
    }
  }, [exam]);
  
  const loadNotifications = () => {
    const examNotifications = notificationService.getExamNotifications(exam.examKey);
    setNotifications(examNotifications);
  };
  
  const handleAddNotification = () => {
    if (!exam || !remindBefore) return;
    
    // Calculate notification time (exam time - remind before minutes)
    const examTime = new Date(exam.exam_start_time);
    const notifyTime = new Date(examTime.getTime() - (remindBefore * 60 * 1000));
    
    // Don't schedule if time already passed
    if (notifyTime < new Date()) {
      alert("Cannot set reminder for a time in the past");
      return;
    }
    
    // Add notification
    notificationService.addNotification(exam, notifyTime.toISOString(), intervalMinutes);
    
    // Reset form and refresh list
    setShowAddForm(false);
    setRemindBefore(60);
    setIntervalMinutes(0);
    loadNotifications();
  };
  
  const handleDeleteNotification = (notificationId) => {
    notificationService.deleteNotification(notificationId);
    loadNotifications();
  };
  
  const toggleNotificationActive = (notificationId, currentActive) => {
    notificationService.updateNotification(notificationId, { active: !currentActive });
    loadNotifications();
  };
  
  return (
    <div className={styles.notificationSettings}>
      <div className={styles.notificationHeader}>
        <h3>
          <FontAwesomeIcon icon={faBell} /> Notifications for {exam?.course}
        </h3>
        <button className={styles.closeButton} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className={styles.notificationBody}>
        {notifications.length === 0 ? (
          <p className={styles.noNotifications}>No notifications set for this exam</p>
        ) : (
          <div className={styles.notificationList}>
            {notifications.map(notification => (
              <div key={notification.id} className={`${styles.notificationItem} ${!notification.active ? styles.inactive : ''}`}>
                <div className={styles.notificationDetails}>
                  <div className={styles.notificationTitle}>
                    <span>
                      <FontAwesomeIcon icon={faClock} /> Remind at: {new Date(notification.notifyTime).toLocaleString()}
                    </span>
                  </div>
                  {notification.intervalMinutes > 0 && (
                    <div className={styles.notificationInterval}>
                      Repeats every {notification.intervalMinutes} minutes until exam
                    </div>
                  )}
                </div>
                <div className={styles.notificationActions}>
                  <button 
                    className={`${styles.actionButton} ${styles.toggleBtn} ${notification.active ? styles.activeBtn : styles.inactiveBtn}`}
                    onClick={() => toggleNotificationActive(notification.id, notification.active)}
                  >
                    {notification.active ? 'Active' : 'Inactive'}
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.deleteBtn}`}
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showAddForm ? (
          <div className={styles.addNotificationForm}>
            <h4>Add New Reminder</h4>
            <div className={styles.formRow}>
              <label>Remind me</label>
              <select 
                value={remindBefore} 
                onChange={(e) => setRemindBefore(parseInt(e.target.value))}
              >
                <option value={5}>5 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
            
            <div className={styles.formRow}>
              <label>Repeat interval</label>
              <select 
                value={intervalMinutes} 
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
              >
                <option value={0}>No repeat</option>
                <option value={5}>Every 5 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every hour</option>
              </select>
            </div>
            
            <div className={styles.formActions}>
              <button 
                className={`${styles.formButton} ${styles.cancelBtn}`} 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button 
                className={`${styles.formButton} ${styles.saveBtn}`} 
                onClick={handleAddNotification}
              >
                Save Reminder
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.addNotificationBtn} onClick={() => setShowAddForm(true)}>
            <FontAwesomeIcon icon={faBell} /> Add Reminder
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;