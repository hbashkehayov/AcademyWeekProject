# ProjectAIWP API Documentation

> **Complete API reference for the AI Tools Platform**

## 🔗 Base URL
```
http://localhost:8000/api
```

## 🔐 Authentication

The API uses **Laravel Sanctum** for authentication. All protected endpoints require a valid API token.

### Getting an API Token
```bash
POST /api/login
Content-Type: application/json

{
  "email": "ivan@admin.local",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Иван Иванов",
    "email": "ivan@admin.local",
    "role": {
      "name": "owner",
      "display_name": "Product Owner"
    }
  },
  "token": "1|abc123..."
}
```

### Using the Token
Include the token in the Authorization header:
```bash
Authorization: Bearer 1|abc123...
```

---

## 👥 Authentication Endpoints

### POST /api/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

### POST /api/login
Authenticate user and get API token.

### POST /api/logout
Logout and invalidate token (requires authentication).

### GET /api/user
Get current authenticated user details.

---

## 🛠️ AI Tools Endpoints

### GET /api/tools
Get paginated list of AI tools with filtering.

**Query Parameters:**
- `category` - Filter by category slug
- `role` - Filter by role name  
- `pricing_type` - Filter by pricing (free, paid, freemium)
- `search` - Search in name/description
- `status` - Filter by status (active, pending)
- `per_page` - Items per page (default: 15)

**Example:**
```bash
GET /api/tools?category=code-generation&role=frontend&per_page=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "GitHub Copilot",
      "slug": "github-copilot",
      "description": "AI pair programmer",
      "website_url": "https://github.com/features/copilot",
      "logo_url": "https://example.com/logo.png",
      "pricing_model": {
        "type": "paid",
        "price": 10,
        "currency": "USD"
      },
      "features": ["Code completion", "Multi-language"],
      "integration_type": "native",
      "status": "active",
      "categories": [
        {
          "id": 1,
          "name": "Code Generation",
          "slug": "code-generation"
        }
      ],
      "roles": [
        {
          "id": 1,
          "name": "frontend",
          "pivot": {
            "relevance_score": 95,
            "use_cases": ["React components", "CSS helpers"]
          }
        }
      ]
    }
  ],
  "links": {...},
  "meta": {...}
}
```

### GET /api/tools/{slug}
Get detailed information about a specific tool.

### POST /api/tools
Create a new AI tool (requires authentication).

**Request:**
```json
{
  "name": "New AI Tool",
  "description": "Tool description",
  "website_url": "https://example.com",
  "api_endpoint": "https://api.example.com",
  "logo_url": "https://example.com/logo.png",
  "pricing_model": {
    "type": "freemium",
    "price": 20,
    "currency": "USD",
    "free_tier": true
  },
  "features": ["Feature 1", "Feature 2"],
  "integration_type": "redirect",
  "suggested_for_role": 1,
  "categories": [1, 2],
  "roles": [
    {
      "id": 1,
      "relevance_score": 85,
      "use_cases": ["Use case 1", "Use case 2"]
    }
  ]
}
```

### PUT /api/tools/{id}
Update an existing tool (requires authentication + ownership).

### DELETE /api/tools/{id}
Delete a tool (requires authentication + ownership).

---

## 🎯 Recommendations Endpoints

### GET /api/recommendations/role-based
Get AI tool recommendations for a specific role.

**Query Parameters:**
- `role` - Target role (frontend, backend, qa, designer, pm, owner)
- `limit` - Number of recommendations (default: 10)
- `offset` - Pagination offset (default: 0)
- `user_id` - User ID for personalization (optional)

**Example:**
```bash
GET /api/recommendations/role-based?role=frontend&limit=5&user_id=123
```

**Response:**
```json
{
  "success": true,
  "role": {
    "name": "frontend",
    "display_name": "Frontend Developer"
  },
  "recommendations": [
    {
      "id": "uuid",
      "name": "GitHub Copilot",
      "recommendation_score": 95.5,
      "match_reasons": [
        "Perfect match for frontend developers",
        "Essential for React development"
      ],
      "personalization_boost": 0.8,
      "categories": [...],
      "roles": [...]
    }
  ],
  "total": 5,
  "total_available": 25,
  "has_more": true,
  "recently_added": [...],
  "personalized": true
}
```

