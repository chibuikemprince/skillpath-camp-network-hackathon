# SkillPath Backend API

AI-powered curriculum and learning companion backend built with Node.js, TypeScript, and MongoDB.

## 🚀 Features

- **AI-Powered Content Generation**: Curriculum, lessons, quizzes, and resources
- **User Authentication**: JWT-based auth with bcrypt password hashing
- **RESTful API**: Clean, documented endpoints following REST principles
- **MongoDB Integration**: Flexible document-based data storage
- **TypeScript**: Full type safety and modern JavaScript features
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Graceful error responses and logging
- **CORS Support**: Configurable cross-origin resource sharing

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **AI Integration**: Configurable LLM API (OpenAI compatible)

## 📁 Project Structure

```
src/
├── controllers/     # Request handlers and business logic
├── models/         # MongoDB schemas and data models
├── routes/         # API endpoint definitions
├── services/       # External services (AI, email, etc.)
├── middleware/     # Authentication, validation, error handling
├── types/          # TypeScript type definitions
├── db/            # Database connection and configuration
└── server.ts      # Application entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- AI API key (OpenAI or compatible)

### Installation
```bash
npm install
```

### Configuration
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/skillpath
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# AI Configuration
AI_MODEL_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL_API_KEY=your-openai-api-key
AI_MODEL_NAME=gpt-3.5-turbo
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

#### Curriculum Management
- `POST /curriculum` - Generate AI curriculum
- `GET /curriculum` - Get user curriculum
- `GET /curriculum/week/:week` - Get weekly plan
- `GET /curriculum/dashboard` - Get progress dashboard

#### Lessons & Quizzes
- `POST /lessons/subtopic/:subtopicId` - Generate lesson
- `GET /lessons/:lessonId` - Get lesson content
- `GET /lessons/:lessonId/quiz` - Get lesson quiz
- `POST /lessons/quiz/:quizId/submit` - Submit quiz answers

#### Resources & Projects
- `GET /resources/topics/:topicId` - Get topic resources
- `GET /resources/modules/:moduleId/projects` - Get module projects
- `POST /resources/:resourceId/complete` - Mark resource completed
- `POST /resources/projects/:projectId/complete` - Mark project completed
- `GET /resources/portfolio` - Get user portfolio

#### Health Check
- `GET /health` - API health status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/skillpath` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3001` |
| `AI_MODEL_API_URL` | AI API endpoint | OpenAI URL |
| `AI_MODEL_API_KEY` | AI API key | Required |
| `AI_MODEL_NAME` | AI model name | `gpt-3.5-turbo` |

### Database Models

#### User
- Email, password, learning profile
- Preferences: skill, level, time commitment, goals

#### Curriculum
- AI-generated learning path
- Modules, topics, subtopics
- Weekly roadmap with goals

#### Lesson
- AI-generated content
- Objectives, examples, practice tasks
- Linked to curriculum subtopics

#### Quiz
- Multiple-choice questions
- Explanations and scoring
- Progress tracking

#### Resource
- Curated learning materials
- Books, courses, articles, videos
- Difficulty levels and recommendations

#### Progress
- Learning activity tracking
- Completion status
- Mastery scores

## 🤖 AI Integration

### LLM Service
The `llmService` handles all AI interactions:

```typescript
// Generate curriculum
const curriculum = await llmService.generateCurriculum(skill, level, timePerWeek);

// Create lesson content
const lesson = await llmService.generateLesson(subtopic, skill, level);

// Generate quiz questions
const questions = await llmService.generateQuiz(lessonTitle, content);

// Recommend resources
const resources = await llmService.generateResources(topic, skill, level);
```

### Fallback Responses
Built-in fallback content when AI service is unavailable:
- Default curriculum structures
- Template lessons
- Sample quiz questions
- Basic resource recommendations

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: express-validator middleware
- **CORS Protection**: Configurable origin restrictions
- **Error Sanitization**: No sensitive data in error responses
- **Rate Limiting**: (Recommended for production)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test coverage
npm run test:coverage
```

## 📊 Monitoring & Logging

### Health Check
```bash
curl http://localhost:3000/health
```

### Logs
- Server startup and configuration
- Database connection status
- API request/response logging
- Error tracking and stack traces
- AI service call monitoring

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production MongoDB URI
- Set appropriate `FRONTEND_URL`

### Deployment Options

#### Heroku
```bash
heroku create skillpath-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

#### AWS EC2
```bash
# Install Node.js and PM2
npm install -g pm2
pm2 start dist/server.js --name "skillpath-api"
pm2 startup
pm2 save
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## 🔧 Development

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Consistent naming conventions

### Adding New Features

1. **Models**: Define in `src/models/`
2. **Routes**: Add to `src/routes/`
3. **Controllers**: Implement in `src/controllers/`
4. **Services**: Business logic in `src/services/`
5. **Types**: TypeScript interfaces in `src/types/`

### Database Migrations
```bash
# Connect to MongoDB
mongo skillpath

# Run custom migration scripts
node scripts/migrate.js
```

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection
```bash
# Check MongoDB status
brew services list | grep mongodb
sudo systemctl status mongod

# Test connection
mongo --eval "db.adminCommand('ismaster')"
```

#### JWT Issues
- Verify `JWT_SECRET` is set
- Check token expiration
- Validate Authorization header format

#### AI API Issues
- Verify API key is valid
- Check API quota/limits
- Test with curl:
```bash
curl -H "Authorization: Bearer $AI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"test"}]}' \
     https://api.openai.com/v1/chat/completions
```

### Debug Mode
```bash
DEBUG=* npm run dev
```

## 📈 Performance

### Optimization Tips
- Use MongoDB indexes for frequent queries
- Implement caching for AI responses
- Add request rate limiting
- Optimize database queries
- Use connection pooling

### Monitoring
- Track API response times
- Monitor database performance
- Log AI service usage
- Set up health checks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Maintain API compatibility
- Use semantic commit messages

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- Check the main project README
- Review API documentation
- Test endpoints with Postman collection
- Check server logs for errors
- Verify environment configuration