// ASU Exam Scheduler JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initNavigation();
    
    // Add debug information
    const debugInfo = document.createElement('div');
    debugInfo.style.position = 'fixed';
    debugInfo.style.bottom = '10px';
    debugInfo.style.right = '10px';
    debugInfo.style.background = 'rgba(0,0,0,0.8)';
    debugInfo.style.color = 'white';
    debugInfo.style.padding = '10px';
    debugInfo.style.borderRadius = '5px';
    debugInfo.style.fontSize = '12px';
    debugInfo.style.zIndex = '9999';
    debugInfo.innerHTML = `
        <p>Debug Info:</p>
        <p>Origin: ${window.location.origin}</p>
        <p>Protocol: ${window.location.protocol}</p>
        <button id="debug-button" style="padding: 5px 10px; margin-top: 5px;">Test Backend</button>
    `;
    document.body.appendChild(debugInfo);
    
    document.getElementById('debug-button').addEventListener('click', testDirectFetch);
    
    checkBackendConnection();
    setupEventListeners();
    loadStoredExams();
});

// Navigation handling
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and pages
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show the corresponding page
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
        });
    });

    // Handle "Get Started" button click
    document.getElementById('getStartedBtn').addEventListener('click', function() {
        // Find and click the search nav link
        const searchLink = document.querySelector('.nav-links a[data-page="search"]');
        searchLink.click();
    });
}

// Backend connection check
function checkBackendConnection() {
    const connectionStatus = document.getElementById('connection-status');
    
    // Test with a simple endpoint first
    const url = 'http://localhost:8080/api/v1/exam';
    console.log('Testing backend connection to:', url);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        mode: 'cors' // Explicitly request CORS mode
        // Removed credentials to allow '*' origin in backend
    })
        .then(response => {
            console.log('Connection test response status:', response.status);
            console.log('Connection test response headers:', response.headers);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            connectionStatus.textContent = `✅ Connected to backend successfully!`;
            connectionStatus.parentElement.classList.add('success');
            connectionStatus.parentElement.classList.remove('error');
        })
        .catch(error => {
            connectionStatus.textContent = `❌ Failed to connect to backend: ${error.message}`;
            connectionStatus.parentElement.classList.add('error');
            connectionStatus.parentElement.classList.remove('success');
            console.error('Backend connection error:', error);
        });
}

// Set up event listeners for user interactions
function setupEventListeners() {
    // Search functionality
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('exam-search');
    
    searchButton.addEventListener('click', function() {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(this.value);
        }
    });
    
    // Historical search
    const historicalSearchButton = document.getElementById('historical-search-button');
    const historicalSearchInput = document.getElementById('historical-search');
    
    historicalSearchButton.addEventListener('click', function() {
        const selectedYears = Array.from(document.querySelectorAll('.year-options input:checked'))
            .map(checkbox => checkbox.value);
            
        performHistoricalSearch(historicalSearchInput.value, selectedYears);
    });
    
    // Calendar actions
    document.getElementById('export-calendar').addEventListener('click', exportCalendar);
    document.getElementById('clear-calendar').addEventListener('click', clearCalendar);
    
    // Study plan generation
    document.getElementById('generate-plan-btn').addEventListener('click', generateStudyPlan);
    
    // Contact form
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const formValues = Object.fromEntries(formData.entries());
        
        // Simulate form submission
        alert(`Thank you for your message, ${formValues.name}! I'll get back to you soon.`);
        this.reset();
    });
}

