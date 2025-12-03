# SkillPath Deployment Guide

## Separate Server Deployment

This guide covers deploying the backend and frontend on separate servers.

## Backend Deployment

### 1. Prepare Backend
```bash
cd backend
npm install
npm run build
```

### 2. Environment Variables
Create `.env` file:
```env
PORT=3000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# AI Configuration
AI_MODEL_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL_API_KEY=your-openai-api-key
AI_MODEL_NAME=gpt-3.5-turbo
```

### 3. Start Backend Server
```bash
npm start
```

### 4. Backend Deployment Options

#### Option A: AWS EC2
```bash
# Install Node.js and PM2
sudo apt update
sudo apt install nodejs npm
npm install -g pm2

# Deploy and start
pm2 start dist/server.js --name "skillpath-backend"
pm2 startup
pm2 save
```

#### Option B: Heroku
```bash
# Install Heroku CLI and login
heroku create skillpath-backend
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
git push heroku main
```

#### Option C: Railway/Render
- Connect your GitHub repository
- Set environment variables in dashboard
- Deploy automatically

## Frontend Deployment

### 1. Prepare Frontend
```bash
cd frontend
```

### 2. Environment Variables
Create `.env` file:
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### 3. Build Frontend
```bash
npm install
npm run build
```

### 4. Frontend Deployment Options

#### Option A: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option B: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option C: AWS S3 + CloudFront
```bash
# Build and upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### Option D: GitHub Pages
```bash
# Install gh-pages
npm install -g gh-pages

# Deploy
gh-pages -d dist
```

## Development with Separate Servers

### 1. Start Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
npm run dev
```

### 2. Start Frontend (separate terminal)
```bash
cd frontend
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:3000/api
npm run dev
```

### 3. Access Applications
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

## Production Configuration

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillpath
JWT_SECRET=super-secure-random-string-change-this
NODE_ENV=production
FRONTEND_URL=https://skillpath-frontend.netlify.app

AI_MODEL_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL_API_KEY=sk-your-production-api-key
AI_MODEL_NAME=gpt-3.5-turbo
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://skillpath-backend.herokuapp.com/api
```

## CORS Configuration

The backend is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable.

For multiple frontend domains:
```javascript
// In backend/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://skillpath.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## Health Checks

### Backend Health Check
```bash
curl https://your-backend-domain.com/health
```

### Frontend Health Check
- Visit your frontend URL
- Check browser console for API connection errors

## Monitoring

### Backend Monitoring
```bash
# Using PM2
pm2 monit

# Check logs
pm2 logs skillpath-backend
```

### Frontend Monitoring
- Use your hosting provider's analytics
- Monitor browser console errors
- Set up error tracking (Sentry, LogRocket)

## Scaling

### Backend Scaling
- Use load balancers (AWS ALB, Nginx)
- Implement horizontal scaling with PM2 cluster mode
- Use database connection pooling

### Frontend Scaling
- CDN distribution (CloudFront, Cloudflare)
- Static asset optimization
- Code splitting and lazy loading

## Security Checklist

- [ ] HTTPS enabled on both servers
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] JWT secret is strong and unique
- [ ] Database connection secured
- [ ] API rate limiting implemented
- [ ] Input validation enabled
- [ ] Error messages don't expose sensitive info

## Troubleshooting

### CORS Issues
- Verify `FRONTEND_URL` in backend `.env`
- Check browser network tab for preflight requests
- Ensure credentials are handled correctly

### API Connection Issues
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check if backend server is accessible
- Verify API endpoints are working

### Build Issues
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify environment variables are set

This setup allows you to deploy and scale your backend and frontend independently!