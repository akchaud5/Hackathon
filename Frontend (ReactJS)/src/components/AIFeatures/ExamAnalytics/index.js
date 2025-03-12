import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faExclamationTriangle, faCheckCircle, faInfoCircle, faSearch, faPlayCircle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const ExamAnalytics = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [calendarExams, setCalendarExams] = useState([]);
  const [showDemoMode, setShowDemoMode] = useState(true);
  const navigate = useNavigate();
  
  // Load calendar exams
  useEffect(() => {
    const storedCalendar = JSON.parse(sessionStorage.getItem('calendar')) || [];
    setCalendarExams(storedCalendar);
    
    // If we have exams in calendar and no selection yet, set the first course
    if (storedCalendar.length > 0 && !selectedCourse) {
      // We'll still show demo mode initially
      setShowDemoMode(true);
    }
  }, [selectedCourse]);
  
  // Sample data - will be used for any course the user selects
  const generateCourseData = (courseCode, courseName) => {
    return {
      courseName: `${courseCode} - ${courseName || 'Course Name'}`,
      examDate: "April 18, 2025",
      examTime: "9:00 AM - 12:00 PM",
      location: "GYM FIELD HOUSE",
      pastPerformance: {
        averageScore: Math.floor(65 + Math.random() * 20),
        highestScore: Math.floor(90 + Math.random() * 10),
        lowestScore: Math.floor(35 + Math.random() * 15),
        medianScore: Math.floor(70 + Math.random() * 15),
        passingRate: Math.floor(75 + Math.random() * 20),
        difficultyRating: (3 + Math.random() * 2).toFixed(1)
      },
      topicDifficulty: [
        { topic: "Fundamental Concepts", difficulty: Math.floor(1 + Math.random() * 3), masteryScore: Math.floor(75 + Math.random() * 20) },
        { topic: "Core Theory", difficulty: Math.floor(2 + Math.random() * 3), masteryScore: Math.floor(70 + Math.random() * 20) },
        { topic: "Applied Techniques", difficulty: Math.floor(2 + Math.random() * 3), masteryScore: Math.floor(65 + Math.random() * 25) },
        { topic: "Advanced Topics", difficulty: Math.floor(3 + Math.random() * 2), masteryScore: Math.floor(50 + Math.random() * 25) },
        { topic: "Special Cases", difficulty: Math.floor(3 + Math.random() * 2), masteryScore: Math.floor(60 + Math.random() * 30) },
        { topic: "Problem Solving", difficulty: Math.floor(3 + Math.random() * 2), masteryScore: Math.floor(55 + Math.random() * 30) }
      ],
      riskAreas: [
        "Advanced Topics",
        "Problem Solving",
        "Special Cases"
      ],
      strongAreas: [
        "Fundamental Concepts",
        "Core Theory"
      ],
      recommendedActions: [
        "Focus on complex problem-solving techniques",
        "Review advanced conceptual frameworks",
        "Allocate more study time to challenging topics",
        "Consider forming a study group with 2-3 peers",
        "Schedule at least 3 practice exams in the two weeks before the exam"
      ]
    };
  };
  
  // Demo data specifically for COMP 204 (more detailed than generated data)
  const comp204Data = {
    courseName: "COMP 204 - Computer Programming for Life Sciences",
    examDate: "April 18, 2025",
    examTime: "9:00 AM - 12:00 PM",
    location: "GYM FIELD HOUSE",
    pastPerformance: {
      averageScore: 78,
      highestScore: 98,
      lowestScore: 42,
      medianScore: 80,
      passingRate: 86,
      difficultyRating: 3.8
    },
    topicDifficulty: [
      { topic: "Variables and Data Types", difficulty: 2, masteryScore: 90 },
      { topic: "Control Structures", difficulty: 3, masteryScore: 85 },
      { topic: "Functions", difficulty: 3, masteryScore: 82 },
      { topic: "Data Structures", difficulty: 4, masteryScore: 65 },
      { topic: "File I/O", difficulty: 4, masteryScore: 72 },
      { topic: "Exception Handling", difficulty: 5, masteryScore: 55 }
    ],
    riskAreas: [
      "Exception Handling",
      "Data Structures",
      "File I/O"
    ],
    strongAreas: [
      "Variables and Data Types",
      "Control Structures"
    ],
    recommendedActions: [
      "Focus on practicing exception handling scenarios",
      "Review advanced data structures concepts",
      "Allocate more study time to file operations",
      "Consider forming a study group with 2-3 peers",
      "Schedule at least 3 practice exams in the two weeks before the exam"
    ]
  };

  // Chart visualization - simulated SVG for demo
  const generateScoreBarChart = (score, color) => {
    return (
      <div className="chart-bar-container">
        <div 
          className="chart-bar" 
          style={{ 
            width: `${score}%`, 
            backgroundColor: color 
          }}
        ></div>
        <span className="chart-value">{score}%</span>
      </div>
    );
  };

  // Helper to get course data
  const getCourseData = () => {
    if (showDemoMode) {
      return comp204Data;
    } else if (selectedCourse) {
      // Find the course in calendar exams
      const selectedExam = calendarExams.find(exam => exam.course === selectedCourse);
      
      if (selectedExam) {
        // Use course name if available, otherwise just code
        return generateCourseData(selectedExam.course, selectedExam.course_title);
      } else {
        return generateCourseData(selectedCourse);
      }
    }
    return null;
  };
  
  const handleTryDemo = () => {
    setSelectedCourse('COMP204');
    setShowDemoMode(true);
  };
  
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowDemoMode(false);
  };
  
  const handleGoToCalendar = () => {
    navigate('/calendar');
  };
  
  const currentCourseData = getCourseData();

  return (
    <div className="exam-analytics-container">
      <div className="analytics-header">
        <h2><FontAwesomeIcon icon={faChartLine} /> Exam Performance Analytics</h2>
        <p>Data-driven insights to optimize your exam preparation and identify areas needing improvement</p>
      </div>

      {!currentCourseData ? (
        // Demo/welcome screen when no course is selected
        <div className="analytics-welcome">
          <div className="welcome-content">
            <h3>Interactive Exam Analytics</h3>
            <p>Get detailed insights about your exam performance, strengths, areas for improvement, 
            and personalized recommendations.</p>
            
            <div className="welcome-options">
              <div className="option-card">
                <div className="option-header">
                  <FontAwesomeIcon icon={faPlayCircle} className="option-icon" />
                  <h4>Try Demo (COMP 204)</h4>
                </div>
                <p>See sample analytics for COMP 204 to explore this feature</p>
                <button 
                  className="option-button primary-button"
                  onClick={handleTryDemo}
                >
                  Launch Demo
                </button>
              </div>
              
              {calendarExams.length > 0 ? (
                <div className="option-card">
                  <div className="option-header">
                    <FontAwesomeIcon icon={faChartLine} className="option-icon" />
                    <h4>Your Exams</h4>
                  </div>
                  <p>Select an exam from your calendar to see analytics</p>
                  <div className="course-select-list">
                    {calendarExams.map(exam => (
                      <button 
                        key={exam.examKey}
                        className="course-select-item"
                        onClick={() => handleSelectCourse(exam.course)}
                      >
                        {exam.course}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="option-card">
                  <div className="option-header">
                    <FontAwesomeIcon icon={faCalendarAlt} className="option-icon" />
                    <h4>No Exams Found</h4>
                  </div>
                  <p>Add exams to your calendar to see personalized analytics</p>
                  <button 
                    className="option-button secondary-button"
                    onClick={handleGoToCalendar}
                  >
                    Go to Calendar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="analytics-course-selector">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <select
                value={selectedCourse}
                onChange={(e) => {
                  if (e.target.value === 'COMP204') {
                    setSelectedCourse(e.target.value);
                    setShowDemoMode(true);
                  } else {
                    handleSelectCourse(e.target.value);
                  }
                }}
              >
                <option value="COMP204">COMP 204 (Demo)</option>
                {calendarExams.map(exam => (
                  <option key={exam.examKey} value={exam.course}>
                    {exam.course}
                  </option>
                ))}
              </select>
            </div>
            
            {showDemoMode && (
              <div className="demo-indicator">
                <span>Demo Mode</span>
              </div>
            )}
          </div>

      <div className="analytics-dashboard">
        <div className="course-overview">
          <h3>{currentCourseData.courseName}</h3>
          <div className="exam-details">
            <div className="detail-item">
              <span className="detail-label">Exam Date:</span>
              <span className="detail-value">{currentCourseData.examDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{currentCourseData.examTime}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{currentCourseData.location}</span>
            </div>
          </div>
        </div>

        <div className="analytics-row">
          <div className="analytics-card performance-summary">
            <h4>Historical Performance</h4>
            <div className="performance-metrics">
              <div className="metric">
                <div className="metric-value">{currentCourseData.pastPerformance.averageScore}%</div>
                <div className="metric-label">Average Score</div>
              </div>
              <div className="metric">
                <div className="metric-value">{currentCourseData.pastPerformance.passingRate}%</div>
                <div className="metric-label">Passing Rate</div>
              </div>
              <div className="metric">
                <div className="metric-value">{currentCourseData.pastPerformance.difficultyRating}/5</div>
                <div className="metric-label">Difficulty</div>
              </div>
            </div>
          </div>

          <div className="analytics-card risk-assessment">
            <h4>Risk Assessment</h4>
            <div className="risk-areas">
              <div className="risk-header">
                <FontAwesomeIcon icon={faExclamationTriangle} className="risk-icon" />
                <span>Areas Needing Attention</span>
              </div>
              <ul className="risk-list">
                {currentCourseData.riskAreas.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
            <div className="strength-areas">
              <div className="strength-header">
                <FontAwesomeIcon icon={faCheckCircle} className="strength-icon" />
                <span>Your Strengths</span>
              </div>
              <ul className="strength-list">
                {currentCourseData.strongAreas.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="analytics-card topic-analysis">
          <h4>Topic Mastery Analysis</h4>
          <div className="topics-table">
            <div className="topic-row header">
              <div className="topic-name">Topic</div>
              <div className="topic-difficulty">Difficulty</div>
              <div className="topic-mastery">Your Mastery</div>
              <div className="topic-bar">Mastery Level</div>
            </div>
            {currentCourseData.topicDifficulty.map((topic, index) => (
              <div className="topic-row" key={index}>
                <div className="topic-name">{topic.topic}</div>
                <div className="topic-difficulty">
                  {Array(5).fill().map((_, i) => (
                    <span 
                      key={i} 
                      className={`difficulty-dot ${i < topic.difficulty ? 'filled' : ''}`}
                    ></span>
                  ))}
                </div>
                <div className="topic-mastery">{topic.masteryScore}%</div>
                <div className="topic-bar">
                  {generateScoreBarChart(
                    topic.masteryScore, 
                    topic.masteryScore < 60 ? '#ff4d4d' : 
                    topic.masteryScore < 75 ? '#ffae42' : 
                    '#4caf50'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card recommendations">
          <h4>AI-Powered Recommendations</h4>
          <div className="recommendations-content">
            <ul className="recommendations-list">
              {currentCourseData.recommendedActions.map((action, index) => (
                <li key={index}>
                  <FontAwesomeIcon icon={faInfoCircle} className="recommendation-icon" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
            <div className="confidence-score">
              <div className="confidence-label">AI Confidence Score</div>
              <div className="confidence-value">87%</div>
              <div className="confidence-note">Based on historical data and your current progress</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )}

    </div>
  );
};

export default ExamAnalytics;