### POST /api/recommendations/track-interaction
Track user interaction with AI tools for better recommendations.

**Request:**
```json
{
  "user_id": "uuid",
  "tool_id": "uuid",
  "interaction_type": "viewed",
  "source": "dashboard",
  "metadata": {
    "recommendation_score": 85.5
  },
  "session_duration": 120,
  "rating": 4.5
}
```

**Interaction Types:**
- `viewed` - Tool was viewed
- `clicked` - Tool link was clicked
- `added` - Tool was added by user
- `suggested_by_ai` - Tool was suggested by AI
- `favorited` - Tool was marked as favorite
- `rated` - Tool was rated

---

## 📊 Categories & Roles

### GET /api/categories
Get all available categories.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Code Generation",
      "slug": "code-generation",
      "description": "AI tools for code generation",
      "icon": "code",
      "tools_count": 15
    }
  ]
}
```

### GET /api/roles
Get all available roles.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "frontend",
      "display_name": "Frontend Developer",
      "description": "Client-side development specialists"
    }
  ]
}
```

---

## 🤖 AI Assistant Endpoints

### POST /api/ai-assistant/research-tool
Research a tool using AI and get structured data.

**Request:**
```json
{
  "tool_name": "Cursor AI",
  "additional_context": "IDE with AI capabilities"
}
```

**Response:**
```json
{
  "success": true,
  "tool_data": {
    "name": "Cursor AI",
    "description": "AI-powered code editor",
    "website_url": "https://cursor.sh",
    "pricing_model": {
      "type": "freemium",
      "free_tier": true
    },
    "features": ["AI completion", "Chat interface"],
    "suggested_categories": ["Code Generation", "Code Review"],
    "suggested_roles": ["frontend", "backend"],
    "integration_type": "native",
    "confidence_score": 0.92
  }
}
```

---

## 👤 User Management (Admin Only)

### GET /api/admin/users
Get all users (requires owner role).

### PUT /api/admin/users/{id}
Update user details (requires owner role).

### DELETE /api/admin/users/{id}
Delete user (requires owner role).

### GET /api/admin/tools/pending
Get pending tools awaiting approval.

### PUT /api/admin/tools/{id}/approve
Approve a pending tool.

### PUT /api/admin/tools/{id}/reject
Reject a pending tool.

---

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "error_type": "VALIDATION_ERROR",
  "message": "Human readable message",
  "errors": {
    "field_name": ["Field specific error"]
  }
}
```

### Common Error Types
- `VALIDATION_ERROR` (422) - Invalid input data
- `UNAUTHORIZED` (401) - Missing or invalid token
- `FORBIDDEN` (403) - Insufficient permissions  
- `NOT_FOUND` (404) - Resource not found
- `SERVER_ERROR` (500) - Internal server error
- `RATE_LIMITED` (429) - Too many requests

---

## 🔄 Rate Limiting

- **Authentication endpoints**: 60 requests per minute
- **General API**: 1000 requests per minute per user
- **AI Assistant**: 30 requests per minute per user

---

## 📝 Response Headers

All API responses include these headers:
- `Content-Type: application/json`
- `X-RateLimit-Limit` - Rate limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-Request-ID` - Unique request identifier

---

## 🧪 Testing the API

### Using cURL
```bash
# Get tools
curl -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/tools

# Create tool
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name":"Test Tool","description":"Test"}' \
     http://localhost:8000/api/tools
```

### Using Postman
1. Import the API collection (if available)
2. Set base URL: `http://localhost:8000/api`
3. Add Authorization header with Bearer token
4. Set Content-Type to `application/json`

---

## 🛡️ Security Notes

- Always use HTTPS in production
- Store API tokens securely
- Rotate tokens regularly
- Validate all input data
- Monitor for suspicious activity
- Use rate limiting appropriately

---

For more information, see:
- [User Guide](USER_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Development Guide](../DEVELOPMENT.md)