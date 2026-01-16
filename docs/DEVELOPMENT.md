# Development Guide

## Development Workflow

### Getting Started

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd elearning
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:5173
   ```

## Code Structure

### Project Organization

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── api_translate/  # Dictionary/translation components
│   └── ...
├── contexts/           # React Context providers
├── features/           # Feature modules
│   ├── books/         # Level system
│   └── jlpt/          # JLPT exam system
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API & business logic
├── translations/       # i18n translation files
├── utils/              # Utility functions
└── styles/             # Global styles
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserDashboard.jsx`)
- **Services**: camelCase (e.g., `authService.js`)
- **Utils**: camelCase (e.g., `localStorageManager.js`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.jsx`)

### Component Structure

```jsx
// Component template
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component description
 * @param {Object} props - Component props
 */
function ComponentName({ prop1, prop2 }) {
  // Hooks
  const { user } = useAuth();
  const [state, setState] = useState(null);

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

export default ComponentName;
```

## Coding Standards

### JavaScript/JSX

1. **Use ES6+ features:**
   - Arrow functions
   - Destructuring
   - Template literals
   - Async/await

2. **React best practices:**
   - Functional components
   - Hooks for state/effects
   - Memoization when needed
   - Proper dependency arrays

3. **Code style:**
   - 2 spaces indentation
   - Semicolons optional (be consistent)
   - Single quotes for strings
   - Trailing commas in objects/arrays

### Example

```jsx
// ✅ Good
const { user, profile } = useAuth();
const [books, setBooks] = useState([]);

useEffect(() => {
  loadBooks();
}, []);

// ❌ Bad
const auth = useAuth();
const user = auth.user;
const profile = auth.profile;
```

### Error Handling

```javascript
// ✅ Good - Consistent error format
try {
  const result = await someService();
  if (!result.success) {
    console.error('Error:', result.error);
    return;
  }
  // Use result.data
} catch (err) {
  console.error('Unexpected error:', err);
}

// ❌ Bad - Inconsistent error handling
try {
  const result = await someService();
  // No error checking
} catch (err) {
  alert(err.message); // Bad UX
}
```

## Git Workflow

### Branch Strategy

```
main          # Production branch
├── develop   # Development branch (optional)
└── feature/* # Feature branches
```

### Commit Messages

**Format:**
```
type: Short description

Longer description if needed
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tool changes

**Examples:**
```
feat: Add SRS flashcard review page
fix: Resolve profile loading timeout issue
docs: Update API_SERVICES.md with new endpoints
refactor: Extract storage logic to separate service
```

### Pull Request Process

1. **Create feature branch:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

3. **Push and create PR:**
   ```bash
   git push origin feature/new-feature
   # Create PR on GitHub/GitLab
   ```

4. **Code review:**
   - Wait for review
   - Address feedback
   - Update PR

5. **Merge:**
   - Squash and merge (recommended)
   - Delete branch after merge

## Development Tools

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**ESLint Configuration:**
- React hooks rules
- React refresh rules
- JavaScript best practices

### Code Formatting

Use Prettier (if configured) or follow project style guide.

### Debugging

1. **Browser DevTools:**
   - Console for logs
   - Network for API calls
   - React DevTools for component inspection

2. **VS Code:**
   - Breakpoints
   - Debug console
   - Extensions: ESLint, Prettier

3. **React DevTools:**
   - Component tree
   - Props/state inspection
   - Performance profiling

## Testing

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Works in different browsers
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Performance (no lag, fast loading)

### Testing Different Scenarios

1. **User roles:**
   - Test as admin
   - Test as editor
   - Test as regular user

2. **Data states:**
   - Empty data
   - Large datasets
   - Invalid data

3. **Network conditions:**
   - Slow network
   - Offline mode
   - Network errors

## Performance Best Practices

### Code Splitting

```javascript
// ✅ Good - Lazy load heavy components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboardPage'));

// ❌ Bad - Import everything upfront
import AdminDashboard from './pages/admin/AdminDashboardPage';
```

### Memoization

```javascript
// ✅ Good - Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Good - Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

### Image Optimization

- Use WebP format
- Lazy load images
- Use appropriate sizes
- Compress before upload

### Bundle Size

- Monitor bundle size: `npm run build`
- Use dynamic imports for large libraries
- Remove unused dependencies

## Common Patterns

### Service Pattern

```javascript
// services/exampleService.js
import { supabase } from './supabaseClient';

export async function getData(id) {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
```

### Context Pattern

```javascript
// contexts/ExampleContext.jsx
const ExampleContext = createContext(null);

export function ExampleProvider({ children }) {
  const [state, setState] = useState(null);

  const value = {
    state,
    setState,
    // Other methods
  };

  return (
    <ExampleContext.Provider value={value}>
      {children}
    </ExampleContext.Provider>
  );
}

export function useExample() {
  const context = useContext(ExampleContext);
  if (!context) {
    throw new Error('useExample must be used within ExampleProvider');
  }
  return context;
}
```

### Hook Pattern

```javascript
// hooks/useExample.jsx
export function useExample(param) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await someService(param);
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [param]);

  return { data, loading, error };
}
```

## Environment Setup

### Required Tools

- **Node.js**: 18.0.0+
- **npm**: 9.0.0+
- **Git**: Latest
- **VS Code** (recommended): With extensions

### VS Code Extensions

- ESLint
- Prettier
- React snippets
- GitLens
- Tailwind CSS IntelliSense

### Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |
| `npm run i18n:scan` | Scan for translations |
| `npm run backup:auto` | Auto backup |

## Best Practices

1. **Keep components small** - Single responsibility
2. **Reuse components** - Don't duplicate code
3. **Use TypeScript/JSDoc** - Document types
4. **Handle errors gracefully** - User-friendly messages
5. **Optimize performance** - Lazy load, memoize
6. **Test thoroughly** - Manual and automated
7. **Follow conventions** - Consistent code style
8. **Document complex logic** - Add comments
9. **Keep dependencies updated** - Security patches
10. **Review code** - Before merging

## Troubleshooting Development Issues

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues.

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
