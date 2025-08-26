# ProjectAIWP Database Visualization

## Database Structure Overview

The application uses **SQLite** database with the following main entities:

## 📊 Database Schema

### 1. **Users Table**
- Stores user information with role and organization associations
- **Total Records**: 12 users

### 2. **Roles Table**
- Defines different user roles in the system
- **Total Records**: 6 roles
  - `frontend` - Client-side development specialists
  - `backend` - Server-side logic experts
  - `qa` - Quality assurance professionals
  - `designer` - UI/UX designers
  - `pm` - Project managers
  - `owner` - Product owners

### 3. **Organizations Table**
- Company/organization entities
- **Total Records**: 2 organizations
  - TechCorp Solutions
  - StartupHub Inc

### 4. **AI Tools Table**
- AI tools and services catalog
- **Total Records**: 10 AI tools
  - GitHub Copilot
  - ChatGPT
  - Figma AI
  - Cypress
  - Tabnine
  - Linear
  - SonarQube
  - Postman
  - Claude
  - DataDog

### 5. **Categories Table**
- Tool categorization system
- **Total Records**: 10 categories
  - Code Generation
  - Testing & QA
  - Documentation
  - Design Tools
  - Project Management
  - Code Review
  - DevOps & CI/CD
  - Database Tools
  - Security
  - Analytics

### 6. **Junction Tables**
- `tool_categories` - Links tools to categories (many-to-many)
- `tool_roles` - Links tools to roles (many-to-many)
- `tool_ratings` - User ratings for tools
- `user_tool_usage` - Tracks tool usage by users

## 📈 Current Data Summary

### **Users Distribution**
```
Organization: TechCorp Solutions (8 users)
├── Owner: 1 (Иван Иванов)
├── Frontend: 2 (Елена Петрова, Виктория Павлова)
├── Backend: 2 (Петър Георгиев, Николай Тодоров)
├── QA: 1 (Мария Димитрова)
├── Designer: 1 (Александър Стоянов)
└── PM: 1 (София Николова)

Organization: StartupHub Inc (4 users)
├── Owner: 1 (Димитър Христов)
├── Frontend: 1 (Анна Василева)
├── Backend: 1 (Борис Михайлов)
└── Designer: 1 (Галина Радева)
```

### **AI Tools by Category**
```
Code Generation (3 tools):
├── GitHub Copilot
├── ChatGPT
└── Tabnine

Testing & QA (2 tools):
├── Cypress
└── Postman

Documentation (3 tools):
├── ChatGPT
├── Postman
└── Claude

Design Tools (1 tool):
└── Figma AI

Project Management (1 tool):
└── Linear

Code Review (3 tools):
├── GitHub Copilot
├── ChatGPT
└── Claude

DevOps & CI/CD (4 tools):
├── Cypress
├── SonarQube
├── Postman
└── DataDog

Security (2 tools):
├── SonarQube
└── DataDog

Analytics (1 tool):
└── DataDog
```

### **AI Tools Pricing Overview**
```
Free Tier Available:
├── ChatGPT ($20/month for Plus)
├── Figma AI ($15/month for Professional)
├── Cypress ($75/month for Team)
├── Tabnine ($12/month for Pro)
├── Linear ($8/user/month for Standard)
├── SonarQube ($150/month for Enterprise)
├── Postman ($29/user/month for Team)
├── Claude ($20/month for Pro)
└── DataDog ($70/host/month for Pro)

Paid Only:
└── GitHub Copilot ($10/month Individual, $19/month Business)
```

### **Tool-Role Compatibility Matrix**

| Tool | frontend | backend | qa | designer | pm | owner |
|------|----------|---------|----|-----------|----|-------|
| GitHub Copilot | ✓ | ✓ | ✓ | - | - | - |
| ChatGPT | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Figma AI | ✓ | - | - | ✓ | ✓ | - |
| Cypress | ✓ | ✓ | ✓ | - | - | - |
| Tabnine | ✓ | ✓ | - | - | - | - |
| Linear | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| SonarQube | ✓ | ✓ | ✓ | - | - | ✓ |
| Postman | ✓ | ✓ | ✓ | - | - | - |
| Claude | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| DataDog | - | ✓ | ✓ | - | - | ✓ |

## 🔄 Relationships

### Entity Relationship Diagram (Conceptual)

```
┌─────────────┐     ┌──────────────────┐     ┌───────────┐
│    Users    │────▶│  Organizations   │     │   Roles   │
└─────────────┘     └──────────────────┘     └───────────┘
      │                                             ▲
      │                                             │
      ▼                                             │
┌─────────────┐     ┌──────────────────┐     ┌───────────┐
│ Tool Ratings│────▶│    AI Tools      │◀────│Tool Roles │
└─────────────┘     └──────────────────┘     └───────────┘
      ▲                      │                      
      │                      ▼                      
┌─────────────┐     ┌──────────────────┐     
│ User Usage  │     │ Tool Categories  │     
└─────────────┘     └──────────────────┘     
                             ▲                      
                             │                      
                      ┌──────────────┐              
                      │  Categories  │              
                      └──────────────┘              
```

## 📝 Notes

- **Database Type**: SQLite (file-based)
- **Location**: `/root/ProjectAIWP/src/database/database.sqlite`
- **Framework**: Laravel (PHP)
- **Seeded Data**: The database has been populated with sample data including:
  - 12 users with Bulgarian names
  - 10 popular AI development tools
  - Realistic pricing models and features
  - Role-based tool recommendations

- **Empty Tables**: Currently no data in:
  - Tool Ratings (no user ratings yet)
  - User Tool Usage (no usage tracking yet)

This represents a multi-tenant AI tools recommendation platform where users from different organizations can discover and rate AI tools relevant to their roles.