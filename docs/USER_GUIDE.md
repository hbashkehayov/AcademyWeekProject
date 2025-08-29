# ProjectAIWP User Guide

> **Complete guide for using the AI Tools Platform**

## 🎯 Overview

ProjectAIWP is an intelligent platform for discovering, managing, and recommending AI tools based on your development role. Whether you're a Frontend Developer, Backend Engineer, QA Specialist, Designer, Project Manager, or Product Owner, the platform provides personalized recommendations to enhance your workflow.

---

## 🚀 Getting Started

### First Time Setup

1. **Access the Platform**
   - Open your browser to: `http://localhost:3000` (local) or your domain
   - You'll see the beautiful Glass Morphism landing page

2. **Login to Your Account**
   - Click "Login" in the top navigation
   - Use one of the pre-seeded accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Owner** | `ivan@admin.local` | `password` | Full admin access |
| **Frontend** | `elena@frontend.local` | `password` | Developer tools |
| **Backend** | `petar@backend.local` | `password` | Developer tools |
| **QA** | `maria@qa.local` | `password` | Testing tools |
| **Designer** | `alex@designer.local` | `password` | Design tools |
| **PM** | `sofia@pm.local` | `password` | Management tools |

3. **Enable Two-Factor Authentication (2FA)**
   - Go to Settings → Security
   - Choose your preferred method:
     - **Google Authenticator**: Scan QR code with your app
     - **Email Codes**: Receive codes via email
   - Save your recovery codes in a safe place

---

## 🏠 Dashboard Overview

The dashboard is your central hub with several key components:

### Left Sidebar Navigation
- **🏠 Dashboard**: Main overview with recommendations
- **🛠️ AI Tools**: Browse and manage all tools
- **⭐ Favourites**: Your bookmarked tools  
- **📊 Reports**: Usage analytics and insights
- **⚙️ Settings**: Account and security settings
- **👤 Admin Panel**: Tool and user management (Owners only)

### Main Content Areas

#### 1. **Greeting Card**
- Personalized welcome message
- Current role display
- Quick stats overview

#### 2. **Suggested AI Tools** (Right Panel)
- **Role-based recommendations** with matching percentages
- **Recently added tools** by you (pending approval)
- **Smart scoring** based on your role and preferences
- **Interactive explore buttons** to visit tool websites

#### 3. **AI Assistant Chat** (Bottom)
- **Tool research**: Ask about specific AI tools
- **Smart suggestions**: Get tool recommendations
- **Automatic form filling**: AI fills tool submission forms
- **Natural language queries**: "What tools help with React testing?"

#### 4. **Quick Stats Cards**
- Active tools count
- Your favorite tools
- Recent activity
- Recommendation accuracy

---

## 🛠️ Managing AI Tools

### Browsing AI Tools

1. **Navigate to AI Tools**
   - Click "AI Tools" in the sidebar
   - View paginated list of all active tools

2. **Filtering & Search**
   - **By Category**: Code Generation, Testing & QA, Design Tools, etc.
   - **By Role**: See tools relevant to specific roles
   - **By Pricing**: Free, Paid, Freemium options
   - **Search**: Find tools by name or description
   - **Combined filters**: Mix and match for precise results

3. **Tool Details**
   - Click any tool to see detailed information
   - View categories, supported roles, pricing
   - See user ratings and reviews
   - Access direct links to tool websites

### Adding New AI Tools

#### Method 1: Manual Addition
1. **Click "Add Tool" button** (requires login)
2. **Fill out the comprehensive form**:
   - **Basic Info**: Name, description, website URL
   - **Categories**: Select relevant categories (multi-select)
   - **Target Roles**: Choose which roles benefit from this tool
   - **Pricing Model**: Free, paid, freemium with details
   - **Features**: List key capabilities
   - **Integration Type**: Web redirect, API, or webhook
   - **Logo URL**: Tool's logo/icon (optional)

3. **Submit for Approval**
   - Tools are submitted with "pending" status
   - Owners review and approve new additions
   - You'll see your pending tools in Suggested AI Tools

#### Method 2: AI-Assisted Addition
1. **Open AI Assistant** at the bottom of dashboard
2. **Describe the tool**: "I want to add Cursor AI editor"
3. **AI researches automatically**:
   - Finds official website and documentation
   - Extracts pricing information
   - Identifies relevant categories
   - Suggests target roles
   - Generates comprehensive description

