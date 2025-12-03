# SkillPath API Documentation

## Overview

SkillPath is an AI-powered learning companion that generates personalized curricula, lessons, quizzes, and blockchain-verified certificates. This API provides endpoints for user management, curriculum generation, learning progress tracking, and certificate issuance.

**Base URL**: `http://localhost:3000/api`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

## Authentication

### Register User
**POST** `/auth/register`

Create a new user account with learning profile.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "profile": {
    "targetSkill": "React Development",
    "currentLevel": "beginner|intermediate|advanced",
    "timePerWeek": 10,
    "goalType": "job-ready|exam|hobby|other",
    "preferredStyle": "text|video|mixed"
  }
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "profile": { ... }
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "profile": { ... }
  }
}
```

## Curriculum Management

### Generate Curriculum
**POST** `/curriculum`

Generate AI-powered personalized curriculum based on user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Curriculum created successfully",
  "curriculum": {
    "_id": "curriculum_id",
    "userId": "user_id",
    "skill": "React Development",
    "modules": [
      {
        "id": "module-1",
        "title": "React Fundamentals",
        "description": "Core React concepts",
        "estimatedWeeks": 3,
        "topics": [
          {
            "id": "topic-1",
            "title": "Components",
            "description": "React components basics",
            "difficulty": "beginner",
            "subtopics": [
              {
                "id": "subtopic-1",
                "title": "Functional Components",
                "description": "Creating functional components",
                "estimatedHours": 2
              }
            ]
          }
        ]
      }
    ],
    "weeklyRoadmap": [
      {
        "week": 1,
        "topics": ["topic-1"],
        "estimatedHours": 8,
        "goals": ["Learn React components"]
      }
    ]
  }
}
```

### Get User Curriculum
**GET** `/curriculum`

Retrieve user's current curriculum.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "curriculum": { ... }
}
```

### Get Weekly Plan
**GET** `/curriculum/week/:week`

Get detailed learning plan for a specific week.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "weeklyPlan": {
    "week": 1,
    "topics": ["topic-1"],
    "estimatedHours": 8,
    "goals": ["Learn React components"],
    "topicDetails": [
      {
        "id": "topic-1",
        "title": "Components",
        "description": "React components basics",
        "difficulty": "beginner",
        "subtopics": [ ... ]
      }
    ]
  }
}
```

### Get Progress Dashboard
**GET** `/curriculum/dashboard`

Get user's learning progress and statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "dashboard": {
    "overallProgress": 25,
    "currentWeek": 2,
    "completedLessons": 5,
    "completedQuizzes": 3,
    "completedWeeks": [1],
    "totalWeeks": 8,
    "masteryScores": {
      "topic-1": 85
    },
    "weeklyRoadmap": [ ... ]
  }
}
```

### Complete Week
**POST** `/curriculum/week/:week/complete`

Mark a week as completed (requires all lessons passed with 50%+).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Week marked as completed"
}
```

### Get Week Status
**GET** `/curriculum/week/:week/status`

Check if a specific week is completed.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "isCompleted": true
}
```

## Lessons & Quizzes

### Generate Lesson for Subtopic
**POST** `/lessons/subtopic/:subtopicId/:curriculumId`

Generate AI lesson content for a specific subtopic.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "subtopic": {
    "title": "Functional Components",
    "description": "Creating functional components in React"
  }
}
```

**Response (200):**
```json
{
  "lesson": {
    "_id": "lesson_id",
    "subtopicId": "subtopic-1",
    "title": "Introduction to Functional Components",
    "objective": "Learn to create and use functional components",
    "content": "Detailed lesson content...",
    "examples": [
      "Example 1: Basic functional component",
      "Example 2: Component with props"
    ],
    "practiceTask": "Create your first functional component"
  }
}
```

### Get Lesson Content
**GET** `/lessons/:lessonId`

Retrieve lesson content by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "lesson": { ... }
}
```

### Get Lesson Quiz
**GET** `/lessons/:lessonId/quiz`

Get quiz questions for a lesson.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "quiz": {
    "_id": "quiz_id",
    "lessonId": "lesson_id",
    "questions": [
      {
        "id": "q1",
        "text": "What is a functional component?",
        "options": [
          "A function that returns JSX",
          "A class component",
          "A React hook",
          "A state variable"
        ]
      }
    ]
  }
}
```

### Submit Quiz Answers
**POST** `/lessons/quiz/:quizId/submit`

Submit quiz answers and receive score with explanations.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "answers": [0, 1, 2, 0, 1]
}
```

**Response (200):**
```json
{
  "score": 80,
  "results": [
    {
      "questionId": "q1",
      "userAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "explanation": "Correct! A functional component is indeed a function that returns JSX."
    }
  ],
  "message": "Great job!"
}
```

## Resources & Projects

### Get Topic Resources
**GET** `/resources/topics/:topicId/:curriculumId`

Get curated learning resources for a specific topic.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "resources": [
    {
      "_id": "resource_id",
      "topicId": "topic-1",
      "type": "book|course|article|video",
      "title": "React Documentation",
      "authorOrSource": "React Team",
      "url": "https://reactjs.org/docs",
      "level": "beginner",
      "estimatedTime": "2 hours",
      "reason": "Official documentation with comprehensive examples",
      "description": "Complete guide to React fundamentals"
    }
  ]
}
```

