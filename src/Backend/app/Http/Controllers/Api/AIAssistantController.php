<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use App\Models\AiTool;
use App\Models\Category;
use App\Models\Role;

class AIAssistantController extends Controller
{
    /**
     * Research a tool from the internet
     */
    private function researchTool(string $toolName, string $website = null): array
    {
        try {
            $searchQuery = $website ? "site:{$website} {$toolName}" : "{$toolName} AI tool features pricing";
            
            // Try to fetch website content if URL is provided
            if ($website) {
                try {
                    $response = Http::timeout(10)
                        ->withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (compatible; ProjectAIWP-Bot/1.0)',
                            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        ])
                        ->get($website);
                    
                    if ($response->successful()) {
                        $html = $response->body();
                        
                        // Extract basic information from HTML
                        $title = '';
                        $description = '';
                        
                        // Extract title
                        if (preg_match('/<title[^>]*>(.*?)<\/title>/si', $html, $matches)) {
                            $title = strip_tags($matches[1]);
                            $title = html_entity_decode($title, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                        }
                        
                        // Extract meta description
                        if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i', $html, $matches)) {
                            $description = strip_tags($matches[1]);
                            $description = html_entity_decode($description, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                        }
                        
                        // Extract Open Graph description as fallback
                        if (empty($description) && preg_match('/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i', $html, $matches)) {
                            $description = strip_tags($matches[1]);
                            $description = html_entity_decode($description, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                        }
                        
                        // Extract pricing keywords
                        $pricingKeywords = [];
                        if (preg_match_all('/\b(free|freemium|premium|paid|subscription|\$\d+|\d+\/month|\d+\/year|pricing|plans?)\b/i', $html, $matches)) {
                            $pricingKeywords = array_unique(array_map('strtolower', $matches[0]));
                        }
                        
                        return [
                            'title' => $title ?: $toolName,
                            'description' => $description,
                            'website_url' => $website,
                            'pricing_keywords' => $pricingKeywords,
                            'researched' => true
                        ];
                    }
                } catch (\Exception $e) {
                    \Log::info('Tool research web fetch failed', [
                        'tool' => $toolName,
                        'website' => $website,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // Fallback: return basic structure
            return [
                'title' => $toolName,
                'description' => "AI tool for enhanced productivity and development workflow",
                'website_url' => $website,
                'pricing_keywords' => ['freemium'],
                'researched' => false
            ];
            
        } catch (\Exception $e) {
            \Log::error('Tool research error', [
                'tool' => $toolName,
                'error' => $e->getMessage()
            ]);
            
            return [
                'title' => $toolName,
                'description' => "AI tool",
                'website_url' => $website,
                'pricing_keywords' => ['freemium'],
                'researched' => false
            ];
        }
    }

    /**
     * Generate mock response for development/testing
     */
    private function getMockResponse(array $messages): string
    {
        $lastMessage = end($messages)['content'];
        
        // Check if user is asking about research or tool description
        if (preg_match('/(?:research|tell me about|describe|what is)\s+(.+?)(?:\s+tool|\s+AI|$)/i', $lastMessage, $matches)) {
            $toolName = trim($matches[1]);
            
            // Generate a mock detailed response for tool research
            return "🔍 **Research Results for {$toolName}**

Based on my research, {$toolName} is an advanced AI-powered development tool designed to enhance productivity and streamline workflows for developers.

**Key Features:**
- Advanced code generation and completion
- Intelligent code analysis and suggestions  
- Multi-language support for popular programming languages
- Integration with popular IDEs and editors
- Real-time collaboration capabilities

**Use Cases:**
- Accelerating development cycles
- Reducing repetitive coding tasks
- Improving code quality through AI suggestions
- Supporting learning and skill development

**Recommended for:** Frontend developers, Backend developers, and Full-stack developers

**Pricing:** Freemium model with basic features free and premium tiers available

[TOOL_PROPOSAL]
{
  \"name\": \"{$toolName}\",
  \"description\": \"Advanced AI-powered development tool for enhanced productivity and streamlined workflows.\",
  \"detailed_description\": \"This comprehensive AI tool provides intelligent code generation, analysis, and suggestions across multiple programming languages. It integrates seamlessly with popular IDEs and offers real-time collaboration features to accelerate development cycles and improve code quality.\",
  \"website_url\": \"https://" . strtolower(str_replace([' ', 'AI', 'Tool'], ['', '', ''], $toolName)) . ".com\",
  \"features\": [\"Code generation and completion\", \"Intelligent code analysis\", \"Multi-language support\", \"IDE integration\", \"Real-time collaboration\"],
  \"categories\": [\"Code Generation\", \"DevOps & CI/CD\"],
  \"suggested_role\": \"backend\",
  \"pricing_type\": \"freemium\",
  \"integration_type\": \"api\"
}
[/TOOL_PROPOSAL]

I've prepared the information for {$toolName}. Would you like me to add it to the platform? It will be marked as 'Pending Review' until approved by administrators.";
        }
        
        // Check if asking about adding a tool
        if (preg_match('/(?:add|submit)\s+(.+?)(?:\s+tool|\s+to|\s+platform)/i', $lastMessage)) {
            return "I'd be happy to help you add a new AI tool to the platform! Please provide me with the tool name and I'll research it for you, or you can give me specific details like:

- Tool name and website URL
- Brief description of what it does  
- Key features and capabilities
- Target user roles (Frontend, Backend, QA, etc.)
- Pricing model

Just say something like 'Research [Tool Name]' and I'll gather comprehensive information from the internet.";
        }
        
        // General platform help
        if (preg_match('/(?:help|how|what|platform|features)/i', $lastMessage)) {
            return "I'm here to help you with ProjectAIWP! Here's what I can assist you with:

🔍 **AI Tool Research** - I can research any AI tool from the internet and provide detailed descriptions, features, pricing, and use cases.

📝 **Tool Recommendations** - Based on your role (Frontend, Backend, QA, Designer, PM, Owner), I can suggest the best AI tools for your workflow.

➕ **Add New Tools** - I can research and add new AI tools to the platform. Just ask me to research a tool and I'll gather all the details.

🗂️ **Browse Platform** - Learn about the " . AiTool::count() . " AI tools currently available, organized by categories like Code Generation, Testing & QA, Design Tools, etc.

Try asking me: 'Research DeepSeek Coder' or 'What tools are good for frontend developers?'";
        }
        
        // Default response
        return "I'm your AI assistant for ProjectAIWP! I can help you research AI tools, get recommendations based on your role, add new tools to the platform, and navigate our features. What would you like to know about?";
    }

    /**
     * Submit a tool through AI Assistant
     */
    public function submitTool(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tool_data' => 'required|array',
            'tool_data.name' => 'required|string',
            'tool_data.description' => 'required|string',
            'tool_data.website_url' => 'required|url',
            'tool_data.categories' => 'array',
            'tool_data.suggested_role' => 'string',
        ]);

        try {
            // Create the tool with pending status
            $tool = AiTool::create([
                'name' => $validated['tool_data']['name'],
                'description' => $validated['tool_data']['description'],
                'website_url' => $validated['tool_data']['website_url'],
                'api_endpoint' => $validated['tool_data']['api_endpoint'] ?? null,
                'logo_url' => $validated['tool_data']['logo_url'] ?? null,
                'pricing_model' => $validated['tool_data']['pricing_model'] ?? ['type' => 'freemium'],
                'features' => $validated['tool_data']['features'] ?? [],
                'integration_type' => $validated['tool_data']['integration_type'] ?? 'redirect',
                'status' => 'pending',
                'submitted_by' => null, // AI Assistant submission
                'suggested_for_role' => $validated['tool_data']['suggested_role_id'] ?? null,
            ]);

            // Attach categories if provided
            if (!empty($validated['tool_data']['category_ids'])) {
                $tool->categories()->attach($validated['tool_data']['category_ids']);
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully added {$tool->name} to the platform (pending review)",
                'tool' => $tool->load(['categories', 'suggestedForRole'])
            ]);
        } catch (\Exception $e) {
            \Log::error('AI Assistant Tool Submission Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to submit tool',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Chat with AI Assistant
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|in:user,assistant',
            'messages.*.content' => 'required|string',
        ]);

        $apiKey = env('ANTHROPIC_API_KEY');
        
        if (!$apiKey) {
            // Fallback to a mock response for development
            return response()->json([
                'success' => true,
                'content' => $this->getMockResponse($validated['messages'])
            ]);
        }

        // Load current platform data
        try {
            $tools = AiTool::with(['categories', 'roles', 'suggestedForRole'])
                ->whereIn('status', ['active', 'pending'])
                ->get();
            
            $categories = Category::all();
            $roles = Role::all();
            
            // Build dynamic tool information
            $toolsList = $tools->map(function ($tool) {
                $status = $tool->status === 'pending' ? ' (Pending Review)' : '';
                $categories = $tool->categories->pluck('name')->join(', ');
                $suggestedRole = $tool->suggestedForRole ? $tool->suggestedForRole->name : 'General';
                
                return "- {$tool->name}{$status}: {$tool->description} (Categories: {$categories}, Suggested for: {$suggestedRole})";
            })->join("\n");
            
            $categoriesList = $categories->pluck('name')->join(', ');
            $rolesList = $roles->pluck('name')->join(', ');
            
        } catch (\Exception $e) {
            // Fallback if database is not available
            $toolsList = "- GitHub Copilot, ChatGPT, Figma AI, and other popular AI tools";
            $categoriesList = "Code Generation, Testing & QA, Design Tools, etc.";
            $rolesList = "Frontend, Backend, QA, Designer, PM, Owner";
        }

        // Detect if user is asking about researching or adding a tool
        $userMessage = end($validated['messages'])['content'];
        $isResearchRequest = preg_match('/(?:research|tell me about|describe|what is|add|find)\s+(.+?)(?:\s+tool|\s+AI|$)/i', $userMessage, $matches);
        
        $researchData = null;
        if ($isResearchRequest) {
            $toolName = trim($matches[1]);
            // Check if user provided a website URL
            $websiteMatch = null;
            if (preg_match('/https?:\/\/[^\s]+/i', $userMessage, $urlMatch)) {
                $websiteMatch = $urlMatch[0];
            }
            
            $researchData = $this->researchTool($toolName, $websiteMatch);
        }

        $systemPrompt = "You are an AI assistant for ProjectAIWP, an AI tools recommendation platform.

The platform helps developers find AI tools based on their roles.

CURRENT PLATFORM DATA:

Available AI Tools:
{$toolsList}

Available Categories: {$categoriesList}

User Roles: {$rolesList}

Key features of the platform:
- Role-based AI tool recommendations
- Tool categorization and filtering
- User favorites and usage tracking  
- Tool ratings and reviews
- Multi-tenant architecture with organizations
- Users can submit new tools (marked as Pending until reviewed)

Your role is to:
1. Help users understand how to use the platform
2. Provide information about the ACTUAL AI tools currently available in the platform
3. Give recommendations based on user roles using the real tool data
4. Explain platform features and how to navigate them
5. When users ask about tools, reference the actual tools listed above
6. If tools are marked as 'Pending Review', explain they are awaiting approval

ENHANCED CAPABILITY - AI Tool Research & Description Generation:
When users ask you to research, describe, or add AI tools:

1. I can automatically research tools from the internet to provide detailed descriptions
2. I extract information like features, pricing, and use cases from official websites
3. I generate comprehensive tool descriptions with proper categorization

When adding new tools, follow this enhanced process:

1. Use any research data provided to create detailed descriptions
2. Categorize tools based on their actual functionality
3. Suggest appropriate user roles based on tool capabilities
4. Provide pricing information when available

RESEARCH DATA (if available for current query):
" . ($researchData ? json_encode($researchData, JSON_PRETTY_PRINT) : 'None') . "

Format tool proposals as:
[TOOL_PROPOSAL]
{
  \"name\": \"Actual Tool Name\",
  \"description\": \"Detailed description based on research (2-3 sentences)\",
  \"detailed_description\": \"Comprehensive description including key features, use cases, and benefits (4-5 sentences)\",
  \"website_url\": \"https://...\",
  \"features\": [\"specific feature 1\", \"specific feature 2\", \"specific feature 3\"],
  \"categories\": [\"Category1\", \"Category2\"],
  \"suggested_role\": \"most appropriate role\",
  \"pricing_type\": \"free/freemium/paid\",
  \"integration_type\": \"api/redirect/extension\"
}
[/TOOL_PROPOSAL]

When users ask for tool descriptions without adding them:
- Provide detailed information about features, use cases, pricing
- Explain how it would fit into different development workflows
- Suggest which roles would benefit most from the tool
- Include any relevant technical specifications or requirements

IMPORTANT: 
- Use research data when available to provide accurate, up-to-date information
- Always be specific about tool capabilities and limitations
- For existing platform tools, use the actual data provided above
- Keep responses informative but concise

When confirming tool additions, respond with: [CONFIRM_ADD_TOOL]";

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                    'anthropic-version' => '2023-06-01',
                ])
                ->post('https://api.anthropic.com/v1/messages', [
                    'model' => 'claude-3-haiku-20240307',
                    'max_tokens' => 1000,
                    'temperature' => 0.7,
                    'system' => $systemPrompt,
                    'messages' => $validated['messages']
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'success' => true,
                    'content' => $data['content'][0]['text'] ?? 'No response content'
                ]);
            } else {
                \Log::error('Anthropic API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'headers' => $response->headers()
                ]);
                
                // Fallback to mock response if API fails
                return response()->json([
                    'success' => true,
                    'content' => $this->getMockResponse($validated['messages'])
                ]);
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            \Log::warning('Anthropic API Connection Failed, using fallback', [
                'message' => $e->getMessage()
            ]);
            
            // Use mock response when API is unavailable
            return response()->json([
                'success' => true,
                'content' => $this->getMockResponse($validated['messages'])
            ]);
        } catch (\Exception $e) {
            \Log::error('AI Assistant Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Fallback to mock response for any other errors
            return response()->json([
                'success' => true,
                'content' => $this->getMockResponse($validated['messages'])
            ]);
        }
    }
}