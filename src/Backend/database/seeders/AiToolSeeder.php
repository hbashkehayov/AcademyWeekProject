<?php

namespace Database\Seeders;

use App\Models\AiTool;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AiToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the admin user who will be the submitter
        $admin = User::where('email', 'ivan@admin.local')->first();
        
        // Get categories
        $categories = Category::all()->keyBy('slug');
        
        // Get roles
        $roles = Role::all()->keyBy('name');
        
        $aiTools = [
            [
                'name' => 'GitHub Copilot',
                'slug' => 'github-copilot',
                'description' => 'AI pair programmer that helps you write code faster with suggestions and completions',
                'detailed_description' => "GitHub Copilot is an AI-powered coding assistant that has revolutionized software development in 2025. As your AI pair programmer, it provides contextualized assistance throughout the entire software development lifecycle.

Core Features:
• **Autonomous Coding Agent**: The 2025 version introduces an asynchronous coding agent that can be assigned GitHub issues directly. Using state-of-the-art models, it excels at low-to-medium complexity tasks, creating fully-tested pull requests ready for human review.

• **Advanced Code Completion**: Provides inline suggestions ranging from single lines to entire function implementations, with next edit suggestions that predict logical code changes based on context.

• **Multi-Language Excellence**: Trained on all languages in public repositories with high-quality suggestions across dozens of programming languages and frameworks.

• **Enterprise-Ready Security**: Built around an integrated, secure development environment with policy management, IP indemnity, and the ability to index organizational codebases for tailored suggestions.

• **GPT-5 Integration**: Now powered by OpenAI's latest GPT-5 model, delivering substantial improvements in reasoning, code quality, and handling of complex end-to-end coding tasks.

• **IDE Integration**: Seamlessly integrates with VS Code, Visual Studio, JetBrains IDEs, Neovim, Xcode, and Eclipse, with agent mode available across multiple platforms.

Development Workflow:
Copilot agent mode can autonomously plan and execute complex development tasks, coordinating multi-step workflows, running terminal commands, and invoking specialized tools. It can create apps from scratch, perform large-scale refactoring, write comprehensive tests, migrate legacy code to modern frameworks, and generate documentation automatically.

The platform represents the evolution from simple code completion to a comprehensive AI development environment, making it essential for modern development teams focused on productivity and code quality.",
                'website_url' => 'https://github.com/features/copilot',
                'logo_url' => 'https://github.githubassets.com/images/modules/site/copilot/copilot.png',
                'pricing_model' => [
                    'freeTier' => false,
                    'priceRange' => 'low',
                    'monthlyPrice' => 10,
                    'details' => ['Individual plan: $10/month', 'Business plan: $19/month']
                ],
                'features' => [
                    ['name' => 'Code completion', 'description' => 'Real-time code suggestions'],
                    ['name' => 'Multi-language support', 'description' => 'Works with dozens of languages'],
                    ['name' => 'IDE integration', 'description' => 'VS Code, JetBrains, Neovim support']
                ],
                'integration_type' => 'native',
                'status' => 'active',
                'categories' => ['code-generation', 'code-review'],
                'roles' => [
                    'frontend' => ['relevance' => 0.95, 'use_cases' => ['React component generation', 'CSS helpers']],
                    'backend' => ['relevance' => 0.95, 'use_cases' => ['API endpoint creation', 'Database queries']],
                    'qa' => ['relevance' => 0.60, 'use_cases' => ['Test case generation']],
                ]
            ],
            [
                'name' => 'ChatGPT',
                'slug' => 'chatgpt',
                'description' => 'Advanced AI assistant for code explanation, debugging, and problem-solving',
                'detailed_description' => "ChatGPT has evolved into a comprehensive AI programming assistant, featuring cutting-edge capabilities for software development in 2025.

Latest Features:
• **GPT-5 for Developers**: The 2025 release features GPT-5, the strongest coding model OpenAI has created, scoring 74.9% on SWE-bench Verified and 88% on Aider polyglot benchmarks. It excels at producing high-quality code, fixing bugs, editing code, and answering complex codebase questions.

• **Codex Integration**: ChatGPT now includes Codex, a cloud-based software engineering agent that can work on multiple tasks in parallel. Codex agents independently handle feature writing, bug fixing, and creating pull requests, with tasks typically completing in 1-30 minutes.

• **Canvas Interface**: The innovative Canvas interface provides a dedicated workspace for coding projects beyond simple chat, offering inline code suggestions, debugging assistance, and collaborative editing capabilities.

Advanced Coding Capabilities:
• **Front-End Excellence**: GPT-5 demonstrates superior front-end development skills, outperforming other models in web development tasks 70% of the time in internal testing.
• **Tool Intelligence**: Enhanced ability to chain together dozens of tool calls both sequentially and in parallel without losing context.
• **Code Analysis**: Comprehensive code review with suggestions for improvements, bug detection, and refactoring recommendations.

Interactive Features:
Canvas offers specialized coding tools including code review with inline suggestions, automatic log insertion for debugging, intelligent commenting, bug detection and resolution, and multi-language code porting (JavaScript, TypeScript, Python, Java, C++, PHP).

Enterprise Integration:
Apple has integrated ChatGPT into Xcode for AI-powered programming suggestions, and developers can use API keys to bring ChatGPT capabilities to other development environments.

ChatGPT in 2025 represents a mature AI development platform capable of handling sophisticated programming tasks while maintaining high code quality and developer productivity standards.",
                'website_url' => 'https://chat.openai.com',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'medium',
                    'monthlyPrice' => 20,
                    'details' => ['Free tier available', 'Plus plan: $20/month']
                ],
                'features' => [
                    ['name' => 'Code explanation', 'description' => 'Explains complex code'],
                    ['name' => 'Bug fixing', 'description' => 'Helps identify and fix bugs'],
                    ['name' => 'Architecture advice', 'description' => 'System design recommendations']
                ],
                'integration_type' => 'redirect',
                'status' => 'active',
                'categories' => ['code-generation', 'documentation', 'code-review'],
                'roles' => [
                    'frontend' => ['relevance' => 0.85, 'use_cases' => ['Component architecture', 'Performance optimization']],
                    'backend' => ['relevance' => 0.90, 'use_cases' => ['API design', 'Database optimization']],
                    'qa' => ['relevance' => 0.75, 'use_cases' => ['Test strategy', 'Bug analysis']],
                    'designer' => ['relevance' => 0.70, 'use_cases' => ['UX copy writing', 'Design system advice']],
                    'pm' => ['relevance' => 0.80, 'use_cases' => ['Feature planning', 'Technical documentation']],
                    'owner' => ['relevance' => 0.85, 'use_cases' => ['Product strategy', 'Technical feasibility']],
                ]
            ],
            [
                'name' => 'Figma AI',
                'slug' => 'figma-ai',
                'description' => 'AI-powered design assistant for creating and optimizing UI designs',
                'detailed_description' => "Figma AI has transformed UI/UX design workflows in 2025, evolving from a collaborative design tool into an intelligent design assistant that accelerates creative processes.

Revolutionary AI Features:
• **First Draft**: Transform ideas into editable designs within minutes using natural language prompts. Simply describe your vision like 'Create a modern login screen for a mobile banking app' and Figma generates complete UI mockups instantly.

• **Text-to-Design Generation**: Advanced generative AI creates full UI interfaces from descriptive text, enabling rapid exploration of design possibilities and iterations.

• **Smart Content Tools**: Replace placeholder text with realistic, contextual content, generate unique images from written prompts, automatically remove image backgrounds, and enhance low-resolution images with AI-powered upscaling.

• **Accessibility Integration**: Automatically checks designs for accessibility compliance including contrast ratios, font sizes, and element spacing, providing immediate fixes to ensure inclusive design practices.

Productivity Enhancements:
• **Automated Organization**: Contextually rename and organize layers with a single click, maintaining clean project structure across team collaborations.
• **Smart Search**: Track down designs across teams and organizations using partial designs, screenshots, or natural language descriptions.
• **Intent-Driven Prototyping**: AI provides real-time feedback loops and smart suggestions during the design process.

Community & Plugins:
The Figma AI ecosystem includes powerful community plugins like Magician (all-in-one design automation), MagiCopy (UX copy suggestions), and UX Pilot (comprehensive AI wireframing). These tools handle everything from icon generation to human-like button labels and error messages.

Professional Integration:
Available on paid Figma plans with Full seat requirements, the AI tools integrate seamlessly into existing design workflows. Teams report spending less time on tedious alignment tasks and more time on creative strategy, UX storytelling, and user empathy development.

Figma AI represents the future of design collaboration, where artificial intelligence handles repetitive tasks while designers focus on innovation and creative problem-solving.",
                'website_url' => 'https://www.figma.com',
                'logo_url' => 'https://cdn.sanity.io/images/599r6htc/localized/46a76c802176eb17b04e12108de7e7e0f3736dc6-1024x1024.png',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'medium',
                    'monthlyPrice' => 15,
                    'details' => ['Free for 3 files', 'Professional: $15/month']
                ],
                'features' => [
                    ['name' => 'Auto-layout', 'description' => 'AI-powered layout suggestions'],
                    ['name' => 'Design system generation', 'description' => 'Create consistent design systems'],
                    ['name' => 'Prototype creation', 'description' => 'Interactive prototypes']
                ],
                'integration_type' => 'redirect',
                'status' => 'active',
                'categories' => ['design-tools'],
                'roles' => [
                    'designer' => ['relevance' => 0.98, 'use_cases' => ['UI design', 'Prototyping', 'Design systems']],
                    'frontend' => ['relevance' => 0.75, 'use_cases' => ['Design implementation', 'Component visualization']],
                    'pm' => ['relevance' => 0.60, 'use_cases' => ['Wireframing', 'Feature mockups']],
                ]
            ],
            [
                'name' => 'Cypress',
                'slug' => 'cypress',
                'description' => 'Modern end-to-end testing framework with AI-powered test generation',
                'detailed_description' => "Cypress has emerged as the leading end-to-end testing framework, enhanced with cutting-edge AI capabilities for 2025 that revolutionize software testing automation.

AI-Enhanced Testing Features:
• **Self-Healing Tests**: AI automatically corrects flaky element selectors when IDs or classes change dynamically, reducing maintenance overhead by up to 40% and eliminating brittle test failures.

• **Visual Validation**: Advanced AI detects UI discrepancies undetectable by traditional assertions, capturing and comparing UI snapshots to identify unintended visual changes across different environments.

• **Predictive Analytics**: Machine learning algorithms analyze historical test data to identify high-risk areas and predict potential failure points, helping teams focus testing efforts more effectively.

• **Automated Test Generation**: AI agents generate comprehensive Cypress tests based on GitHub diffs and user interactions, with LLM-powered systems creating tests that verify functionality automatically.

Modern Testing Capabilities:
• **Real-Time Browser Testing**: JavaScript-based framework enabling live testing directly in the browser, handling complex user interactions, API validations, and UI testing seamlessly.
• **Cloud Scalability**: Cypress Cloud with AI-generated tests allows teams to scale automation efforts with parallel execution and cloud infrastructure for faster feedback cycles.
• **Multi-Environment Support**: Comprehensive testing across desktop, mobile, and API endpoints with consistent behavior validation.

Developer Experience:
• **Test Data Generation**: AI creates realistic datasets and dynamic, data-driven tests that simulate real-world user scenarios and edge cases.
• **Error Recovery Testing**: Intelligent simulation of network failures, timeouts, and system errors to test application resilience and recovery mechanisms.
• **Automated Workflows**: AI orchestrates complex multi-step testing workflows including login sequences, checkout processes, and user journey validations.

Cypress with AI integration represents the future of quality assurance, offering 80% faster test creation and maintenance while providing comprehensive coverage that traditional testing approaches cannot match.",
                'website_url' => 'https://www.cypress.io',
                'logo_url' => 'https://www.cypress.io/images/layouts/cypress-logo.svg',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'medium',
                    'monthlyPrice' => 75,
                    'details' => ['Free for open source', 'Team plan: $75/month']
                ],
                'features' => [
                    ['name' => 'E2E testing', 'description' => 'Complete end-to-end testing'],
                    ['name' => 'Visual testing', 'description' => 'Screenshot comparison'],
                    ['name' => 'CI/CD integration', 'description' => 'Seamless pipeline integration']
                ],
                'integration_type' => 'api',
                'status' => 'active',
                'categories' => ['testing-qa', 'devops-cicd'],
                'roles' => [
                    'qa' => ['relevance' => 0.98, 'use_cases' => ['E2E testing', 'Regression testing', 'Visual testing']],
                    'frontend' => ['relevance' => 0.70, 'use_cases' => ['Component testing', 'Integration testing']],
                    'backend' => ['relevance' => 0.50, 'use_cases' => ['API testing']],
                ]
            ],
            [
                'name' => 'Tabnine',
                'slug' => 'tabnine',
                'description' => 'AI code completion tool that learns from your codebase',
                'detailed_description' => "Tabnine stands as one of the most advanced AI coding assistants of 2025, serving over 1 million monthly users with privacy-focused, personalized code completion capabilities.

Core AI Features:
• **Context-Aware Completions**: Intelligently analyzes code context to provide relevant suggestions, understanding project nuances and coding patterns to eliminate repetitive typing and syntax errors.

• **Tabnine Chat**: Interactive AI assistant using natural language for test generation, code explanation, documentation creation, and personalized coding support directly within your IDE.

• **Comprehensive Language Support**: Supports over 600 programming languages and frameworks including Python, JavaScript, TypeScript, Java, Go, Rust, C++, and emerging technologies.

• **Team Learning**: Advanced AI models learn from team coding patterns and organizational best practices, providing suggestions aligned with internal coding standards and architectural decisions.

Privacy & Security Excellence:
• **Zero Data Retention**: Industry-leading privacy protection with no code storage or access, ensuring maximum intellectual property protection.
• **Private Deployment Options**: Available on SaaS, self-hosted VPC, or fully air-gapped on-premises installations for enterprise security requirements.
• **Local Processing**: Free tier runs entirely on local machines, maintaining complete code confidentiality.

Productivity Impact:
• **Performance Metrics**: Users report 50% faster coding speeds and 20% reduction in development time, with AI managing up to 90% of basic programming tasks.
• **IDE Integration**: Seamless integration with VS Code, JetBrains suite (IntelliJ, PyCharm, WebStorm), Vim, and other popular development environments.
• **Gartner Recognition**: Acknowledged in Gartner's Critical Capabilities for AI Code Assistants, demonstrating market leadership and reliability.

Enterprise Features:
Offering flexible pricing from free basic plans to enterprise solutions with custom AI model fine-tuning, admin tools, and integration with tools like Atlassian Jira and Confluence.

Tabnine represents the perfect balance of AI-powered productivity enhancement and privacy protection, making it essential for security-conscious development teams.",
                'website_url' => 'https://www.tabnine.com',
                'logo_url' => 'https://www.tabnine.com/wp-content/uploads/2021/07/tabnine-logo.png',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'low',
                    'monthlyPrice' => 12,
                    'details' => ['Free basic plan', 'Pro: $12/month']
                ],
                'features' => [
                    ['name' => 'Code completion', 'description' => 'Smart code suggestions'],
                    ['name' => 'Team learning', 'description' => 'Learns from team patterns'],
                    ['name' => 'Privacy focused', 'description' => 'Can run locally']
                ],
                'integration_type' => 'native',
                'status' => 'active',
                'categories' => ['code-generation'],
                'roles' => [
                    'frontend' => ['relevance' => 0.85, 'use_cases' => ['JavaScript/TypeScript completion']],
                    'backend' => ['relevance' => 0.85, 'use_cases' => ['API development', 'Database queries']],
                ]
            ],
            [
                'name' => 'Linear',
                'slug' => 'linear',
                'description' => 'Modern project management with AI-powered insights and automation',
                'detailed_description' => "Linear has established itself as the premier project management platform for modern development teams in 2025, combining elegant design with powerful AI-driven capabilities.

AI-Powered Features:
• **Linear for Agents**: Revolutionary AI agent integration allows teams to delegate work directly to AI assistants, from code generation to complex technical tasks, with agents working autonomously within the Linear ecosystem.

• **Cursor Agent Integration**: Seamless integration with Cursor AI enables automatic issue assignment, branch creation, PR drafting, and implementation completion using full issue context for intelligent development workflows.

• **Intelligent Task Creation**: AI generates tasks with contextually relevant descriptions based on project history and team patterns, providing automated real-time status updates across all team members.

• **Interactive AI Chat**: Built-in conversational AI for team collaboration, task management, and automated complex workflows using advanced ReAct decision-making patterns.

Project Management Excellence:
• **Lightning-Fast Interface**: Renowned for incredible speed, beautiful design, and seamless developer workflows, particularly with GitHub integration and automated CI/CD pipeline connections.

• **Visual Timeline Planning**: Dynamic roadmap planning with unified product timelines, strategic initiative alignment, and resource allocation optimization through AI-powered insights.

• **Advanced Initiatives**: Strategic project grouping that expresses company-wide priority streams, tracking progress across multiple teams and departments with intelligent reporting.

• **Hybrid Search**: Mobile and desktop search powered by semantic search engines that find comprehensive results beyond keyword matching, understanding context and intent.

Workflow Automation:
• **Template Intelligence**: Reusable templates for bug reports, user stories, and QA tasks with AI-suggested improvements based on team usage patterns.
• **Scheduled Automation**: Intelligent recurring task creation and workflow automation that adapts to team schedules and project cycles.
• **Critical Path Mapping**: AI-powered project dependency analysis and resource optimization for streamlined delivery timelines.

Linear represents the future of project management, where AI enhances human decision-making while maintaining focus on shipping quality products efficiently.",
                'website_url' => 'https://linear.app',
                'logo_url' => 'https://linear.app/static/icon.png',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'low',
                    'monthlyPrice' => 8,
                    'details' => ['Free up to 10 users', 'Standard: $8/user/month']
                ],
                'features' => [
                    ['name' => 'Issue tracking', 'description' => 'Smart issue management'],
                    ['name' => 'Roadmap planning', 'description' => 'AI-assisted planning'],
                    ['name' => 'Automation', 'description' => 'Workflow automation']
                ],
                'integration_type' => 'api',
                'status' => 'active',
                'categories' => ['project-management'],
                'roles' => [
                    'pm' => ['relevance' => 0.95, 'use_cases' => ['Sprint planning', 'Roadmap management']],
                    'owner' => ['relevance' => 0.90, 'use_cases' => ['Product planning', 'Team coordination']],
                    'frontend' => ['relevance' => 0.60, 'use_cases' => ['Task tracking']],
                    'backend' => ['relevance' => 0.60, 'use_cases' => ['Task tracking']],
                    'qa' => ['relevance' => 0.65, 'use_cases' => ['Bug tracking']],
                ]
            ],
            [
                'name' => 'SonarQube',
                'slug' => 'sonarqube',
                'description' => 'Code quality and security analysis platform with AI insights',
                'detailed_description' => "SonarQube has evolved into the definitive code quality and security analysis platform for 2025, incorporating cutting-edge AI capabilities specifically designed for modern development challenges.

AI Code Assurance Features:
• **AI Code Assurance**: Comprehensive analysis framework for AI-generated code, ensuring accountability and quality standards across all development practices. Teams can tag projects containing AI-generated code for specialized analysis workflows.

• **AI CodeFix**: Revolutionary one-click issue resolution powered by OpenAI's GPT-4o or custom Azure OpenAI models, providing intelligent fix suggestions that streamline developer workflows and accelerate issue remediation.

• **Automated AI Detection**: Automatically detects AI-generated code in GitHub projects using Copilot integration, alerting administrators to apply appropriate quality gates and security measures.

• **Quality Gate Enforcement**: Specialized quality gates optimized for AI-generated code ensure only code meeting strict quality and security standards reaches production.

Advanced Security Analysis:
• **Enhanced SAST Engine**: Full static application security testing with advanced taint analysis for Go and VB.NET, while rewritten JavaScript/TypeScript engines reduce false positives and detect complex data flow issues.

• **Comprehensive Secrets Detection**: Scans YAML/JSON configuration files using 400+ patterns, identifying credentials in infrastructure code that source-only scanners typically miss.

• **Continuous Dependency Scanning**: Real-time vulnerability notifications with machine-readable reports and customizable risk severity based on actual component usage patterns.

Compliance & Standards:
• **Multi-Standard Support**: Helps organizations comply with NIST SSDF, OWASP, CWE, STIG, and CASA security standards with automated reporting and remediation guidance.
• **Enterprise Governance**: Centralized policy management and automated compliance checking across all codebases, including open-source, developer-written, and AI-generated code.

Developer Experience:
• **Faster Analysis**: 2025.4 release delivers significantly improved analysis speed with enhanced coverage and stronger security detection capabilities.
• **Certification Badges**: Projects passing quality gates receive verification badges, demonstrating rigorous AI-ready analysis completion.

SonarQube represents the gold standard for maintaining code quality and security in the AI-enhanced development era.",
                'website_url' => 'https://www.sonarqube.org',
                'logo_url' => 'https://www.sonarqube.org/logos/index/sonarqube-logo.png',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'high',
                    'monthlyPrice' => 150,
                    'details' => ['Community Edition: Free', 'Enterprise: $150/month']
                ],
                'features' => [
                    ['name' => 'Code analysis', 'description' => 'Deep code quality analysis'],
                    ['name' => 'Security scanning', 'description' => 'Vulnerability detection'],
                    ['name' => 'Technical debt', 'description' => 'Debt calculation and tracking']
                ],
                'integration_type' => 'api',
                'status' => 'active',
                'categories' => ['code-review', 'security', 'devops-cicd'],
                'roles' => [
                    'backend' => ['relevance' => 0.90, 'use_cases' => ['Code quality', 'Security analysis']],
                    'frontend' => ['relevance' => 0.85, 'use_cases' => ['JavaScript analysis', 'Code standards']],
                    'qa' => ['relevance' => 0.80, 'use_cases' => ['Quality metrics', 'Bug prevention']],
                    'owner' => ['relevance' => 0.70, 'use_cases' => ['Quality oversight', 'Technical debt management']],
                ]
            ],
            [
                'name' => 'Postman',
                'slug' => 'postman',
                'description' => 'API development platform with AI-powered testing and documentation',
                'detailed_description' => "Postman has transformed into a comprehensive AI-powered API development ecosystem in 2025, extending far beyond traditional API testing into intelligent automation and agent-based development.

AI-Powered Development:
• **Postbot Assistant**: Advanced AI helper that accelerates common API workflows through natural language interactions, generating tests, creating documentation, and visualizing data with conversational commands.

• **Agent Mode**: Revolutionary AI-native assistant that automates design, testing, documentation, and monitoring through natural language inputs, executing complex workflows across Postman's entire suite.

• **AI Agent Builder**: Comprehensive toolkit for building, testing, and deploying production-ready AI agents powered by APIs from 18,000+ companies in the Postman API Network.

Intelligent Automation:
• **Auto-Documentation**: Generate comprehensive API documentation instantly, maintaining up-to-date specifications automatically as APIs evolve.

• **Smart Test Generation**: Create tests for individual requests or entire collections using natural language, with AI understanding API patterns and generating edge case validations.

• **Data Visualization**: Transform complex JSON responses into tables, charts, and graphs without manual parsing, making API analysis intuitive and actionable.

Enterprise AI Features:
• **Model Testing & Evaluation**: Experiment with AI models from OpenAI, Anthropic, Google, Cohere, and Meta, comparing responses, performance metrics, and token usage.

• **MCP Integration**: Leverage Anthropic's Model Context Protocol to turn APIs into callable agent tools, enhancing LLM capabilities with external information.

• **Privacy-First Approach**: Corporate data never trains third-party models, with inputs used only to enhance Postman's proprietary models for organizational needs.

Development Workflow:
• **Multi-Step Automation**: Create complex agent workflows using visual canvas interfaces, building reliable workflows powered by LLMs and API integrations.
• **Collection Management**: AI organizes and updates API collections with proper variable handling and reusable configurations.
• **Mock Server Intelligence**: Generate sophisticated mock APIs that adapt to development needs dynamically.

Postman 2025 represents the evolution of API development into an AI-enhanced platform where automation meets human creativity.",
                'website_url' => 'https://www.postman.com',
                'logo_url' => 'https://www.postman.com/assets/logos/postman-logo-stacked.svg',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'medium',
                    'monthlyPrice' => 29,
                    'details' => ['Free for 3 users', 'Team: $29/user/month']
                ],
                'features' => [
                    ['name' => 'API testing', 'description' => 'Comprehensive API testing'],
                    ['name' => 'Documentation', 'description' => 'Auto-generated API docs'],
                    ['name' => 'Mock servers', 'description' => 'Create mock APIs']
                ],
                'integration_type' => 'api',
                'status' => 'active',
                'categories' => ['testing-qa', 'documentation', 'devops-cicd'],
                'roles' => [
                    'backend' => ['relevance' => 0.95, 'use_cases' => ['API development', 'API testing']],
                    'frontend' => ['relevance' => 0.70, 'use_cases' => ['API integration', 'API testing']],
                    'qa' => ['relevance' => 0.85, 'use_cases' => ['API testing', 'Test automation']],
                ]
            ],
            [
                'name' => 'Claude',
                'slug' => 'claude',
                'description' => 'Advanced AI assistant for code review, documentation, and complex problem-solving',
                'detailed_description' => "Claude has established itself as the premier AI coding assistant for 2025, offering unparalleled code analysis, autonomous development capabilities, and intelligent problem-solving.

Cutting-Edge Model Performance:
• **Claude Opus 4 & Sonnet 4**: World-leading coding models with Opus 4 achieving 72.5% on SWE-bench and Sonnet 4 delivering 72.7% on industry benchmarks, representing state-of-the-art programming intelligence.

• **Advanced Reasoning**: Superior coding and reasoning capabilities with precise instruction following, extended memory functionality, and sophisticated understanding of complex codebases.

• **Parallel Tool Usage**: Enhanced ability to execute multiple tools simultaneously while maintaining context and delivering comprehensive solutions.

Claude Code Platform:
• **Autonomous Coding Agent**: Command-line tool that operates as a fully autonomous coding agent, understanding entire project contexts and executing complex development tasks independently.

• **IDE Integration**: Native support for VS Code, Cursor, JetBrains, and other popular editors with background tasks via GitHub Actions, displaying edits directly in files for seamless pair programming.

• **Custom Commands**: Store reusable prompt templates in .claude/commands folders, creating team-wide workflows for debugging, log analysis, and common development patterns.

Security & Code Review:
• **Automated Security Reviews**: Revolutionary /security-review command identifies vulnerabilities automatically, providing detailed explanations and implementing fixes directly within development workflows.

• **GitHub Integration**: Automatic PR reviews through /install-github-app command, with AI detecting logic errors and security issues that human reviewers often miss.

• **Test-Driven Development**: Generate comprehensive tests based on input/output specifications, following TDD principles to avoid mock implementations.

Advanced Capabilities:
• **Code Execution Tool**: Direct code execution capabilities with MCP connector integration and Files API access.
• **Prompt Caching**: Intelligent caching for up to one hour, optimizing performance for recurring development tasks.
• **Architecture Analysis**: Deep understanding of system design patterns and ability to provide sophisticated architectural guidance.

Claude represents the pinnacle of AI-assisted development, combining human-level code understanding with tireless execution capabilities.",
                'website_url' => 'https://claude.ai',
                'logo_url' => 'https://claude.ai/images/claude-logo.svg',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'medium',
                    'monthlyPrice' => 20,
                    'details' => ['Limited free tier', 'Pro: $20/month']
                ],
                'features' => [
                    ['name' => 'Code analysis', 'description' => 'Deep code understanding'],
                    ['name' => 'Documentation', 'description' => 'Generate comprehensive docs'],
                    ['name' => 'Refactoring', 'description' => 'Code improvement suggestions']
                ],
                'integration_type' => 'redirect',
                'status' => 'active',
                'categories' => ['code-generation', 'documentation', 'code-review'],
                'roles' => [
                    'frontend' => ['relevance' => 0.90, 'use_cases' => ['Code review', 'Component design']],
                    'backend' => ['relevance' => 0.92, 'use_cases' => ['Architecture design', 'Code optimization']],
                    'qa' => ['relevance' => 0.70, 'use_cases' => ['Test planning', 'Bug analysis']],
                    'pm' => ['relevance' => 0.75, 'use_cases' => ['Technical specs', 'Documentation']],
                    'owner' => ['relevance' => 0.80, 'use_cases' => ['Technical decisions', 'Strategy planning']],
                ]
            ],
            [
                'name' => 'DataDog',
                'slug' => 'datadog',
                'description' => 'Monitoring and analytics platform with AI-powered insights',
                'detailed_description' => "Datadog has evolved into the industry-leading observability platform for 2025, powered by advanced AI capabilities that provide comprehensive monitoring, analysis, and automation across modern infrastructure.

AI-Enhanced Observability:
• **Watchdog AI**: Autonomous anomaly detection engine that automatically identifies abnormal error rates, elevated latency, database performance issues, and cloud provider network problems without manual configuration.

• **Bits AI**: Revolutionary AI agents that accelerate root cause analysis through intelligent investigation, automated incident management, fix suggestions, and cross-system action execution.

• **LLM Observability**: Comprehensive monitoring for LLM-powered applications including chatbots, with capabilities to troubleshoot, evaluate quality, privacy, and safety of AI applications.

Advanced AI Capabilities (2025):
• **Agentic AI Monitoring**: End-to-end visibility for both in-house and third-party AI agents with specialized monitoring, rigorous testing capabilities, and centralized governance.

• **AI Agent Console**: Unified management interface for AI systems with experimentation tools and comprehensive agent performance analytics.

• **GPU Monitoring**: Real-time insights into GPU fleet health across cloud, on-premises, and GPU-as-a-Service platforms with allocation optimization and cost management.

Proactive Intelligence:
• **Proactive App Recommendations**: AI analyzes telemetry from APM, RUM, Continuous Profiler, and Database Monitoring to detect issues and propose actionable fixes automatically.

• **Machine Learning Integration**: Anomaly detection, forecasting, outlier identification, and automatic metric correlation enable intelligent monitoring of complex systems at scale.

• **Automated Pull Request Generation**: Direct integration with development workflows, creating pull requests for recommended fixes without leaving the Datadog environment.

Comprehensive Platform:
• **Application Performance Monitoring**: AI-powered code-level distributed tracing from browser/mobile applications to backend services and databases.
• **Five-Time Gartner Leader**: Recognized as a Leader in Gartner's Magic Quadrant for Observability Platforms for five consecutive years.
• **Holistic AI Approach**: Spanning LLM observability, foundation model research, and deep integrations with leading AI-native technologies.

Datadog represents the future of observability, where AI transforms reactive monitoring into proactive system optimization and intelligent automation.",
                'website_url' => 'https://www.datadoghq.com',
                'logo_url' => 'https://datadog-docs.imgix.net/images/dd_logo_n_70x75.png',
                'pricing_model' => [
                    'freeTier' => true,
                    'priceRange' => 'high',
                    'monthlyPrice' => 70,
                    'details' => ['Free trial', 'Pro: $70/host/month']
                ],
                'features' => [
                    ['name' => 'APM', 'description' => 'Application performance monitoring'],
                    ['name' => 'Log management', 'description' => 'Centralized logging'],
                    ['name' => 'Anomaly detection', 'description' => 'AI-powered alerts']
                ],
                'integration_type' => 'api',
                'status' => 'active',
                'categories' => ['devops-cicd', 'analytics', 'security'],
                'roles' => [
                    'backend' => ['relevance' => 0.90, 'use_cases' => ['Performance monitoring', 'Error tracking']],
                    'qa' => ['relevance' => 0.70, 'use_cases' => ['Performance testing', 'Issue tracking']],
                    'owner' => ['relevance' => 0.75, 'use_cases' => ['System health', 'Business metrics']],
                ]
            ],
        ];

        foreach ($aiTools as $toolData) {
            $categorySlugs = $toolData['categories'];
            $roleRelevance = $toolData['roles'];
            
            unset($toolData['categories']);
            unset($toolData['roles']);
            
            // Find the role with highest relevance for suggested_for_role
            $suggestedRole = null;
            $highestRelevance = 0;
            foreach ($roleRelevance as $roleName => $data) {
                if (isset($roles[$roleName]) && $data['relevance'] > $highestRelevance) {
                    $highestRelevance = $data['relevance'];
                    $suggestedRole = $roles[$roleName]->id;
                }
            }
            
            // Add UUID and user references
            $toolData['id'] = Str::uuid();
            $toolData['submitted_by'] = $admin->id;
            $toolData['approved_by'] = $admin->id;
            $toolData['suggested_for_role'] = $suggestedRole;
            
            // Create the tool
            $tool = AiTool::updateOrCreate(
                ['slug' => $toolData['slug']],
                $toolData
            );
            
            // Attach categories
            $categoryIds = [];
            foreach ($categorySlugs as $slug) {
                if (isset($categories[$slug])) {
                    $categoryIds[] = $categories[$slug]->id;
                }
            }
            $tool->categories()->sync($categoryIds);
            
            // Attach roles with relevance scores
            $roleData = [];
            foreach ($roleRelevance as $roleName => $data) {
                if (isset($roles[$roleName])) {
                    $roleData[$roles[$roleName]->id] = [
                        'relevance_score' => $data['relevance'],
                        'use_cases' => json_encode($data['use_cases'])
                    ];
                }
            }
            $tool->roles()->sync($roleData);
        }
    }
}