### Get Module Projects
**GET** `/resources/modules/:moduleId/:curriculumId/projects`

Get project suggestions for a module.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "projects": [
    {
      "_id": "project_id",
      "moduleId": "module-1",
      "title": "Todo App",
      "description": "Build a todo application using React",
      "requirements": [
        "Add/remove todos",
        "Mark as complete",
        "Filter todos"
      ],
      "techStack": ["React", "CSS", "Local Storage"],
      "skillsDemonstrated": [
        "Component creation",
        "State management",
        "Event handling"
      ],
      "difficulty": "beginner"
    }
  ]
}
```

### Mark Resource Completed
**POST** `/resources/:resourceId/complete`

Mark a learning resource as completed.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Resource marked as completed"
}
```

### Mark Project Completed
**POST** `/resources/projects/:projectId/complete`

Mark a project as completed.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Project marked as completed"
}
```

### Get User Portfolio
**GET** `/resources/portfolio`

Get user's completed projects and achievements.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "portfolio": {
    "completedProjects": [ ... ],
    "achievements": [ ... ],
    "skillsAcquired": [ ... ]
  }
}
```

## Blockchain Certificates

### Check Certificate Eligibility
**GET** `/certificates/eligibility?curriculumId=<curriculum_id>`

Check if user is eligible for blockchain certificate.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `curriculumId` (required): Curriculum ID to check eligibility for

**Response (200):**
```json
{
  "eligible": true,
  "hasPaid": false,
  "completedAllModules": true,
  "allTestsPassed": true,
  "minScore": 75,
  "requiredMinScore": 50,
  "reason": "Complete all modules and pass all tests with at least 50%"
}
```

### Confirm Certificate Payment
**POST** `/certificates/payment-confirmed`

Record payment transaction for certificate (0.01 ETH).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "curriculumId": "curriculum_id",
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "paymentTxHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Response (200):**
```json
{
  "message": "Payment recorded successfully"
}
```

### Request Certificate Mint
**POST** `/certificates/request-mint`

Get certificate metadata for blockchain minting (requires payment).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "curriculumId": "curriculum_id",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response (200):**
```json
{
  "canMint": true,
  "metadata": {
    "name": "SkillPath: React Development Certificate",
    "description": "Certificate issued to user@example.com for completing React Development on SkillPath.",
    "attributes": {
      "skill": "React Development",
      "curriculumId": "curriculum_id",
      "userId": "user_id",
      "userDisplayName": "user@example.com",
      "level": "beginner",
      "completionDate": "2024-01-15T10:30:00.000Z",
      "minScore": 75,
      "totalModules": 3,
      "passedModules": 3
    }
  }
}
```

**Response (400) - Not Eligible:**
```json
{
  "canMint": false,
  "reason": "Not paid"
}
```

### Record Certificate Mint
**POST** `/certificates/minted`

Record successful certificate minting on blockchain.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "curriculumId": "curriculum_id",
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "tokenId": "12345",
  "mintTxHash": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
}
```

**Response (200):**
```json
{
  "message": "Certificate mint recorded successfully"
}
```

## Health Check

### API Health Status
**GET** `/health`

Check if the API server is running and healthy.

**Response (200):**
```json
{
  "status": "OK",
  "message": "SkillPath API is running"
}
```

## Error Responses

### Common Error Formats

**400 Bad Request:**
```json
{
  "error": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Something went wrong!"
}
```

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **AI generation endpoints**: 10 requests per minute per user
- **General endpoints**: 100 requests per minute per user

## Certificate Business Logic

### Eligibility Requirements
1. **Complete all modules** in the curriculum
2. **Pass all quizzes** with minimum 50% score each
3. **System automatically tracks** progress and updates eligibility

### Payment Flow
1. User connects Web3 wallet (MetaMask, etc.)
2. User pays 0.01 ETH to smart contract
3. Frontend calls `/certificates/payment-confirmed` with transaction hash
4. Backend verifies eligibility and records payment

### Minting Flow
1. User requests mint via `/certificates/request-mint`
2. Backend generates certificate metadata
3. Frontend mints NFT certificate on Camp Network
4. Frontend calls `/certificates/minted` with token details
5. Backend records successful mint

### Anti-Fraud Measures
- One certificate per user per curriculum
- Payment verification before minting
- Eligibility re-checked at each step
- Wallet address tied to certificate

## Development Notes

### AI Integration
- Uses configurable LLM API (OpenAI compatible)
- Fallback responses when AI service unavailable
- Structured prompts for consistent content generation

### Database Design
- MongoDB with Mongoose ODM
- Indexed queries for performance
- Embedded documents for curriculum structure
- Progress tracking with timestamps

### Security Features
- JWT authentication with expiration
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Error message sanitization