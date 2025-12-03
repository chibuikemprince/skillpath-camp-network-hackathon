# SkillPath Setup Guide

## Prerequisites

Before setting up SkillPath, ensure you have:

1. **Node.js 18+** installed
2. **MongoDB** running (local or cloud)
3. **AI API Key** (OpenAI or compatible service)
4. **Git** for version control

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd SkillPath
```

### 2. Install Dependencies
```bash
# Install all dependencies for both backend and frontend
npm run install-all
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get connection string

### 4. Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/skillpath  # or your Atlas URI
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development

# AI Configuration
AI_MODEL_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL_API_KEY=sk-your-openai-api-key-here
AI_MODEL_NAME=gpt-3.5-turbo
```

### 5. Frontend Configuration
```bash
cd frontend
cp .env.example .env
```

Edit frontend `.env` file:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### 6. Start Development Servers Separately

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

#### Or use root scripts:
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

### 7. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Testing the Setup

1. **Backend Health Check**:
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"OK","message":"SkillPath API is running"}`

2. **Frontend Access**:
   - Open http://localhost:3001
   - You should see the SkillPath login page

3. **Create Test Account**:
   - Click "Create new account"
   - Fill in the registration form
   - Submit to test the full flow

## Common Issues & Solutions

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod

# Start MongoDB (Windows)
net start MongoDB
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### AI API Issues
- Verify your API key is correct
- Check your OpenAI account has credits
- Ensure the API URL is correct
- Test with a simple curl request:
  ```bash
  curl -H "Authorization: Bearer YOUR_API_KEY" \
       -H "Content-Type: application/json" \
       -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}' \
       https://api.openai.com/v1/chat/completions
  ```

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend TypeScript Issues
```bash
cd backend
rm -rf node_modules package-lock.json dist
npm install
npm run build
npm run dev
```

## Development Workflow

### Making Changes
1. **Backend changes**: Server auto-restarts with nodemon
2. **Frontend changes**: Hot reload with Vite
3. **Database changes**: Update models in `backend/src/models/`

### Adding New Features
1. **API Endpoints**: Add to `backend/src/routes/`
2. **Controllers**: Add to `backend/src/controllers/`
3. **Frontend Pages**: Add to `frontend/src/pages/`
4. **Components**: Add to `frontend/src/components/`

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests (if added)
cd frontend
npm test
```

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to static hosting
```

### Environment Variables for Production
- Change `JWT_SECRET` to a secure random string
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure proper CORS settings

## Troubleshooting

### Reset Everything
```bash
# Stop all servers
# Delete node_modules
rm -rf backend/node_modules frontend/node_modules
rm -rf backend/dist frontend/dist

# Reinstall
npm run install-all

# Restart
npm run dev
```

### Database Reset
```bash
# Connect to MongoDB
mongo skillpath

# Drop database
db.dropDatabase()
```

### Check Logs
```bash
# Backend logs
cd backend
npm run dev

# Frontend logs
cd frontend
npm run dev
```

## Need Help?

1. Check the main README.md for detailed documentation
2. Review the API endpoints in the backend routes
3. Check browser console for frontend errors
4. Review server logs for backend errors
5. Ensure all environment variables are set correctly

## Success Indicators

✅ Backend server starts on port 3000  
✅ Frontend server starts on port 3001  
✅ MongoDB connection successful  
✅ Can register a new user  
✅ Can generate a curriculum  
✅ Can view lessons and take quizzes  
✅ AI API calls work correctly  

Your SkillPath application should now be running successfully!