4. **Review AI suggestions**:
   - AI pre-fills the entire form
   - Edit any details as needed
   - Add personal insights or use cases
   - Submit the enhanced tool data

### Tool Interactions

#### Favoriting Tools
- **Star icon**: Click to add/remove from favorites
- **Quick access**: View all favorites in dedicated page
- **Personalized recommendations**: Favorite tools boost related suggestions

#### Rating Tools
- **5-star rating system**: Rate tools you've used
- **Comments**: Leave detailed reviews (optional)
- **Community benefit**: Ratings help others discover quality tools

#### Usage Tracking
- **Click tracking**: Platform tracks when you visit tool websites
- **Usage analytics**: See your most-used tools in Reports
- **Recommendation improvement**: Usage data enhances future suggestions

---

## 🎯 AI-Powered Recommendations

### How Recommendations Work

The platform uses advanced algorithms to suggest tools based on:

#### Scoring Factors (0-100% match):
- **Role Relevance** (30 points): How well the tool fits your role
- **Category Match** (30 points): Alignment with useful categories
- **Explicit Suggestions** (15 points): Tools specifically tagged for your role
- **Tool Quality** (10 points): Popularity, features, documentation quality
- **Personalization** (15 points): Your usage patterns and preferences

#### Special Boosts:
- **Recently Added**: Your pending tools get +10 points boost
- **Favorited Tools**: Favorite tools appear with high relevance
- **AI Suggestions**: Tools found by AI assistant get special weighting
- **Community Trends**: Popular tools among similar roles get highlighted

### Recommendation Categories

#### **Perfect Match (80-100%)**
- Essential tools for your specific role
- High category relevance
- Strong community adoption
- Green progress bars and "Perfect Match" labels

#### **Highly Relevant (60-79%)**  
- Very useful for your workflows
- Good feature alignment
- Moderate learning curve
- Blue progress bars and "Highly Relevant" labels

#### **Good Fit (40-59%)**
- Useful supplementary tools
- Cross-role compatibility
- Specialized use cases
- Yellow progress bars and "Good Fit" labels

#### **Suggested (0-39%)**
- Exploratory recommendations
- Emerging tools
- Niche applications
- Gray progress bars and "Suggested" labels

---

## 📊 Analytics & Reports

### Personal Analytics
- **Tool Usage**: Your most-accessed tools
- **Category Preferences**: Which categories you explore most
- **Recommendation Accuracy**: How often you use suggested tools
- **Activity Timeline**: Your platform usage over time

### Team Analytics (Owners)
- **Popular Tools**: Most-used tools across organization
- **Role Insights**: Tool preferences by development role
- **Approval Metrics**: Pending vs approved tools statistics
- **User Engagement**: Platform adoption and activity levels

---

## ⚙️ Settings & Customization

### Account Settings
- **Profile Information**: Update name, email
- **Role Assignment**: Request role changes (requires approval)
- **Notifications**: Email preferences for new tools and updates
- **Theme**: Switch between light and dark modes

### Security Settings
- **Password Change**: Update your login credentials
- **Two-Factor Authentication**: 
  - Google Authenticator setup
  - Email verification codes
  - Recovery code management
- **Active Sessions**: View and manage login sessions
- **Security Log**: See recent security events

### Preferences
- **Default Filters**: Set preferred categories and pricing types
- **Recommendation Sensitivity**: Adjust how strict/loose suggestions are
- **UI Preferences**: Customize dashboard layout and components
- **Data Export**: Download your personal data and usage history

---

## 👑 Admin Features (Owners Only)

### User Management
- **View All Users**: See complete user directory
- **Role Assignment**: Approve role change requests
- **User Permissions**: Grant or revoke access levels
- **Account Status**: Activate/deactivate user accounts
- **Usage Analytics**: Monitor user engagement and activity

### Tool Management
- **Pending Approvals**: Review newly submitted tools
- **Tool Editing**: Update existing tool information
- **Status Management**: Activate, deactivate, or delete tools
- **Category Management**: Create and organize tool categories
- **Bulk Operations**: Approve/reject multiple tools at once

### System Administration
- **Platform Statistics**: Overall usage and growth metrics
- **Quality Control**: Monitor tool quality and user feedback
- **Content Moderation**: Review ratings and comments
- **System Health**: Monitor performance and error rates

---

## 💡 Pro Tips & Best Practices

