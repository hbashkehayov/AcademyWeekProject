# Development Documentation - ProjectAIWP

## 🤖 AI Agents & Development Prompts

This document contains specialized prompts and instructions for AI agents to continue development on the ProjectAIWP platform.

### 🚀 Quick Start Prompt for AI Development Agents

```markdown
You are working on ProjectAIWP - an enterprise AI tools platform built with Laravel 10 + Next.js 14.

CONTEXT:
- Full-stack platform for AI tool discovery and management
- Role-based recommendations (Frontend, Backend, QA, Designer, PM, Owner)  
- Glass morphism UI with dark/light themes
- Laravel Sanctum auth + 2FA (Google Auth, Email)
- PostgreSQL + Redis + Docker containerization
- Anthropic AI SDK for tool research

CURRENT STATE:
✅ COMPLETED:
- Full authentication system with 2FA
- Role-based access control
- AI tool CRUD with approval workflows
- Admin panel for owners
- Advanced UI/UX with responsive design
- Docker containerization
- Database schema with migrations
- API endpoints with Sanctum auth

ARCHITECTURE:
/ProjectAIWP/
├── src/Backend/        # Laravel 10 API
├── src/Frontend/       # Next.js 14 + TypeScript  
├── docker/            # Containerization
└── docker-compose.yml # 7 services

KEY FILES TO UNDERSTAND:
- Backend Models: AiTool, User, Role, Category
- Frontend Components: Dashboard, AddToolForm, AdminOperations
- API Routes: /src/Backend/routes/api.php
- Database: 12 migrations with full schema

DEVELOPMENT COMMANDS:
- Backend: docker-compose exec app bash
- Frontend: docker-compose exec frontend bash  
- Database: docker-compose exec app php artisan migrate
- Tests: docker-compose exec app php artisan test

When working on this project, maintain the existing code style, glass morphism design, and role-based architecture.
```

### 🎯 Feature Development Templates

#### Adding New Features
```markdown
FEATURE DEVELOPMENT CHECKLIST:
□ Backend Model/Migration if needed
□ API Controller endpoint
□ Frontend Component
□ Role-based permissions check
□ Update TypeScript interfaces
□ Add to existing navigation
□ Write tests (PHPUnit + Jest)
□ Update documentation

CODING STANDARDS:
- PSR-12 for PHP
- ESLint + Prettier for TypeScript
- Glass morphism UI components
- Role-based conditional rendering
- Responsive design (sm:, md:, lg:, xl:)
- Anthropic AI integration patterns
```

#### Bug Fix Template
```markdown
BUG FIX WORKFLOW:
1. Reproduce issue in development
2. Check logs: docker-compose logs -f app
3. Identify root cause
4. Create test case
5. Implement fix
6. Verify across all roles
7. Test responsive design
8. Update if affects API documentation
```

### 🔧 Common Development Patterns

#### API Endpoint Pattern
```php
// Backend Controller Template
public function methodName(Request $request): JsonResponse
{
    // Role check if needed
    if (!auth()->user() || auth()->user()->role->name !== 'owner') {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // Validation
    $validated = $request->validate([
        'field' => 'required|string|max:255',
    ]);

    // Business logic
    $result = Model::create($validated);

    return response()->json($result);
}
```

#### Frontend Component Pattern  
```typescript
// React Component Template
'use client';

interface ComponentProps {
  user?: { name: string; role: string };
  onAction: () => void;
}

export default function Component({ user, onAction }: ComponentProps) {
  const [state, setState] = useState('');

  return (
    <div className="glass-morphism rounded-3xl p-6">
      {/* Role-based conditional content */}
      {user?.role === 'owner' && (
        <div className="admin-only-content">
          {/* Admin features */}
        </div>
      )}
      
      <button 
        onClick={onAction}
        className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl px-4 py-2"
      >
        Action Button
      </button>
    </div>
  );
}
```

#### Database Migration Pattern
```php
// Migration Template
public function up(): void
{
    Schema::create('table_name', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('name');
        $table->foreignId('user_id')->constrained();
        $table->timestamps();
        
        $table->index(['user_id', 'created_at']);
    });
}
```

### 🧪 Testing Patterns

#### Backend Test Template
```php
public function test_feature_works_correctly()
{
    $user = User::factory()->create(['role_id' => 1]);
    
    $response = $this->actingAs($user)
        ->postJson('/api/endpoint', [
            'field' => 'value'
        ]);

    $response->assertStatus(201)
        ->assertJson(['success' => true]);
}
```

### 🎨 UI/UX Guidelines

#### Glass Morphism Standards
```css
/* Standard glass morphism component */
.glass-morphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem; /* rounded-3xl */
}

/* Hover states */
.glass-hover:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
  transition: all 0.3s ease;
}
```

#### Responsive Breakpoints
```typescript
// Use these Tailwind classes consistently
sm:   // >= 640px
md:   // >= 768px  
lg:   // >= 1024px
xl:   // >= 1280px

// Example grid patterns:
'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
'text-lg md:text-xl lg:text-2xl'
'px-4 sm:px-6 lg:px-8'
```

### 🔐 Security Patterns

#### Role-Based Access
```php
// Backend role check
if (!auth()->user() || auth()->user()->role->name !== 'required_role') {
    return response()->json(['error' => 'Unauthorized'], 403);
}

// Multiple roles
$allowedRoles = ['owner', 'pm'];
if (!in_array(auth()->user()->role->name, $allowedRoles)) {
    return response()->json(['error' => 'Unauthorized'], 403);
}
```

```typescript
// Frontend role check
{user?.role === 'owner' && (
  <AdminComponent />
)}

// Multiple roles
{['owner', 'pm'].includes(user?.role) && (
  <ManagerComponent />
)}
```

### 📊 Database Optimization

#### Query Optimization Patterns
```php
// Eager loading relationships
$tools = AiTool::with(['categories', 'roles', 'submittedBy'])
    ->where('status', 'active')
    ->paginate(15);

// Caching expensive queries
$categories = Cache::remember('categories', 3600, function () {
    return Category::with('tools')->get();
});
```

### 🚀 Performance Guidelines

#### Frontend Performance
- Use `React.memo` for expensive components
- Implement proper loading states
- Optimize images with Next.js Image component
- Use CSS-in-JS sparingly (prefer Tailwind)

#### Backend Performance  
- Use Redis for caching
- Implement database indexes
- Use Laravel's built-in query optimization
- Consider queue jobs for heavy operations

### 📝 Code Review Checklist

Before submitting code:
□ All tests passing
□ TypeScript types defined
□ Role-based access implemented
□ Responsive design tested
□ Glass morphism design maintained
□ API documentation updated
□ Error handling implemented
□ Loading states added
□ Accessibility considerations
□ Performance implications considered

### 🔄 Deployment Notes

#### Production Checklist
□ Environment variables configured
□ Database migrations run
□ Assets compiled and optimized
□ Caches cleared and warmed
□ HTTPS configured
□ Monitoring setup
□ Backup procedures tested
□ Error tracking enabled

---

This documentation should be updated as new patterns emerge or architectural decisions change.