# ASU Exam Scheduler with AI Features

A comprehensive exam scheduling and study planning application designed for ASU. This application helps students search for exams, create personal calendars, explore historical exam data, and leverage AI features to optimize their study approach.

## Overview

The ASU Exam Scheduler is built with a two-tier architecture:

1. **Spring Boot Backend:** RESTful API for exam data management and AI model integration
2. **Simplified Frontend:** Responsive and accessible interface built with HTML, CSS, and JavaScript

<!-- Note: The screenshot will be available after you upload the project to GitHub -->
<!-- For now, we'll use a text description -->
[Screenshot of ASU Exam Scheduler with AI features dashboard]

## Advanced AI Features

The application includes several cutting-edge AI features designed to enhance the educational experience:

### 1. Personalized Study Plan Generator
- Creates adaptive study schedules based on your selected exams
- Customizes plans based on learning preferences, available time, and exam proximity
- Generates week-by-week schedules with topic-specific recommendations

### 2. Exam Difficulty Predictor & Time Allocator
- Analyzes historical exam data to predict difficulty levels
- Provides detailed study time recommendations for specific topics
- Offers visual difficulty indicators and comparative metrics

### 3. Knowledge Graph Navigation
- Visualizes course relationships, prerequisites, and dependencies
- Helps identify knowledge gaps and critical learning paths
- Interactive interface for exploring course connections

### 4. AI Study Companion
- Personalized AI tutor powered by Claude/Anthropic models
- Provides customized study advice based on your courses
- Offers detailed guidance on study techniques, stress management, and exam preparation

## Simplified Frontend

A lightweight alternative frontend implementation is available in the `/simplified` directory. This version:

- Uses vanilla HTML, CSS, and JavaScript (no framework dependencies)
- Includes all the original features of the React application
- Provides fallback mock data for demonstration when the backend is unavailable
- Features improved debugging tools and error handling

## Getting Started

### Running the Simplified Frontend

1. Navigate to the simplified directory:
```bash
cd "Frontend (ReactJS)/simplified"
```

2. Serve with any simple HTTP server:
```bash
# Using Python
python -m http.server 3000

# OR using npx serve
npx serve
```

3. Access in your browser at http://localhost:3000 or the port specified by your server

### Backend Setup

1. Navigate to the Spring Boot project:
```bash
cd "Backend (SpringBoot)/exam-scheduler"
```

2. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

3. The backend API will be available at http://localhost:8080

## API Endpoints

- `/api/v1/exam` - Search and manage current exams
- `/api/v1/historic-exams/historic` - Access historical exam data
- `/api/v1/ai/study-plan` - Generate AI-powered study plans

## Development Notes

- The simplified frontend includes fallback mock data when the backend is unavailable
- CORS settings in the backend allow connections from various origins
- The application structure follows a modular design for easy extension

## Technologies Used

- **Backend:** Spring Boot, Java, JPA/Hibernate, H2/PostgreSQL
- **Frontend:** HTML, CSS, JavaScript 
- **AI Integration:** Amazon Bedrock-ready, Claude model integration capability

## Contributing

Contributions are welcome! If you'd like to enhance this project or report issues, please submit a pull request or open an issue.

## License

This project is licensed under the MIT License.