### Maximizing Recommendations
1. **Complete Your Profile**: Accurate role information improves suggestions
2. **Rate Tools Actively**: Ratings help refine future recommendations
3. **Use Favorites**: Favoriting tools teaches the system your preferences
4. **Engage with AI Assistant**: Regular use improves tool discovery
5. **Submit Quality Tools**: Adding valuable tools benefits the entire community

### Efficient Tool Discovery
1. **Start with Role-Based Filtering**: Focus on your primary role first
2. **Explore Cross-Role Tools**: Check tools for adjacent roles (Frontend → Designer)
3. **Follow Category Trends**: Popular categories often contain hidden gems
4. **Check Recent Additions**: New tools might offer cutting-edge capabilities
5. **Read Tool Descriptions**: Detailed descriptions reveal unexpected use cases

### Security Best Practices
1. **Enable 2FA Immediately**: Protect your account with two-factor authentication
2. **Use Strong Passwords**: Generate unique, complex passwords
3. **Review Sessions Regularly**: Check for unauthorized access attempts
4. **Keep Recovery Codes Safe**: Store 2FA recovery codes securely
5. **Log Out from Shared Devices**: Always sign out on public computers

---

## 🔄 Workflow Integration

### Daily Developer Workflow

#### Morning Routine
1. **Check Dashboard**: Review new recommendations
2. **Browse Updates**: See recently added tools in your domain
3. **Plan Tool Exploration**: Bookmark interesting tools for later investigation

#### During Development
1. **Use AI Assistant**: Ask for tool recommendations for specific problems
2. **Quick Tool Lookup**: Search for tools when facing challenges  
3. **Track Usage**: Click through to tools you're actively using

#### End of Week
1. **Rate Used Tools**: Provide feedback on tools you've tried
2. **Submit New Discoveries**: Add valuable tools you've found elsewhere
3. **Review Analytics**: Check your tool usage patterns in Reports

### Team Collaboration

#### For Project Managers
1. **Cross-Role Visibility**: See what tools different team members use
2. **Tool Standardization**: Identify common tools for team adoption
3. **Budget Planning**: Monitor paid tool usage and costs

#### for Team Leads
1. **Onboarding**: Share relevant tools with new team members
2. **Skill Development**: Recommend learning tools for team growth
3. **Process Improvement**: Find tools that enhance team workflows

---

## 📱 Mobile Experience

### Responsive Design
- **Mobile-First**: Optimized for smartphones and tablets  
- **Touch-Friendly**: Large buttons and easy navigation
- **Fast Loading**: Optimized images and efficient caching
- **Offline Capability**: Basic functionality works without internet

### Mobile-Specific Features
- **Swipe Navigation**: Intuitive gesture controls
- **Quick Actions**: Fast access to common functions
- **Push Notifications**: Tool updates and recommendations (if enabled)
- **Share Integration**: Easy sharing of tools with team members

---

## 🆘 Getting Help

### Self-Help Resources
1. **Search Function**: Use the platform search to find tools
2. **AI Assistant**: Ask questions about platform features
3. **Tooltips**: Hover over UI elements for quick help
4. **FAQ Section**: Common questions and answers

### Support Channels
1. **Documentation**: Comprehensive guides in `/docs` folder
2. **GitHub Issues**: Report bugs and request features
3. **Community Forum**: Connect with other users
4. **Direct Support**: Contact administrators for urgent issues

### Common Questions

**Q: Why aren't my tool submissions appearing?**
A: Tools require owner approval. Check "Suggested AI Tools" to see your pending submissions.

**Q: How can I improve my recommendations?**
A: Rate tools you use, favorite relevant ones, and ensure your role is correctly set.

**Q: Can I change my role?**
A: Submit a role change request in Settings. Owners will review and approve.

**Q: Why can't I see certain admin features?**
A: Admin features are only available to users with "Owner" role.

**Q: How do I export my data?**
A: Go to Settings → Privacy → Data Export to download your information.

---

## 🔄 Regular Updates

The platform receives regular updates with:
- **New AI tools**: Fresh additions to the catalog
- **Enhanced recommendations**: Improved suggestion algorithms  
- **UI improvements**: Better user experience and performance
- **Security updates**: Latest security patches and features
- **Feature additions**: New functionality based on user feedback

Stay updated by:
- Checking the dashboard regularly
- Following release notes
- Engaging with the community
- Providing feedback for improvements

---

**Next Steps:**
- [API Documentation](API.md) - For developers wanting to integrate
- [Deployment Guide](DEPLOYMENT.md) - For hosting your own instance  
- [Development Guide](../DEVELOPMENT.md) - For contributing to the project