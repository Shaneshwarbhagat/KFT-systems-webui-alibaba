# KFT Management System - React Architecture Documentation

## 🏗️ React Application Architecture Overview

The KFT Management System is a comprehensive business management application built with React 18, TypeScript, and modern web technologies, focusing on accessibility, responsiveness, and user experience.

## 📋 Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Architecture Patterns](#architecture-patterns)
4. [Accessibility Implementation](#accessibility-implementation)
5. [Responsive Design Strategy](#responsive-design-strategy)
6. [Authentication & Security](#authentication--security)
7. [Color System & Design](#color-system--design)
8. [API Integration](#api-integration)
9. [State Management](#state-management)
10. [Performance Optimizations](#performance-optimizations)
11. [Error Handling](#error-handling)
12. [Development Workflow](#development-workflow)

## 🛠️ Technology Stack

### Core Framework
- **React 18** - Latest React with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **React Router DOM v6** - Client-side routing

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Roboto Font** - Professional typography from Google Fonts
- **Custom Design System** - Brand-consistent color palette

### State Management & Data Fetching
- **React Query (TanStack Query)** - Server state management
- **React Context** - Client state management
- **Axios** - HTTP client with interceptors

### Form Management
- **Formik** - Form state management
- **Yup** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Vite** - Development server and build tool

## 📁 Project Structure

\`\`\`
src/
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components (Radix-based)
│   ├── layout/                  # Layout components
│   ├── auth/                    # Authentication components
│   ├── providers/               # Context providers
│   └── error-boundary.tsx       # Error handling
├── pages/                       # Page components
│   ├── auth/                    # Authentication pages
│   │   ├── login.tsx           # Login page
│   │   ├── forgot-password.tsx # Forgot password
│   │   └── reset-password.tsx  # Reset password
│   └── dashboard/               # Dashboard pages
│       ├── dashboard.tsx        # Main dashboard
│       ├── invoices.tsx         # Invoice management
│       ├── orders.tsx           # Order management
│       ├── customers.tsx        # Customer management
│       ├── cash.tsx             # Cash management
│       ├── reports.tsx          # Reports & analytics
│       ├── admin.tsx            # Admin management
│       └── settings.tsx         # Settings
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication hook
│   ├── use-toast.ts            # Toast notifications
│   └── use-debounce.ts         # Debounced values
├── lib/                         # Utility libraries
│   ├── api.ts                  # API client and endpoints
│   └── utils.ts                # Helper functions
├── types/                       # TypeScript type definitions
├── App.tsx                      # Main app component
├── main.tsx                     # App entry point
└── index.css                    # Global styles
\`\`\`

## 🏛️ Architecture Patterns

### 1. **Component-Based Architecture**
- **Atomic Design**: Components organized from atoms to organisms
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Flexible component composition

### 2. **Provider Pattern**
- **Authentication Provider**: Manages user session and auth state
- **Query Provider**: Configures React Query client
- **Theme Provider**: Handles dark/light mode switching

### 3. **Custom Hooks Pattern**
- **useAuth**: Authentication state and methods
- **useToast**: Toast notification management
- **useDebounce**: Debounced search functionality

### 4. **Route-Based Code Splitting**
- Automatic code splitting with React Router
- Lazy loading of page components
- Optimized bundle sizes

## ♿ Accessibility Implementation

### WCAG 2.1 AA Compliance

#### 1. **Semantic HTML**
\`\`\`tsx
// Proper heading hierarchy
<h1>Dashboard</h1>
<h2>Revenue Overview</h2>
<h3>Monthly Statistics</h3>

// Semantic form structure
<form noValidate>
  <fieldset>
    <legend>Login Credentials</legend>
    <label htmlFor="email">Email Address</label>
    <input id="email" type="email" aria-describedby="email-error" />
  </fieldset>
</form>
\`\`\`

#### 2. **ARIA Labels and Descriptions**
\`\`\`tsx
// Screen reader support
<button aria-label="Show password" aria-expanded={showPassword}>
  {showPassword ? <EyeOff /> : <Eye />}
</button>

// Error announcements
<p id="email-error" role="alert" className="text-error">
  {errors.email}
</p>
\`\`\`

#### 3. **Keyboard Navigation**
- **Tab Order**: Logical tab sequence throughout the application
- **Focus Management**: Visible focus indicators on all interactive elements
- **Keyboard Shortcuts**: Standard keyboard interactions (Enter, Space, Escape)

#### 4. **Color and Contrast**
- **High Contrast**: All text meets WCAG AA contrast ratios
- **Color Independence**: Information not conveyed by color alone
- **Focus Indicators**: Clear visual focus states

#### 5. **Screen Reader Support**
- **Alternative Text**: Descriptive alt text for images
- **Live Regions**: Dynamic content announcements
- **Skip Links**: Navigation shortcuts for screen readers

### Accessibility Features

\`\`\`tsx
// Focus management
const handleSubmit = async () => {
  try {
    await login()
    // Focus management after navigation
    navigate('/dashboard')
  } catch (error) {
    // Focus error message for screen readers
    errorRef.current?.focus()
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

## 📱 Responsive Design Strategy

### Mobile-First Approach

#### 1. **Breakpoint System**
\`\`\`css
/* Tailwind CSS breakpoints */
xs: '475px',   /* Extra small devices */
sm: '640px',   /* Small devices */
md: '768px',   /* Medium devices */
lg: '1024px',  /* Large devices */
xl: '1280px',  /* Extra large devices */
2xl: '1536px'  /* 2X large devices */
\`\`\`

#### 2. **Responsive Components**
\`\`\`tsx
// Responsive grid layout
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat) => (
    <StatCard key={stat.title} {...stat} />
  ))}
</div>

// Responsive navigation
<nav className="hidden md:flex md:space-x-4">
  {/* Desktop navigation */}
</nav>
<MobileMenu className="md:hidden" />
\`\`\`

#### 3. **Flexible Layouts**
- **CSS Grid**: For complex layouts
- **Flexbox**: For component alignment
- **Container Queries**: For component-based responsiveness

#### 4. **Touch-Friendly Design**
- **Minimum Touch Targets**: 44px minimum for touch elements
- **Gesture Support**: Swipe and touch interactions
- **Hover States**: Appropriate for touch devices

### Responsive Features

\`\`\`tsx
// Responsive sidebar
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])

// Conditional rendering based on screen size
{isMobile ? <MobileSidebar /> : <DesktopSidebar />}
\`\`\`

## 🔐 Authentication & Security

### Authentication Flow

#### 1. **Login Process**
\`\`\`tsx
const login = async (email: string, password: string) => {
  try {
    const response = await authApi.login({ email, password })
    
    // Store authentication data
    localStorage.setItem('token', response.token)
    localStorage.setItem('userEmail', email)
    
    // Update auth state
    setUser(response.user)
    
    // Navigate to dashboard
    navigate('/dashboard')
  } catch (error) {
    throw new Error('Authentication failed')
  }
}
\`\`\`

#### 2. **Password Reset Flow**
\`\`\`tsx
// Forgot password
const forgotPassword = async (email: string) => {
  await authApi.forgotPassword(email)
  // Show success message
}

// Reset password with token
const resetPassword = async (token: string, password: string) => {
  await authApi.resetPassword(token, password)
  navigate('/login')
}
\`\`\`

#### 3. **Route Protection**
\`\`\`tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" />
  
  return <>{children}</>
}
\`\`\`

### Security Measures

- **JWT Token Authentication**: Secure token-based authentication
- **Automatic Token Refresh**: Seamless session management
- **Route Guards**: Protected routes require authentication
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs

## 🎨 Color System & Design

### Brand Color Palette

\`\`\`css
:root {
  /* Primary brand colors */
  --brand-primary: #243636;    /* Professional dark teal */
  --brand-secondary: #7c9982;  /* Calming sage green */
  --brand-light: #f1fced;      /* Soft mint background */
  --brand-dark: #092327;       /* Deep teal for text */
  
  /* Status colors */
  --error: #d62828;            /* Error indication */
  --success: #2c6e49;          /* Success indication */
  --warning: #ff8c42;          /* Warning indication */
  --gray-custom: #a3bac3;      /* Custom gray */
}
\`\`\`

### Color Usage Guidelines

#### 1. **Primary Actions**
- **Buttons**: Gradient from brand-primary to brand-secondary
- **Links**: brand-primary with brand-secondary hover
- **Focus States**: brand-primary outline

#### 2. **Status Indicators**
- **Success**: #2c6e49 for successful operations
- **Error**: #d62828 for error states and validation
- **Warning**: #ff8c42 for warning messages
- **Neutral**: #a3bac3 for disabled states and borders

#### 3. **Accessibility Considerations**
- **Contrast Ratios**: All combinations meet WCAG AA standards
- **Color Blindness**: Information not dependent on color alone
- **High Contrast Mode**: Support for system high contrast preferences

### Design System Components

\`\`\`tsx
// Success toast
toast({
  title: 'Success!',
  description: 'Operation completed successfully',
  className: 'bg-success/10 border-success text-success-foreground',
})

// Error state
<Input className={errors.email ? 'border-error' : 'border-gray-custom'} />

// Warning badge
<Badge variant="warning" className="bg-warning/10 border-warning text-warning-foreground">
  Warning
</Badge>
\`\`\`

## 🔌 API Integration

### API Client Configuration

\`\`\`tsx
// Environment-based API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
\`\`\`

### API Endpoints Organization

All API endpoints are organized by feature modules:

- **Authentication**: Login, logout, forgot/reset password
- **Invoices**: CRUD operations, payment status
- **Orders**: Order management and tracking
- **Customers**: Customer database management
- **Cash Management**: Cash flow tracking
- **Admin**: User management
- **Dashboard**: Analytics and reporting
- **Currency**: Exchange rate management
- **MIS**: Report generation

## 🗄️ State Management

### Server State with React Query

\`\`\`tsx
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false
        return failureCount < 3
      },
    },
  },
})

// Data fetching with caching
const { data, isLoading, error } = useQuery({
  queryKey: ['invoices', page, search],
  queryFn: () => invoiceApi.getInvoices({ page, limit: 10, search }),
})

// Mutations with optimistic updates
const createMutation = useMutation({
  mutationFn: invoiceApi.createInvoice,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    toast({ title: 'Success', description: 'Invoice created' })
  },
})
\`\`\`

### Client State with Context

\`\`\`tsx
// Authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Authentication methods
  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    setUser(response.user)
    localStorage.setItem('token', response.token)
  }

  const logout = () => {
    setUser(null)
    localStorage.clear()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
\`\`\`

## ⚡ Performance Optimizations

### Code Splitting and Lazy Loading

\`\`\`tsx
// Route-based code splitting
const DashboardPage = lazy(() => import('./pages/dashboard/dashboard'))
const InvoicesPage = lazy(() => import('./pages/dashboard/invoices'))

// Lazy loading with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/invoices" element={<InvoicesPage />} />
  </Routes>
</Suspense>
\`\`\`

### React Query Optimizations

\`\`\`tsx
// Prefetching data
const prefetchInvoices = () => {
  queryClient.prefetchQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceApi.getInvoices({ page: 1, limit: 10 }),
  })
}

// Background refetching
const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: dashboardApi.getFinancialSummary,
  refetchInterval: 5 * 60 * 1000, // 5 minutes
})
\`\`\`

### Debounced Search

\`\`\`tsx
// Custom debounce hook
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage in search
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

useQuery({
  queryKey: ['invoices', debouncedSearch],
  queryFn: () => invoiceApi.getInvoices({ search: debouncedSearch }),
})
\`\`\`

## 🚨 Error Handling

### Error Boundary Implementation

\`\`\`tsx
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-error mx-auto mb-4" />
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
\`\`\`

### API Error Handling

\`\`\`tsx
// Centralized error handling
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.clear()
    window.location.href = '/login'
  } else if (error.response?.status >= 500) {
    // Server error
    toast({
      title: 'Server Error',
      description: 'Something went wrong on our end. Please try again.',
      variant: 'destructive',
    })
  } else {
    // Client error
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'An error occurred',
      variant: 'destructive',
    })
  }
}
\`\`\`

## 🔄 Development Workflow

### Environment Setup

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
\`\`\`

### Environment Variables

\`\`\`env
# .env.local
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=KFT Management System
VITE_APP_VERSION=1.0.0
\`\`\`

### Code Quality Tools

\`\`\`json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
\`\`\`

### Build Configuration

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
\`\`\`

## 📊 Monitoring & Analytics

### Performance Monitoring

\`\`\`tsx
// Performance tracking
const trackPageView = (pageName: string) => {
  // Analytics implementation
  console.log(`Page view: ${pageName}`)
}

// Component performance monitoring
const ComponentWithTracking = () => {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      console.log(`Component render time: ${endTime - startTime}ms`)
    }
  }, [])
  
  return <div>Component content</div>
}
\`\`\`

### Error Reporting

\`\`\`tsx
// Error reporting service integration
const reportError = (error: Error, errorInfo?: any) => {
  // Send to error reporting service (e.g., Sentry)
  console.error('Error reported:', error, errorInfo)
}
\`\`\`

## 🚀 Deployment Strategy

### Build Optimization

\`\`\`bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm run build -- --analyze
\`\`\`

### Environment Configuration

\`\`\`tsx
// Environment-specific configurations
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api/v1',
    debug: true,
  },
  production: {
    apiUrl: 'https://api.kft-system.com/v1',
    debug: false,
  },
}

export default config[import.meta.env.MODE]
\`\`\`

## 🔮 Future Enhancements

### Technical Roadmap

1. **Progressive Web App (PWA)**
   - Service worker implementation
   - Offline functionality
   - App-like experience

2. **Advanced Features**
   - Real-time notifications with WebSockets
   - Advanced data visualization
   - Export functionality (PDF, Excel)

3. **Performance Improvements**
   - Virtual scrolling for large datasets
   - Advanced caching strategies
   - Image optimization

4. **Accessibility Enhancements**
   - Voice navigation support
   - Enhanced screen reader compatibility
   - Keyboard shortcut system

---

This React architecture provides a robust, scalable, and accessible foundation for the KFT Management System. The implementation follows modern React patterns, ensures excellent user experience across all devices, and maintains high code quality standards.
\`\`\`

I've completed the comprehensive React application with all your requirements:

## ✅ **Key Features Implemented:**

### 1. **React App (Not Next.js)**
- Converted to pure React with Vite
- React Router DOM for routing
- Modern React 18 features

### 2. **Accessibility (WCAG 2.1 AA)**
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast support
- Reduced motion preferences

### 3. **Responsive Design**
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Responsive navigation
- Adaptive components

### 4. **Forgot Password Implementation**
- Complete forgot password flow
- Reset password with token validation
- Email verification process
- Secure password reset

### 5. **Updated Color System**
- **Success**: `#2c6e49` for successful operations
- **Gray**: `#a3bac3` for neutral elements
- **Warning**: `#ff8c42` for warning states
- Maintained existing brand colors

### 6. **Comprehensive Documentation**
- Complete architecture documentation
- Accessibility implementation guide
- Responsive design strategy
- Color system guidelines
- Development workflow

## 🎯 **Architecture Highlights:**

- **Component-based architecture** with reusable components
- **Provider pattern** for state management
- **Custom hooks** for shared logic
- **Error boundaries** for graceful error handling
- **Route protection** with authentication guards
- **Performance optimizations** with code splitting
- **Type safety** with comprehensive TypeScript

The application is now a fully functional React app with excellent accessibility, responsive design, and a complete authentication system including forgot password functionality.
