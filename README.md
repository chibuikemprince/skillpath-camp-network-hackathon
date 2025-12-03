# SkillPath - AI Curriculum & Learning Companion

**AWS Global Vibe: AI Coding Hackathon 2025**
SkillPath is an agentic AI learning companion that autonomously plans, generates, and adapts a personalized multi-week curriculum based on the learner’s goals, progress, and performance.

SkillPath is an AI-powered web application that transforms any learning goal into a personalized, structured learning journey. Built with Node.js + TypeScript backend and React frontend, it leverages AI to generate curricula, lessons, quizzes, and resource recommendations.

## 🚀 Features

- **AI-Generated Curricula**: Turn any skill into a structured learning path
- **Personalized Learning**: Adapts to your level, time availability, and goals
- **Interactive Lessons**: AI-generated content with examples and practice tasks
- **Smart Quizzes**: Automated quiz generation and grading
- **Resource Recommendations**: Curated books, courses, articles, and videos
- **Progress Tracking**: Dashboard with completion metrics and mastery scores
- **Project Suggestions**: Portfolio-worthy projects for each module

## 🛠 Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcryptjs** for password hashing
- **AI Integration** (configurable LLM API)

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for state management
- **React Hook Form** for form handling

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- AI API key (OpenAI or compatible service)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd SkillPath
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your MongoDB URI and AI API key

# Start the backend
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start the frontend
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/skillpath
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development

# AI Model Configuration
AI_MODEL_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL_API_KEY=your-api-key-here
AI_MODEL_NAME=gpt-3.5-turbo
```

## 📖 User Journey

1. **Registration**: User creates account with learning preferences
2. **Curriculum Generation**: AI creates personalized learning path
3. **Weekly Learning**: Structured weekly plans with topics and goals
4. **Interactive Lessons**: AI-generated content with examples
5. **Knowledge Checks**: Automated quizzes with instant feedback
6. **Resource Discovery**: Curated learning materials
7. **Progress Tracking**: Dashboard showing completion and mastery

## 🏗 Architecture

### Backend Structure
```
src/
├── controllers/     # Request handlers
├── models/         # MongoDB schemas
├── routes/         # API endpoints
├── services/       # Business logic
├── middleware/     # Auth and validation
├── types/          # TypeScript interfaces
└── db/            # Database connection
```

### Frontend Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── services/      # API calls
├── types/         # TypeScript interfaces
├── utils/         # Helper functions
└── App.tsx        # Main application
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Curriculum
- `POST /api/curriculum` - Generate curriculum
- `GET /api/curriculum` - Get user's curriculum
- `GET /api/curriculum/week/:week` - Get weekly plan
- `GET /api/curriculum/dashboard` - Get progress dashboard

### Lessons
- `POST /api/lessons/subtopic/:subtopicId` - Generate lesson
- `GET /api/lessons/:lessonId` - Get lesson content
- `GET /api/lessons/:lessonId/quiz` - Get lesson quiz
- `POST /api/lessons/quiz/:quizId/submit` - Submit quiz answers

### Resources
- `GET /api/resources/topics/:topicId` - Get topic resources
- `GET /api/resources/modules/:moduleId/projects` - Get module projects
- `POST /api/resources/:resourceId/complete` - Mark resource completed
- `GET /api/resources/portfolio` - Get user portfolio

## 🤖 AI Integration

The system uses a configurable LLM service that can work with:
- OpenAI GPT models
- Other compatible chat completion APIs
- Includes fallback responses for reliability

### AI-Generated Content
- **Curricula**: Structured learning paths with modules and topics
- **Lessons**: Detailed explanations with examples and practice tasks
- **Quizzes**: Multiple-choice questions with explanations
- **Resources**: Curated recommendations with reasoning
- **Projects**: Portfolio-worthy project ideas

## 🧪 Development with Amazon Q Developer

This project was built using **Amazon Q Developer** to:
- Generate TypeScript boilerplate and interfaces
- Create API endpoints and controllers
- Design database schemas and models
- Build React components and pages
- Implement authentication and routing
- Generate comprehensive documentation

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS protection
- Environment variable configuration

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (AWS, Heroku, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `dist` folder to a static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Hackathon Submission

**SkillPath** demonstrates:
- Full-stack TypeScript development
- AI integration for content generation
- Modern React patterns and hooks
- RESTful API design
- Database modeling and relationships
- User authentication and authorization
- Responsive web design
- Comprehensive documentation

Built for the **AWS Global Vibe: AI Coding Hackathon 2025** to showcase how AI can revolutionize personalized learning experiences.