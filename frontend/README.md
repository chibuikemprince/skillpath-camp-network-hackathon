# SkillPath Frontend

Modern React application for AI-powered personalized learning experiences. Built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern React**: React 18 with hooks and functional components
- **TypeScript**: Full type safety and IntelliSense support
- **Fast Development**: Vite for lightning-fast HMR and builds
- **State Management**: React Query for server state management
- **Form Handling**: React Hook Form with validation
- **Routing**: React Router v6 with protected routes
- **Authentication**: JWT-based auth with local storage
- **UI Components**: Custom components with Lucide React icons

## 🛠 Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route-based page components
├── services/      # API calls and external services
├── types/         # TypeScript type definitions
├── utils/         # Helper functions and utilities
├── App.tsx        # Main application component
├── main.tsx       # Application entry point
└── index.css      # Global styles and Tailwind imports
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running (see backend README)

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
REACT_APP_API_URL=http://localhost:3000/api
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 🎨 UI Components

### Layout Components
- **Layout**: Main application layout with navigation
- **Navigation**: Header with user info and logout
- **Protected Routes**: Authentication-based route guards

### Page Components
- **Login**: User authentication form
- **Register**: User registration with learning profile
- **Dashboard**: Progress overview and curriculum display
- **WeekView**: Weekly learning plan with topics and resources
- **LessonView**: Interactive lesson with quiz functionality

### Form Components
- **Validation**: Real-time form validation with error messages
- **Input Types**: Text, email, password, select, radio inputs
- **Responsive**: Mobile-friendly form layouts

## 🔐 Authentication Flow

### Registration Process
1. User fills registration form with learning preferences
2. Form validation ensures data quality
3. API call creates user account
4. JWT token stored in localStorage
5. User redirected to dashboard

### Login Process
1. User enters email and password
2. Credentials validated on frontend
3. API authentication request
4. JWT token stored and user redirected
5. Protected routes become accessible

### Route Protection
```typescript
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};
```

## 📱 Responsive Design

### Breakpoints (Tailwind CSS)
- **Mobile**: Default (< 640px)
- **Tablet**: sm (640px+)
- **Desktop**: lg (1024px+)
- **Large**: xl (1280px+)

### Mobile-First Approach
- Touch-friendly interface
- Optimized navigation
- Readable typography
- Accessible form controls

## 🎯 User Experience

### Learning Dashboard
- Progress visualization with percentages
- Current week highlighting
- Quick access to continue learning
- Curriculum overview with modules

### Interactive Lessons
- Structured content with examples
- Practice tasks and exercises
- Immediate quiz feedback
- Progress tracking integration

### Resource Discovery
- Categorized learning materials
- Difficulty level indicators
- External link handling
- Completion tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:3000/api` |

### Vite Configuration
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000')
  }
})
```

### Tailwind Configuration
```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

## 🌐 API Integration

### Service Layer
```typescript
// API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Services
- **authAPI**: Registration and login
- **curriculumAPI**: Curriculum management
- **lessonsAPI**: Lesson and quiz operations
- **resourcesAPI**: Resources and portfolio

### Error Handling
```typescript
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error) {
  console.error('API Error:', error);
  throw new Error(error.response?.data?.error || 'Request failed');
}
```

## 🎨 Styling Guide

### Tailwind CSS Classes
```css
/* Primary buttons */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md;
}

/* Form inputs */
.form-input {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500;
}

/* Cards */
.card {
  @apply bg-white shadow rounded-lg p-6;
}
```

### Color Palette
- **Primary**: Blue shades for main actions
- **Gray**: Neutral colors for text and backgrounds
- **Success**: Green for positive feedback
- **Error**: Red for error states
- **Warning**: Yellow for warnings

## 🧪 Testing

### Component Testing
```bash
# Run tests (when implemented)
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Testing
```bash
# Cypress tests (when implemented)
npm run cypress:open
npm run cypress:run
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Environment variables in Netlify dashboard:
# REACT_APP_API_URL=https://your-api-domain.com/api
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Environment variables in Vercel dashboard
```

#### AWS S3 + CloudFront
```bash
# Build and sync to S3
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### GitHub Pages
```bash
# Install gh-pages
npm install -g gh-pages

# Deploy
npm run build
gh-pages -d dist
```

### Environment Configuration

#### Development
```env
REACT_APP_API_URL=http://localhost:3000/api
```

#### Production
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🔧 Development

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Consistent component structure

### Component Structure
```typescript
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="component-styles">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### Adding New Features

1. **Components**: Create in `src/components/`
2. **Pages**: Add to `src/pages/` and update routing
3. **Services**: API calls in `src/services/`
4. **Types**: TypeScript interfaces in `src/types/`
5. **Utils**: Helper functions in `src/utils/`

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

#### API Connection Issues
- Verify `REACT_APP_API_URL` is set correctly
- Check if backend server is running
- Inspect browser network tab for failed requests
- Verify CORS configuration on backend

#### Authentication Issues
- Check localStorage for token
- Verify token format and expiration
- Test login flow in browser dev tools

### Debug Mode
```bash
# Enable verbose logging
REACT_APP_DEBUG=true npm run dev
```

## 📊 Performance

### Optimization Tips
- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize images and assets
- Use React Query for caching
- Minimize bundle size

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Performance Monitoring
- Use React DevTools Profiler
- Monitor Core Web Vitals
- Implement error boundaries
- Track user interactions

## 🎯 Accessibility

### WCAG Compliance
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

### Implementation
```typescript
// Accessible button
<button
  aria-label="Submit quiz answers"
  className="btn-primary"
  disabled={loading}
>
  {loading ? 'Submitting...' : 'Submit'}
</button>

// Form accessibility
<label htmlFor="email" className="sr-only">
  Email Address
</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  className="form-input"
/>
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow component structure guidelines
4. Add TypeScript types for new features
5. Test responsive design
6. Submit pull request

### Development Guidelines
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow Tailwind CSS conventions
- Add loading and error states
- Ensure mobile responsiveness

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- Check browser console for errors
- Verify API connectivity
- Test with different screen sizes
- Review network requests in dev tools
- Check localStorage for authentication data