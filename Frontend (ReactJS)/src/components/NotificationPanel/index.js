import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTrash, faClock, faTimes, faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';
import notificationService from '../../services/NotificationService';
import styles from './index.module.css';
import './index.scss';
import AnimatedLetters from '../AnimatedLetters';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [calendarExams, setCalendarExams] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [letterClass, setLetterClass] = useState("text-animate");
  
  // Form state
  const [selectedExam, setSelectedExam] = useState('');
  const [notificationDate, setNotificationDate] = useState('');
  const [notificationTime, setNotificationTime] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  
  // Load data on component mount
  useEffect(() => {
    loadNotifications();
    loadCalendarExams();
    
    // Set default date to today
    const today = new Date();
    setNotificationDate(today.toISOString().split('T')[0]);
    
    // Set default time to current time + 1 hour
    const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
    setNotificationTime(
      nextHour.toTimeString().split(' ')[0].substring(0, 5)
    );
    
    const timer = setTimeout(() => {
      setLetterClass("text-animate-hover");
    }, 1);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Load notifications from service
  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
  };
  
  // Load exams from calendar
  const loadCalendarExams = () => {
    const storedCalendar = JSON.parse(sessionStorage.getItem('calendar')) || [];
    setCalendarExams(storedCalendar);
  };
  
  // Handle form submission to add or update notification
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedExam || !notificationDate || !notificationTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Find the selected exam object
    const exam = calendarExams.find(exam => exam.examKey === selectedExam);
    if (!exam) {
      alert('Please select a valid exam');
      return;
    }
    
    // Combine date and time for notification
    const notifyDateTime = new Date(`${notificationDate}T${notificationTime}`);
    
    // Check if notification time is in the past
    if (notifyDateTime < new Date()) {
      alert('Cannot set a notification for a time in the past');
      return;
    }
    
    if (editingNotificationId) {
      // Update existing notification
      notificationService.updateNotification(editingNotificationId, {
        notifyTime: notifyDateTime.toISOString(),
        intervalMinutes: parseInt(intervalMinutes, 10),
        customMessage: customMessage
      });
      setEditingNotificationId(null);
    } else {
      // Add new notification
      notificationService.addNotification(
        exam,
        notifyDateTime.toISOString(),
        parseInt(intervalMinutes, 10),
        customMessage
      );
    }
    
    // Reset form and reload notifications
    resetForm();
    loadNotifications();
  };
  
  // Handle edit notification
  const handleEditNotification = (notification) => {
    setEditingNotificationId(notification.id);
    setSelectedExam(notification.examId);
    
    const notifyDate = new Date(notification.notifyTime);
    setNotificationDate(notifyDate.toISOString().split('T')[0]);
    setNotificationTime(notifyDate.toTimeString().split(' ')[0].substring(0, 5));
    
    setIntervalMinutes(notification.intervalMinutes || 0);
    setCustomMessage(notification.customMessage || '');
    
    setShowAddForm(true);
  };
  
  // Handle delete notification
  const handleDeleteNotification = (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      notificationService.deleteNotification(notificationId);
      loadNotifications();
    }
  };
  
  // Handle toggle notification active status
  const toggleNotificationActive = (notificationId, currentActive) => {
    notificationService.updateNotification(notificationId, { active: !currentActive });
    loadNotifications();
  };
  
  // Reset form to default values
  const resetForm = () => {
    setSelectedExam('');
    
    const today = new Date();
    setNotificationDate(today.toISOString().split('T')[0]);
    
    const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
    setNotificationTime(
      nextHour.toTimeString().split(' ')[0].substring(0, 5)
    );
    
    setIntervalMinutes(0);
    setCustomMessage('');
    setShowAddForm(false);
    setEditingNotificationId(null);
  };
  
  // Format notification time for display
  const formatDisplayTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return isoString;
    }
  };
  
  return (
    <div className="container notification-page">
      <div className="text-zone">
        <h1>
          <br />
          <br />
          <AnimatedLetters letterClass={letterClass} strArray={"Notifications".split("")} idx={15} />
        </h1>
        
        <div className={styles.notificationPanel}>
          <div className={styles.notificationControls}>
            {showAddForm ? (
              <button 
                className={styles.cancelButton} 
                onClick={resetForm}
              >
                Cancel
              </button>
            ) : (
              <button 
                className={styles.addButton} 
                onClick={() => setShowAddForm(true)}
              >
                <FontAwesomeIcon icon={faBell} /> Create New Notification
              </button>
            )}
          </div>
      
      {showAddForm && (
        <form className={styles.notificationForm} onSubmit={handleSubmit}>
          <h3>{editingNotificationId ? 'Edit Notification' : 'Create New Notification'}</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="exam-select">Select Exam:</label>
            <select 
              id="exam-select"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              required
            >
              <option value="">-- Select an exam --</option>
              {calendarExams.map(exam => (
                <option key={exam.examKey} value={exam.examKey}>
                  {exam.course} - {exam.exam_type}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="notification-date">Notification Date:</label>
              <input 
                type="date"
                id="notification-date"
                value={notificationDate}
                onChange={(e) => setNotificationDate(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="notification-time">Notification Time:</label>
              <input 
                type="time"
                id="notification-time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="interval">Repeat Interval (minutes):</label>
            <select
              id="interval"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(e.target.value)}
            >
              <option value="0">No repeat</option>
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
              <option value="120">Every 2 hours</option>
              <option value="1440">Every day</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="custom-message">Custom Message:</label>
            <textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Optional: Enter a custom message for this notification"
              rows="3"
            ></textarea>
          </div>
          
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              <FontAwesomeIcon icon={faCheck} /> {editingNotificationId ? 'Update' : 'Save'} Notification
            </button>
          </div>
        </form>
      )}
      
      <div className={styles.notificationList}>
        <h3>Your Notifications</h3>
        
        {notifications.length === 0 ? (
          <p className={styles.noNotifications}>No notifications set up yet.</p>
        ) : (
          notifications.map(notification => {
            // Find the related exam
            const relatedExam = calendarExams.find(exam => exam.examKey === notification.examId);
            const examName = relatedExam ? `${relatedExam.course} - ${relatedExam.exam_type}` : notification.examTitle;
            
            return (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${!notification.active ? styles.inactive : ''}`}
              >
                <div className={styles.notificationHeader}>
                  <h4 className={styles.notificationTitle}>
                    {examName}
                  </h4>
                  <div className={styles.notificationActions}>
                    <button 
                      className={`${styles.actionButton} ${notification.active ? styles.activeBtn : styles.inactiveBtn}`}
                      onClick={() => toggleNotificationActive(notification.id, notification.active)}
                    >
                      {notification.active ? 'Active' : 'Inactive'}
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.editBtn}`}
                      onClick={() => handleEditNotification(notification)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                <div className={styles.notificationDetails}>
                  <p>
                    <FontAwesomeIcon icon={faClock} /> Notification at: {formatDisplayTime(notification.notifyTime)}
                  </p>
                  
                  {notification.intervalMinutes > 0 && (
                    <p className={styles.intervalInfo}>
                      Repeats every {notification.intervalMinutes} minutes until exam
                    </p>
                  )}
                  
                  {notification.customMessage && (
                    <p className={styles.messagePreview}>
                      <strong>Message:</strong> {notification.customMessage}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;