import React, { useState, useEffect } from 'react';
import "./index.scss";
import AnimatedLetters from '../AnimatedLetters';
import NotificationSettings from '../NotificationSettings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import notificationService from '../../services/NotificationService';

const Calendar = () => {
  const [selectedExams, setSelectedExams] = useState([]);
  const [letterClass, setLetterClass] = useState("text-animate");
  const [selectedExamForNotification, setSelectedExamForNotification] = useState(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const isMobileView = window.innerWidth <= 1150;

  useEffect(() => {
    const storedCalendar = JSON.parse(sessionStorage.getItem('calendar')) || [];
    setSelectedExams(storedCalendar);

    const timer = setTimeout(() => {
        setLetterClass("text-animate-hover");
      }, 1);
      
    // Initialize notification service
    notificationService.initializeNotifications();
  
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleRemoveExam = (examKey) => {
    const updatedExams = selectedExams.filter((exam) => exam.examKey !== examKey);
    setSelectedExams(updatedExams);
    sessionStorage.setItem('calendar', JSON.stringify(updatedExams));
  };

  // Format dates for iCalendar export (in the format YYYYMMDDTHHmmss)
  const formatDateTime = (dateTime) => {
    try {
      // If we have just a time string without a date
      if (dateTime && !dateTime.includes('T') && !dateTime.includes('-')) {
        // Create a full datetime by adding today's date
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        // Format: YYYY-MM-DDThh:mm:ss
        dateTime = `${year}-${month}-${day}T${dateTime}`;
      }
      
      const inputDate = new Date(dateTime);
      
      // Check if date is valid
      if (isNaN(inputDate.getTime())) {
        console.error('Invalid date format:', dateTime);
        // Return a default date (current date/time + 1 day) if invalid
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 1);
        return defaultDate.toISOString().replace(/[-:]/g, '').slice(0, -5);
      }
      
      // Format for iCalendar: YYYYMMDDTHHmmssZ
      return inputDate.toISOString().replace(/[-:]/g, '').slice(0, -5);
    } catch (error) {
      console.error('Error formatting date:', error, dateTime);
      // Return a default date (current date/time + 1 day) if error
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 1);
      return defaultDate.toISOString().replace(/[-:]/g, '').slice(0, -5);
    }
  };
  
  // Format dates for display in the UI (in a user-friendly format)
  const formatDisplayDateTime = (dateTime) => {
    try {
      // If it's already just a time string, return it as is
      if (dateTime && !dateTime.includes('T') && !dateTime.includes('-')) {
        return dateTime;
      }
      
      const date = new Date(dateTime);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date format for display:', dateTime);
        return dateTime; // Return the original if invalid
      }
      
      // Format date for display: "YYYY-MM-DD HH:MM AM/PM"
      const options = { 
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      
      return date.toLocaleString('en-US', options);
    } catch (error) {
      console.error('Error formatting display date:', error, dateTime);
      return dateTime; // Return the original if error
    }
  };

  const handleExportCalendar = () => {
    try {
      // Check if we have exams to export
      if (selectedExams.length === 0) {
        alert("No exams to export. Please add exams to your calendar first.");
        return;
      }
      
      // Generate a unique ID for each event
      const generateUID = () => {
        return 'asu-exam-' + Math.random().toString(36).substring(2, 11);
      };
      
      const calendarContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ASU Exam Scheduler//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        ...selectedExams.map((exam) => {
          const uid = generateUID();
          const location = exam.building && exam.room 
            ? `${exam.building} ${exam.room}` 
            : (exam.building || exam.room || 'TBA');
            
          const description = [
            exam.course_title ? `Course: ${exam.course_title}` : '',
            `Type: ${exam.exam_type || 'Exam'}`,
            exam.building ? `Building: ${exam.building}` : '',
            exam.room ? `Room: ${exam.room}` : '',
            exam.rows ? `Rows: ${exam.rows}` : '',
            exam.rowStart ? `Row Start: ${exam.rowStart}` : '',
            exam.rowEnd ? `Row End: ${exam.rowEnd}` : '',
            '\nGenerated by ASU Exam Scheduler'
          ].filter(Boolean).join('\\n');
          
          const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, -5);
          
          return [
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${now}`,
            `SUMMARY:${exam.course} ${exam.exam_type || 'Exam'}`,
            `DESCRIPTION:${description}`,
            `DTSTART:${formatDateTime(exam.exam_start_time)}`,
            `DTEND:${formatDateTime(exam.exam_end_time)}`,
            `LOCATION:${location}`,
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'BEGIN:VALARM',
            'TRIGGER:-PT30M',
            'DESCRIPTION:Exam Reminder',
            'ACTION:DISPLAY',
            'END:VALARM',
            'END:VEVENT',
          ].join('\n');
        }),
        'END:VCALENDAR',
      ].join('\n');

      // Log the content for debugging
      console.log('iCal content:', calendarContent);

      const calendarDataURI = `data:text/calendar;charset=utf-8,${encodeURIComponent(calendarContent)}`;

      const link = document.createElement('a');
      link.href = calendarDataURI;
      link.download = 'asu_exam_calendar.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert("There was an error exporting your calendar. Please try again.");
    }
  };
  const handleExportGoogleCalendar = (exam) => {
    try {
      const googleCalendarURL = 'https://www.google.com/calendar/render?action=TEMPLATE';
  
      const startTime = formatDateTime(exam.exam_start_time);
      const endTime = formatDateTime(exam.exam_end_time);
      
      // Build a more detailed description
      const description = [
        exam.course_title ? `Course: ${exam.course_title}` : '',
        `Type: ${exam.exam_type || 'Exam'}`,
        exam.building ? `Building: ${exam.building}` : '',
        exam.room ? `Room: ${exam.room}` : '',
        exam.rows ? `Rows: ${exam.rows}` : '',
        exam.rowStart ? `Row Start: ${exam.rowStart}` : '',
        exam.rowEnd ? `Row End: ${exam.rowEnd}` : '',
        '\nGenerated by ASU Exam Scheduler'
      ].filter(Boolean).join('\n');
      
      // Set proper location
      const location = exam.building && exam.room 
        ? `${exam.building} ${exam.room}` 
        : (exam.building || exam.room || 'TBA');
  
      const calendarContent = [
        `text=${encodeURIComponent(`${exam.course} ${exam.exam_type || 'Exam'}`)}`,
        `dates=${startTime}/${endTime}`,
        `details=${encodeURIComponent(description)}`,
        `location=${encodeURIComponent(location)}`,
      ].join('&');
  
      const fullURL = `${googleCalendarURL}&${calendarContent}`;
      
      // Log for debugging
      console.log('Google Calendar URL:', fullURL);
  
      window.open(fullURL, '_blank');
    } catch (error) {
      console.error('Error exporting Google Calendar:', error);
      alert("There was an error exporting to Google Calendar. Please try again.");
    }
  };

  return (
    <>
    <div className="container calendar-page">
      <div className="text-zone">
        <h1>
          <br />
          <br />
          <AnimatedLetters letterClass={letterClass} strArray={"Calendar".split("")} idx={15} />
        </h1>
        {selectedExams.length === 0 ? (
          <h2>No exams in your schedule.</h2>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {isMobileView ? (
                    <>
                      <th>Course</th>
                      <th>Actions</th>
                    </>
                  ): (
                    <>
                      <th>Course</th>
                      <th>Type</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Building</th>
                      <th>Room</th>
                      <th>Rows</th>
                      <th>Row Start</th>
                      <th>Row End</th>
                      <th>Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {selectedExams.map((exam) => (
                  <tr key={exam.examKey}>
                    <td>
                      <strong>{exam.course}</strong>
                    </td>
                    {!isMobileView && (
                    <>
                      <td>{exam.exam_type}</td>
                      <td>{formatDisplayDateTime(exam.exam_start_time)}</td>
                      <td>{formatDisplayDateTime(exam.exam_end_time)}</td>
                      <td>{exam.building}</td>
                      <td>{exam.room}</td>
                      <td>{exam.rows}</td>
                      <td>{exam.rowStart}</td>
                      <td>{exam.rowEnd}</td>
                    </>
                  )}
                    <td>
                      <button className="remove" onClick={() => handleRemoveExam(exam.examKey)}>
                        <span className="shadow"></span>
                        <span className="edge"></span>
                        <span className="front text"> Remove</span>
                      </button>
                      <button type="button" className="google" onClick={() => handleExportGoogleCalendar(exam)}>
                        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262">
                          <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                          <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                          <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
                          <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                        </svg>
                      </button>
                      <button 
                        className="notification-btn"
                        onClick={() => {
                          setSelectedExamForNotification(exam);
                          setShowNotificationSettings(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faBell} />
                      </button>
                      <br />
                      <br />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <button type="button" className="button" onClick={handleExportCalendar}>
              <span className="button__text">Export Cal</span>
              <span className="button__icon"><svg class="svg" data-name="Layer 2" id="bdd05811-e15d-428c-bb53-8661459f9307" viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg"><path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path><path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path><path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path></svg></span>
      </button>
    </div>
    
    {/* Notification Settings Modal */}
    {showNotificationSettings && selectedExamForNotification && (
      <div className="notification-settings-overlay">
        <NotificationSettings 
          exam={selectedExamForNotification} 
          onClose={() => {
            setShowNotificationSettings(false);
            setSelectedExamForNotification(null);
          }}
        />
      </div>
    )}
    </>
  );
}

export default Calendar;