// Mock data for demonstration when backend is empty
const mockExamData = [
    {
        course: "COMP 204",
        section: "1",
        course_title: "Comp. Programming for Life Sci",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "23-Apr-2024 at 9:00 AM",
        exam_end_time: "23-Apr-2024 at 12:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    },
    {
        course: "COMP 206",
        section: "1",
        course_title: "Intro to Software Systems",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "24-Apr-2024 at 9:00 AM",
        exam_end_time: "24-Apr-2024 at 12:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    },
    {
        course: "COMP 251",
        section: "1",
        course_title: "Algorithms and Data Structures",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "29-Apr-2024 at 9:00 AM",
        exam_end_time: "29-Apr-2024 at 12:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    },
    {
        course: "COMP 302",
        section: "1",
        course_title: "Programming Lang & Paradigms",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "17-Apr-2024 at 2:00 PM",
        exam_end_time: "17-Apr-2024 at 5:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    },
    {
        course: "COMP 303",
        section: "1",
        course_title: "Software Design",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "15-Apr-2024 at 9:00 AM",
        exam_end_time: "15-Apr-2024 at 12:00 PM",
        building: "GYM", 
        room: "FIELD HOUSE"
    },
    {
        course: "ACCT 351",
        section: "1",
        course_title: "Intermediate Financial Acct 1",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "24-Apr-2024 at 2:00 PM",
        exam_end_time: "24-Apr-2024 at 5:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    }
];

// Search for exams
function performSearch(query) {
    if (!query.trim()) {
        alert('Please enter a course code');
        return;
    }
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    // Log the full URL for debugging
    const url = `http://localhost:8080/api/v1/exam?className=${encodeURIComponent(query)}`;
    console.log('Making API call to:', url);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        mode: 'cors' // Explicitly request CORS mode
        // Removed credentials to allow '*' origin in backend
    })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Use mock data if backend returns empty array
            if (data.length === 0) {
                console.log('Backend returned no data, using mock data');
                // Filter mock data based on the search query
                const query_upper = query.toUpperCase();
                data = mockExamData.filter(exam => 
                    exam.course.toUpperCase().includes(query_upper) || 
                    exam.course_title.toUpperCase().includes(query_upper)
                );
                
                if (data.length === 0) {
                    resultsContainer.innerHTML = '<p>No exams found matching your search</p>';
                    return;
                }
            }
            
            let html = '<table>';
            html += `
                <tr>
                    <th>Course</th>
                    <th>Section</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Actions</th>
                </tr>
            `;
            
            data.forEach(exam => {
                const isAdded = isExamInCalendar(exam);
                
                html += `
                    <tr>
                        <td>${exam.course || '-'}</td>
                        <td>${exam.section || '-'}</td>
                        <td>${exam.course_title || '-'}</td>
                        <td>${exam.exam_type || '-'}</td>
                        <td>${exam.exam_start_time || '-'}</td>
                        <td>${exam.exam_end_time || '-'}</td>
                        <td>
                            <button class="main-button ${isAdded ? 'secondary-button' : ''}" 
                                    onclick="addToCalendar(${JSON.stringify(exam).replace(/"/g, '&quot;')})" 
                                    ${isAdded ? 'disabled' : ''}>
                                ${isAdded ? 'Added' : 'Add to Calendar'}
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</table>';
            resultsContainer.innerHTML = html;
        })
        .catch(error => {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            console.error('Search error:', error);
        });
}

// Mock data for historical exams
const mockHistoricalExamData = [
    {
        course: "COMP 204",
        section: "1",
        year: "F2023",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "14-Dec-2023 at 9:00 AM",
        exam_end_time: "14-Dec-2023 at 12:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    },
    {
        course: "COMP 204",
        section: "1",
        year: "W2023",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS", 
        exam_start_time: "21-Apr-2023 at 9:00 AM",
        exam_end_time: "21-Apr-2023 at 12:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    },
    {
        course: "COMP 206",
        section: "1",
        year: "F2023",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "18-Dec-2023 at 2:00 PM",
        exam_end_time: "18-Dec-2023 at 5:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    },
    {
        course: "COMP 251",
        section: "1",
        year: "F2023",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "20-Dec-2023 at 9:00 AM",
        exam_end_time: "20-Dec-2023 at 12:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    },
    {
        course: "ACCT 351",
        section: "1",
        year: "F2023",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "20-Dec-2023 at 9:00 AM",
        exam_end_time: "20-Dec-2023 at 12:00 PM",
        building: "GYM",
        room: "BLEACHERS"
    },
    {
        course: "COMP 251",
        section: "1",
        year: "W2023",
        exam_type: "IN-PERSON - FORMAL EXAM - D.T. CAMPUS",
        exam_start_time: "28-Apr-2023 at 9:00 AM",
        exam_end_time: "28-Apr-2023 at 12:00 PM",
        building: "GYM",
        room: "FIELD HOUSE"
    }
];

// Search for historical exams
function performHistoricalSearch(query, years) {
    if (!query.trim()) {
        alert('Please enter a course code');
        return;
    }
    
    if (!years.length) {
        alert('Please select at least one year');
        return;
    }
    
    const resultsContainer = document.getElementById('historical-results');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    // Log the full URL for debugging
    const url = `http://localhost:8080/api/v1/historic-exams/historic?names=${encodeURIComponent(query)}&years=${encodeURIComponent(years.join(','))}`;
    console.log('Making API call to:', url);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        mode: 'cors' // Explicitly request CORS mode
        // Removed credentials to allow '*' origin in backend
    })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Use mock data if backend returns empty array
            if (data.length === 0) {
                console.log('Backend returned no historical data, using mock data');
                // Filter mock historical data based on the search query and selected years
                const query_upper = query.toUpperCase();
                data = mockHistoricalExamData.filter(exam => 
                    (exam.course.toUpperCase().includes(query_upper)) && 
                    years.includes(exam.year)
                );
                
                if (data.length === 0) {
                    resultsContainer.innerHTML = '<p>No historical exams found matching your search</p>';
                    return;
                }
            }
            
            let html = '<table>';
            html += `
                <tr>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Exam Start Time</th>
                    <th>Exam End Time</th>
                    <th>Type</th>
                    <th>Building</th>
                    <th>Room</th>
                </tr>
            `;
            
            data.forEach(exam => {
                html += `
                    <tr>
                        <td>${exam.course || '-'}</td>
                        <td>${exam.year || '-'}</td>
                        <td>${exam.exam_start_time || '-'}</td>
                        <td>${exam.exam_end_time || '-'}</td>
                        <td>${exam.exam_type || '-'}</td>
                        <td>${exam.building || '-'}</td>
                        <td>${exam.room || '-'}</td>
                    </tr>
                `;
            });
            
            html += '</table>';
            resultsContainer.innerHTML = html;
        })
        .catch(error => {
            resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            console.error('Historical search error:', error);
        });
}

// Calendar functions
function addToCalendar(exam) {
    // Get stored exams from sessionStorage
    const storedExams = JSON.parse(sessionStorage.getItem('calendar')) || [];
    
    // Check if exam is already in calendar
    if (isExamInCalendar(exam)) {
        alert('This exam is already in your calendar');
        return;
    }
    
    // Add to storage
    storedExams.push(exam);
    sessionStorage.setItem('calendar', JSON.stringify(storedExams));
    
    // Update UI
    loadStoredExams();
    
    // Update search results to reflect the addition
    if (document.getElementById('search').classList.contains('active')) {
        const searchInput = document.getElementById('exam-search');
        if (searchInput.value.trim()) {
            performSearch(searchInput.value);
        }
    }
    
    alert(`Added ${exam.course} to your calendar`);
}

function isExamInCalendar(exam) {
    const storedExams = JSON.parse(sessionStorage.getItem('calendar')) || [];
    return storedExams.some(storedExam => storedExam.course === exam.course && storedExam.section === exam.section);
}

function loadStoredExams() {
    const examList = document.getElementById('exam-list');
    const storedExams = JSON.parse(sessionStorage.getItem('calendar')) || [];
    
    if (storedExams.length === 0) {
        examList.innerHTML = '<p>No exams in your calendar yet. Search for exams to add them.</p>';
        return;
    }
    
    let html = '<table>';
    html += `
        <tr>
            <th>Course</th>
            <th>Section</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
        </tr>
    `;
    
    storedExams.forEach(exam => {
        html += `
            <tr>
                <td>${exam.course || '-'}</td>
                <td>${exam.section || '-'}</td>
                <td>${exam.exam_start_time || '-'}</td>
                <td>${exam.exam_end_time || '-'}</td>
                <td>
                    <button class="secondary-button" onclick="removeFromCalendar('${exam.course}', '${exam.section}')">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</table>';
    examList.innerHTML = html;
}

function removeFromCalendar(course, section) {
    const storedExams = JSON.parse(sessionStorage.getItem('calendar')) || [];
    const updatedExams = storedExams.filter(exam => !(exam.course === course && exam.section === section));
    
    sessionStorage.setItem('calendar', JSON.stringify(updatedExams));
    loadStoredExams();
    
    // Update search results to reflect the removal
    if (document.getElementById('search').classList.contains('active')) {
        const searchInput = document.getElementById('exam-search');
        if (searchInput.value.trim()) {
            performSearch(searchInput.value);
        }
    }
}

function exportCalendar() {
    const storedExams = JSON.parse(sessionStorage.getItem('calendar')) || [];
    
    if (storedExams.length === 0) {
        alert('No exams to export');
        return;
    }
    
    // In a real implementation, we would generate an iCal file here
    alert('Calendar export functionality would be implemented here.');
    
    // Example of what we might do:
    let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ASU Exam Scheduler//EN\n';
    
    storedExams.forEach(exam => {
        icalContent += 'BEGIN:VEVENT\n';
        icalContent += `SUMMARY:${exam.course} Exam\n`;
        icalContent += `DESCRIPTION:${exam.course_title || ''}\n`;
        icalContent += `LOCATION:${exam.building || ''} ${exam.room || ''}\n`;
        // Add date/time conversion logic here
        icalContent += 'END:VEVENT\n';
    });
    
    icalContent += 'END:VCALENDAR';
    
    console.log('iCal content would be:', icalContent);
}

function clearCalendar() {
    if (confirm('Are you sure you want to clear all exams from your calendar?')) {
        sessionStorage.removeItem('calendar');
        loadStoredExams();
        
        // Update search results to reflect the clearing
        if (document.getElementById('search').classList.contains('active')) {
            const searchInput = document.getElementById('exam-search');
            if (searchInput.value.trim()) {
                performSearch(searchInput.value);
            }
        }
    }
}

// AI Study Plan Generator
function generateStudyPlan() {
    const resultsContainer = document.getElementById('study-plan-results');
    
    // Get selected exams from the calendar
    const storedExams = JSON.parse(sessionStorage.getItem('calendar')) || [];
    
    if (storedExams.length === 0) {
        resultsContainer.innerHTML = '<p>Please add some exams to your calendar first!</p>';
        return;
    }
    
    // Get preferences
    const preferences = {
        studySessionLength: document.getElementById('studySessionLength').value,
        preferredTimeOfDay: document.getElementById('preferredTimeOfDay').value,
        learningStyle: document.getElementById('learningStyle').value
    };
    
    // Show loading state
    resultsContainer.innerHTML = '<p>Generating your personalized study plan based on your selected exams...</p>';
    
    // Simulate AI processing (in a real app, we would call the AI backend)
    setTimeout(() => {
        // Generate course distribution based on actual selected exams
        const courseDistribution = {};
        storedExams.forEach(exam => {
            // Generate random difficulty between 0.5 and 0.9
            const difficulty = Math.round((0.5 + Math.random() * 0.4) * 10) / 10;
            // Generate hours based on difficulty (15-35 hours)
            const hours = Math.round(15 + difficulty * 25);
            
            courseDistribution[exam.course] = {
                difficultyCoefficent: difficulty,
                recommendedHours: hours
            };
        });
        
        // Generate weeks based on the earliest exam date
        const weeks = [];
        const courses = Object.keys(courseDistribution);
        
        // Create two weeks of study plan
        for (let weekNum = 1; weekNum <= 2; weekNum++) {
            const weekFocus = weekNum === 1 ? 'Foundation concepts' : 'Advanced application';
            const dailySessions = [];
            
            // Create daily study sessions
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach((day, index) => {
                if (day === 'Sunday') {
                    dailySessions.push({ 
                        day: day, 
                        course: 'Rest', 
                        topics: [],
                        duration: 0
                    });
                    return;
                }
                
                if (day === 'Saturday') {
                    dailySessions.push({ 
                        day: day, 
                        course: weekNum === 1 ? 'Review' : 'Practice Exams', 
                        topics: ['All'],
                        duration: weekNum === 1 ? 180 : 240
                    });
                    return;
                }
                
                // Assign a course to this day based on index
                const course = courses[index % courses.length];
                
                // Generate topics based on the course and week
                let topics = [];
                if (course.includes('COMP')) {
                    topics = weekNum === 1 ? 
                        ['Data Structures', 'Algorithms', 'Programming Concepts'] :
                        ['Advanced Algorithms', 'System Design', 'Code Optimization'];
                } else if (course.includes('MATH')) {
                    topics = weekNum === 1 ?
                        ['Limits', 'Derivatives', 'Integrals'] :
                        ['Applications', 'Series', 'Multi-variable Calculus'];
                } else if (course.includes('ACCT')) {
                    topics = weekNum === 1 ?
                        ['Financial Statements', 'Accounting Principles', 'Auditing'] :
                        ['Advanced Accounting', 'Tax Planning', 'Financial Analysis'];
                } else {
                    topics = weekNum === 1 ?
                        ['Core Concepts', 'Basic Principles'] :
                        ['Advanced Applications', 'Case Studies'];
                }
                
                // Session duration based on course difficulty
                const courseDifficulty = courseDistribution[course].difficultyCoefficent;
                const duration = Math.round(60 + (courseDifficulty * 90));
                
                dailySessions.push({
                    day: day,
                    course: course,
                    topics: [topics[Math.floor(Math.random() * topics.length)]],
                    duration: duration
                });
            });
            
            weeks.push({
                week: weekNum,
                focus: weekFocus,
                dailySessions: dailySessions
            });
        }
        
        // Construct the plan
        const plan = {
            courseDistribution: courseDistribution,
            weeklySchedule: weeks,
            confidenceScore: 0.87,
            explanation: `This personalized study plan focuses on your ${courses.length} selected exams, prioritizing ${courses[0]} and ${courses.length > 1 ? courses[1] : 'other subjects'} based on exam proximity and difficulty. The plan adapts to your ${preferences.learningStyle} learning style with ${preferences.studySessionLength}-minute study sessions, primarily scheduled during your preferred ${preferences.preferredTimeOfDay} time slot.`
        };
        
        // Build HTML for study plan
        let html = `
            <div class="study-plan">
                <div class="plan-header">
                    <h3>Your Personalized Study Plan</h3>
                    <div class="confidence-score">
                        AI Confidence: ${Math.round(plan.confidenceScore * 100)}%
                    </div>
                </div>
                
                <div class="plan-explanation">
                    <p>${plan.explanation}</p>
                </div>
                
                <h4><i class="fas fa-book"></i> Course Focus Distribution</h4>
                <div class="course-cards">
        `;
        
        // Course distribution
        Object.entries(plan.courseDistribution).forEach(([course, data]) => {
            html += `
                <div class="course-card" style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <div style="font-weight: bold; font-size: 18px;">${course}</div>
                    <div>Difficulty: ${Math.round(data.difficultyCoefficent * 10)}/10</div>
                    <div><i class="fas fa-clock"></i> ${data.recommendedHours} hours</div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Weekly schedule
        plan.weeklySchedule.forEach(week => {
            html += `
                <h4 style="margin-top: 30px;"><i class="fas fa-calendar-alt"></i> Week ${week.week}: ${week.focus}</h4>
                <div style="display: flex; overflow-x: auto; gap: 10px; padding: 10px 0;">
            `;
            
            week.dailySessions.forEach(session => {
                const isRestDay = session.course === 'Rest';
                html += `
                    <div style="min-width: 200px; background-color: ${isRestDay ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)'}; padding: 15px; border-radius: 8px;">
                        <div style="font-weight: bold;">${session.day}</div>
                        <div>${session.course}</div>
                        ${session.topics.length > 0 ? `<div>${session.topics.join(', ')}</div>` : ''}
                        ${session.duration > 0 ? `<div>${session.duration} minutes</div>` : ''}
                    </div>
                `;
            });
            
            html += '</div>';
        });
        
        resultsContainer.innerHTML = html;
    }, 1500);
}

// Direct fetch test for debugging
function testDirectFetch() {
    alert('Testing direct API connection. Check the console for results.');
    
    // Try a simple GET request with XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8080/api/v1/exam', true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.withCredentials = false; // Disable credentials to match backend configuration
    
    xhr.onload = function() {
        console.log('XHR Status:', xhr.status);
        console.log('XHR Response:', xhr.responseText);
        if (xhr.status === 200) {
            alert('XHR Connection successful! See console for details.');
            document.getElementById('connection-status').textContent = `✅ Connected to backend successfully!`;
            document.getElementById('connection-status').parentElement.classList.add('success');
            document.getElementById('connection-status').parentElement.classList.remove('error');
        } else {
            alert('XHR Error: ' + xhr.statusText);
        }
    };
    
    xhr.onerror = function() {
        console.error('XHR Error:', xhr);
        alert('XHR Network error occurred. This often indicates a CORS issue or backend is not running.');
        
        // Additional diagnostic info
        let errorDetails = 'CORS issues can happen when:<br>';
        errorDetails += '1. Backend server is not running (check port 8080)<br>';
        errorDetails += '2. Backend CORS configuration does not match frontend origin<br>';
        errorDetails += '3. Using file:// protocol instead of http://<br>';
        errorDetails += `4. Current origin: ${window.location.origin}<br>`;
        
        document.getElementById('connection-status').innerHTML = 
            `❌ Failed to connect to backend.<br>${errorDetails}`;
        document.getElementById('connection-status').parentElement.classList.add('error');
        document.getElementById('connection-status').parentElement.classList.remove('success');
    };
    
    xhr.send();
    
    // Also try with fetch for comparison
    fetch('http://localhost:8080/api/v1/exam', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        mode: 'cors'
        // Removed credentials to match backend configuration
    })
    .then(response => {
        console.log('Fetch Response:', response);
        return response.text();
    })
    .then(text => {
        console.log('Fetch Response Text:', text);
        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('Not JSON response');
        }
    })
    .catch(error => {
        console.error('Fetch Error:', error);
    });
}

// Exam Difficulty Predictor
function predictDifficulty() {
    const query = document.getElementById('difficulty-search-input').value;
    
    if (!query.trim()) {
        alert('Please enter a course code');
        return;
    }
    
    const resultsContainer = document.getElementById('difficulty-results');
    resultsContainer.innerHTML = '<p>Analyzing exam difficulty...</p>';
    
    // Simulate AI processing
    setTimeout(() => {
        // Find if this course exists in our mock data
        const query_upper = query.toUpperCase();
        const matchingCourses = mockExamData.filter(exam => 
            exam.course.toUpperCase().includes(query_upper)
        );
        
        if (matchingCourses.length === 0) {
            resultsContainer.innerHTML = '<p>No exams found matching your search</p>';
            return;
        }
        
        let html = '';
        
        // For each matching course, generate a difficulty prediction
        matchingCourses.forEach(course => {
            // Generate a random difficulty score between 4 and 9
            const difficultyScore = Math.floor(Math.random() * 6) + 4;
            const difficultyPercent = difficultyScore * 10;
            
            // Create topic difficulty scores
            const topics = [];
            if (course.course.includes('COMP')) {
                topics.push(
                    { name: 'Algorithms', hours: Math.floor(Math.random() * 5) + 5, percent: Math.floor(Math.random() * 30) + 20 },
                    { name: 'Data Structures', hours: Math.floor(Math.random() * 4) + 4, percent: Math.floor(Math.random() * 25) + 15 },
                    { name: 'Programming Concepts', hours: Math.floor(Math.random() * 3) + 3, percent: Math.floor(Math.random() * 20) + 10 },
                    { name: 'System Design', hours: Math.floor(Math.random() * 3) + 2, percent: Math.floor(Math.random() * 15) + 5 }
                );
            } else if (course.course.includes('MATH')) {
                topics.push(
                    { name: 'Calculus', hours: Math.floor(Math.random() * 5) + 5, percent: Math.floor(Math.random() * 30) + 20 },
                    { name: 'Linear Algebra', hours: Math.floor(Math.random() * 4) + 4, percent: Math.floor(Math.random() * 25) + 15 },
                    { name: 'Probability', hours: Math.floor(Math.random() * 3) + 3, percent: Math.floor(Math.random() * 20) + 10 },
                    { name: 'Discrete Math', hours: Math.floor(Math.random() * 3) + 2, percent: Math.floor(Math.random() * 15) + 5 }
                );
            } else if (course.course.includes('ACCT')) {
                topics.push(
                    { name: 'Financial Statements', hours: Math.floor(Math.random() * 5) + 5, percent: Math.floor(Math.random() * 30) + 20 },
                    { name: 'Accounting Principles', hours: Math.floor(Math.random() * 4) + 4, percent: Math.floor(Math.random() * 25) + 15 },
                    { name: 'Tax Regulations', hours: Math.floor(Math.random() * 3) + 3, percent: Math.floor(Math.random() * 20) + 10 },
                    { name: 'Auditing', hours: Math.floor(Math.random() * 3) + 2, percent: Math.floor(Math.random() * 15) + 5 }
                );
            } else {
                topics.push(
                    { name: 'Core Concepts', hours: Math.floor(Math.random() * 5) + 5, percent: Math.floor(Math.random() * 30) + 20 },
                    { name: 'Advanced Applications', hours: Math.floor(Math.random() * 4) + 4, percent: Math.floor(Math.random() * 25) + 15 },
                    { name: 'Case Studies', hours: Math.floor(Math.random() * 3) + 3, percent: Math.floor(Math.random() * 20) + 10 },
                    { name: 'Problem Solving', hours: Math.floor(Math.random() * 3) + 2, percent: Math.floor(Math.random() * 15) + 5 }
                );
            }
            
            // Calculate total study hours
            const totalHours = topics.reduce((sum, topic) => sum + topic.hours, 0);
            
            html += `
                <div class="difficulty-card">
                    <div class="difficulty-header">
                        <div class="difficulty-title">${course.course}: ${course.course_title}</div>
                        <div class="difficulty-score">${difficultyScore}/10</div>
                    </div>
                    
                    <div class="difficulty-meter">
                        <div class="difficulty-fill" style="width: ${difficultyPercent}%"></div>
                    </div>
                    
                    <div class="difficulty-insights">
                        <p><strong>Analysis:</strong> Based on historical exam data, student feedback, and course content analysis, this exam is rated ${difficultyScore}/10 in difficulty.</p>
                        <p>Students typically spend an average of ${totalHours} hours preparing for this exam, with around ${Math.floor(totalHours * 0.4)} hours in the final week before the exam.</p>
                    </div>
                    
                    <div class="time-allocation">
                        <h4>Recommended Study Time Allocation</h4>
                        ${topics.map(topic => `
                            <div class="topic-allocation">
                                <div class="topic-name">${topic.name}</div>
                                <div class="topic-hours">${topic.hours} hours</div>
                            </div>
                            <div class="topic-bar">
                                <div class="topic-fill" style="width: ${topic.percent}%"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
    }, 1500);
}

// Knowledge Graph Navigation
function loadKnowledgeGraph() {
    const query = document.getElementById('graph-search-input').value;
    
    if (!query.trim()) {
        alert('Please enter a course code');
        return;
    }
    
    const graphContainer = document.getElementById('graph-visualization');
    graphContainer.innerHTML = '<p>Generating knowledge graph...</p>';
    
    // Simulate AI processing
    setTimeout(() => {
        // Find if this course exists in our mock data
        const query_upper = query.toUpperCase();
        const matchingCourses = mockExamData.filter(exam => 
            exam.course.toUpperCase().includes(query_upper)
        );
        
        if (matchingCourses.length === 0) {
            graphContainer.innerHTML = '<p>No courses found matching your search</p>';
            return;
        }
        
        // Use the first matching course
        const course = matchingCourses[0];
        
        // Generate nodes and connections based on the course
        let nodes = [];
        let edges = [];
        
        // Structure depends on course type
        if (course.course.includes('COMP')) {
            // For Computer Science courses
            nodes = [
                { id: 'current', label: course.course, type: 'current', x: 50, y: 50, description: 'Currently selected course' },
                { id: 'prereq1', label: 'COMP 200', type: 'prereq', x: 20, y: 30, description: 'Programming Fundamentals' },
                { id: 'prereq2', label: 'MATH 240', type: 'prereq', x: 20, y: 70, description: 'Discrete Mathematics' },
                { id: 'related1', label: 'COMP 250', type: 'related', x: 80, y: 30, description: 'Data Structures & Algorithms' },
                { id: 'related2', label: 'COMP 260', type: 'related', x: 80, y: 70, description: 'Software Engineering' },
                { id: 'advanced1', label: 'COMP 360', type: 'advanced', x: 50, y: 90, description: 'Algorithm Design' }
            ];
            
            edges = [
                { from: 'prereq1', to: 'current' },
                { from: 'prereq2', to: 'current' },
                { from: 'current', to: 'related1' },
                { from: 'current', to: 'related2' },
                { from: 'related1', to: 'advanced1' }
            ];
        } else if (course.course.includes('MATH')) {
            // For Mathematics courses
            nodes = [
                { id: 'current', label: course.course, type: 'current', x: 50, y: 50, description: 'Currently selected course' },
                { id: 'prereq1', label: 'MATH 133', type: 'prereq', x: 20, y: 30, description: 'Linear Algebra' },
                { id: 'prereq2', label: 'MATH 140', type: 'prereq', x: 20, y: 70, description: 'Calculus I' },
                { id: 'related1', label: 'MATH 255', type: 'related', x: 80, y: 30, description: 'Differential Equations' },
                { id: 'related2', label: 'MATH 323', type: 'related', x: 80, y: 70, description: 'Probability Theory' },
                { id: 'advanced1', label: 'MATH 450', type: 'advanced', x: 50, y: 90, description: 'Analysis' }
            ];
            
            edges = [
                { from: 'prereq1', to: 'current' },
                { from: 'prereq2', to: 'current' },
                { from: 'current', to: 'related1' },
                { from: 'current', to: 'related2' },
                { from: 'related2', to: 'advanced1' }
            ];
        } else {
            // Generic course structure
            nodes = [
                { id: 'current', label: course.course, type: 'current', x: 50, y: 50, description: 'Currently selected course' },
                { id: 'prereq1', label: course.course.split(' ')[0] + ' 200', type: 'prereq', x: 20, y: 30, description: 'Foundation Course I' },
                { id: 'prereq2', label: course.course.split(' ')[0] + ' 210', type: 'prereq', x: 20, y: 70, description: 'Foundation Course II' },
                { id: 'related1', label: course.course.split(' ')[0] + ' 310', type: 'related', x: 80, y: 30, description: 'Related Topic I' },
                { id: 'related2', label: course.course.split(' ')[0] + ' 320', type: 'related', x: 80, y: 70, description: 'Related Topic II' },
                { id: 'advanced1', label: course.course.split(' ')[0] + ' 400', type: 'advanced', x: 50, y: 90, description: 'Advanced Topic' }
            ];
            
            edges = [
                { from: 'prereq1', to: 'current' },
                { from: 'prereq2', to: 'current' },
                { from: 'current', to: 'related1' },
                { from: 'current', to: 'related2' },
                { from: 'related1', to: 'advanced1' }
            ];
        }
        
        // Create the visualization HTML
        let html = `
            <div class="graph-canvas">
                ${nodes.map(node => `
                    <div class="node ${node.type}" style="left: ${node.x}%; top: ${node.y}%;" onclick="showNodeInfo('${node.id}', event)">
                        ${node.label}
                    </div>
                `).join('')}
                
                ${edges.map((edge, index) => {
                    const fromNode = nodes.find(n => n.id === edge.from);
                    const toNode = nodes.find(n => n.id === edge.to);
                    
                    // Calculate edge position and rotation
                    const dx = toNode.x - fromNode.x;
                    const dy = toNode.y - fromNode.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    return `
                        <div class="edge" id="edge-${index}" style="
                            left: ${fromNode.x}%; 
                            top: ${fromNode.y}%; 
                            width: ${length}%; 
                            transform: rotate(${angle}deg);
                        "></div>
                    `;
                }).join('')}
                
                ${nodes.map(node => `
                    <div class="node-info" id="info-${node.id}">
                        <h4>${node.label}</h4>
                        <p>${node.description}</p>
                        <p><strong>Topics:</strong> ${getRandomTopics(node.label)}</p>
                        <p><strong>Relationship:</strong> ${node.type === 'prereq' ? 'Prerequisite for' : node.type === 'advanced' ? 'Builds upon' : node.type === 'current' ? 'Current course' : 'Related to'} ${course.course}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="graph-legend" style="margin-top: 20px; display: flex; gap: 15px; justify-content: center;">
                <div style="display: flex; align-items: center;">
                    <div style="width: 15px; height: 15px; background-color: #4CAF50; border-radius: 3px; margin-right: 5px;"></div>
                    <span>Prerequisites</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 15px; height: 15px; background-color: var(--accent-color); border-radius: 3px; margin-right: 5px;"></div>
                    <span>Current Course</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 15px; height: 15px; background-color: var(--secondary-color); border-radius: 3px; margin-right: 5px;"></div>
                    <span>Related Courses</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 15px; height: 15px; background-color: #9C27B0; border-radius: 3px; margin-right: 5px;"></div>
                    <span>Advanced Courses</span>
                </div>
            </div>
        `;
        
        graphContainer.innerHTML = html;
    }, 1500);
}

// Helper function to get random topics for a course
function getRandomTopics(courseLabel) {
    let topicPool = [];
    
    if (courseLabel.includes('COMP')) {
        topicPool = ['Algorithms', 'Data Structures', 'Programming Languages', 'Software Design', 'Databases', 'Operating Systems', 'Computer Networks', 'Machine Learning'];
    } else if (courseLabel.includes('MATH')) {
        topicPool = ['Calculus', 'Linear Algebra', 'Differential Equations', 'Discrete Math', 'Probability', 'Statistics', 'Number Theory', 'Numerical Analysis'];
    } else if (courseLabel.includes('ACCT')) {
        topicPool = ['Financial Statements', 'Accounting Principles', 'Auditing', 'Tax Planning', 'Cost Accounting', 'Managerial Accounting', 'Corporate Finance', 'Financial Analysis'];
    } else {
        topicPool = ['Fundamentals', 'Theory', 'Applied Methods', 'Case Studies', 'Research Methods', 'Current Developments', 'Ethics', 'Professional Practice'];
    }
    
    // Select 3-4 random topics
    const count = Math.floor(Math.random() * 2) + 3;
    const selectedTopics = [];
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * topicPool.length);
        selectedTopics.push(topicPool[randomIndex]);
        topicPool.splice(randomIndex, 1);
        
        if (topicPool.length === 0) break;
    }
    
    return selectedTopics.join(', ');
}

// Show node information in the knowledge graph
function showNodeInfo(nodeId, event) {
    // Hide all node info boxes
    document.querySelectorAll('.node-info').forEach(info => {
        info.style.display = 'none';
    });
    
    // Show the selected node info
    const infoBox = document.getElementById(`info-${nodeId}`);
    if (infoBox) {
        infoBox.style.display = 'block';
        infoBox.style.left = (event.pageX - 125) + 'px';
        infoBox.style.top = (event.pageY - 150) + 'px';
    }
}

// AI Study Companion
function initStudyCompanion() {
    updateCompanionCourses();
    generateTopics();
    
    // Monitor for calendar changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'calendar') {
            updateCompanionCourses();
        }
    });
}

function updateCompanionCourses() {
    const storedExams = JSON.parse(sessionStorage.getItem('calendar')) || [];
    const coursesContainer = document.getElementById('companion-courses');
    
    if (storedExams.length === 0) {
        coursesContainer.innerHTML = '<p>Add exams to your calendar to see them here</p>';
        return;
    }
    
    let html = '<ul class="topic-list">';
    storedExams.forEach(exam => {
        html += `<li onclick="selectCourse('${exam.course}')">${exam.course}: ${exam.course_title}</li>`;
    });
    html += '</ul>';
    
    coursesContainer.innerHTML = html;
}

function generateTopics() {
    const topicsList = document.getElementById('topics-list');
    
    // Generate some default topics
    const defaultTopics = [
        'Exam Preparation Strategies',
        'Time Management',
        'Study Techniques',
        'Memory Improvement',
        'Stress Management',
        'Practice Problems',
        'Quick Concept Reviews',
        'Test-Taking Strategies'
    ];
    
    let html = '';
    defaultTopics.forEach(topic => {
        html += `<li onclick="selectTopic('${topic}')">${topic}</li>`;
    });
    
    topicsList.innerHTML = html;
}

function selectCourse(course) {
    // Add classes to highlight the selected course
    document.querySelectorAll('#companion-courses li').forEach(li => {
        if (li.textContent.startsWith(course)) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
    
    // Add a message from the AI
    addAIMessage(`I see you've selected ${course}. What specific aspects of this course would you like help with?`);
}

function selectTopic(topic) {
    // Add classes to highlight the selected topic
    document.querySelectorAll('#topics-list li').forEach(li => {
        if (li.textContent === topic) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
    
    // Generate AI response based on the topic
    let response = '';
    
    switch(topic) {
        case 'Exam Preparation Strategies':
            response = "Let's build an exam preparation strategy. I recommend starting 2-3 weeks before the exam. Begin by organizing your materials and creating a study schedule. Focus on understanding concepts first, then move to practice problems. Regular self-testing is crucial for retention. Would you like me to help you create a personalized study schedule?";
            break;
        case 'Time Management':
            response = "Effective time management is essential for exam success. Try the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break. For complex material, allocate 60-70% of your study time to the most difficult topics. Would you like tips on prioritizing your study material?";
            break;
        case 'Study Techniques':
            response = "Different subjects require different study approaches. For mathematical concepts, active problem-solving is key. For theoretical subjects, techniques like concept mapping, teaching the material to someone else, or creating summary notes can be effective. What subject are you focusing on?";
            break;
        case 'Memory Improvement':
            response = "To improve retention, try spaced repetition - reviewing material at increasing intervals. Also, connecting new information to existing knowledge (elaboration) and visualizing concepts can significantly boost recall. Would you like specific memory techniques for your course material?";
            break;
        case 'Stress Management':
            response = "Exam anxiety is common. Try deep breathing exercises: breathe in for 4 counts, hold for 2, exhale for 6. Regular physical activity, adequate sleep, and balanced nutrition all help manage stress. Remember to schedule short breaks during your study sessions. Would you like more stress-reduction techniques?";
            break;
        case 'Practice Problems':
            response = "Practice problems are crucial for mastering content. Start with simple problems to build confidence, then progress to complex ones. Analyze your mistakes carefully - they're valuable learning opportunities. Would you like me to help you find practice resources for your specific course?";
            break;
        case 'Quick Concept Reviews':
            response = "Quick reviews should focus on core concepts. Try creating flashcards for key terms, formulas, or definitions. The ideal time for quick reviews is just before sleep and first thing in the morning. What specific concepts would you like to review?";
            break;
        case 'Test-Taking Strategies':
            response = "During the exam, read all questions first and allocate time based on point values. For multiple choice, eliminate obviously wrong answers first. For essays, spend a few minutes outlining before writing. If you get stuck, mark the question and move on - return to it later with fresh perspective. Would you like specific strategies for your exam format?";
            break;
        default:
            response = "That's an interesting topic to explore. What specific questions do you have about it?";
    }
    
    addAIMessage(response);
}

function sendMessage() {
    const messageInput = document.getElementById('user-message');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
        <div class="user-message">
            <div class="message-avatar"><i class="fas fa-user"></i></div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Generate AI response
    setTimeout(() => {
        const storedExams = JSON.parse(sessionStorage.getItem('calendar')) || [];
        let response = '';
        
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            response = "Hello! I'm your AI Study Companion. How can I help with your exam preparation today?";
        } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('how')) {
            response = "I can help in several ways: explaining difficult concepts, creating practice questions, organizing study plans, or providing exam strategy tips. What would you like assistance with?";
        } else if (message.toLowerCase().includes('exam') || message.toLowerCase().includes('test')) {
            if (storedExams.length > 0) {
                const exam = storedExams[0];
                response = `For your upcoming ${exam.course} exam on ${exam.exam_start_time}, I recommend focusing on creating a structured study plan. Would you like me to generate a customized study schedule?`;
            } else {
                response = "Exam preparation is crucial. I recommend starting at least 2-3 weeks before your exam date. Have you added any exams to your calendar yet? This will help me provide more tailored advice.";
            }
        } else if (message.toLowerCase().includes('concept') || message.toLowerCase().includes('understand')) {
            response = "Understanding core concepts is essential. I recommend creating visual representations of complex ideas, teaching concepts to others (even imaginary students), and relating new information to things you already know. Which specific concept are you struggling with?";
        } else if (message.toLowerCase().includes('stress') || message.toLowerCase().includes('anxiety')) {
            response = "Exam anxiety is normal. Try these techniques: deep breathing exercises, progressive muscle relaxation, positive self-talk, and visualization of success. Remember that proper preparation significantly reduces anxiety. Would you like more specific stress-management strategies?";
        } else if (message.toLowerCase().includes('practice') || message.toLowerCase().includes('problem')) {
            response = "Practice problems are vital for retention and understanding. Start with simpler problems to build confidence, then gradually increase difficulty. Analyze your mistakes carefully - they're valuable learning opportunities. Would you like me to generate some practice questions?";
        } else {
            // Generic response
            const genericResponses = [
                "That's an interesting question. Let me help you explore this topic further. Can you provide more details about what you're looking for?",
                "I can assist with that. To give you the most helpful response, could you tell me which course this relates to?",
                "I understand what you're asking. To better support your learning, could you share what you already know about this topic?",
                "Great question! I'm here to help you master this material. Let's break this down step by step.",
                "I'd be happy to help with that. This is an important topic for your exam preparation. Let's focus on the key aspects."
            ];
            
            response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
        }
        
        addAIMessage(response);
    }, 1000);
}

function addAIMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
        <div class="ai-message">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Navigation function for AI features
function navigateToPage(pageId) {
    // Remove active class from all links and pages
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Find the link for this page and make it active
    const navLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Show the page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
}

// Initialize AI features when the dom is loaded
document.addEventListener('DOMContentLoaded', function() {
    initStudyCompanion();
});

// Make functions globally available
window.addToCalendar = addToCalendar;
window.removeFromCalendar = removeFromCalendar;
window.performSearch = performSearch;
window.performHistoricalSearch = performHistoricalSearch;
window.testDirectFetch = testDirectFetch;
window.predictDifficulty = predictDifficulty;
window.loadKnowledgeGraph = loadKnowledgeGraph;
window.showNodeInfo = showNodeInfo;
window.selectCourse = selectCourse;
window.selectTopic = selectTopic;
window.sendMessage = sendMessage;
window.navigateToPage = navigateToPage;