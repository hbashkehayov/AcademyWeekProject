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

        $apiKey = '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';
        
        if (!$apiKey) {
            return response()->json([
                'error' => 'Anthropic API key not configured'
            ], 500);
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

SPECIAL CAPABILITY - Adding New Tools:
When a user asks you to add a new AI tool (e.g., \"Can you add DeepSeek to the platform?\"):

1. Research the tool and provide details about:
   - Tool name and description
   - Website URL
   - Main features and capabilities
   - Suggested categories (from the list above)
   - Suggested user role
   - Pricing model (free, freemium, paid)

2. Format your response as a structured proposal with a special marker:
   [TOOL_PROPOSAL]
   {
     \"name\": \"Tool Name\",
     \"description\": \"Brief description\",
     \"website_url\": \"https://...\",
     \"features\": [\"feature1\", \"feature2\"],
     \"categories\": [\"Category1\", \"Category2\"],
     \"suggested_role\": \"role_name\",
     \"pricing_type\": \"freemium/free/paid\"
   }
   [/TOOL_PROPOSAL]

3. Then ask: \"I've prepared the information for [Tool Name]. Would you like me to add it to the platform? It will be marked as 'Pending Review' until approved by administrators.\"

4. If the user confirms, respond with: [CONFIRM_ADD_TOOL]

IMPORTANT: Always use the actual tool data provided above, not outdated or generic information.

Keep responses concise and relevant to the platform context.";

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
                'anthropic-version' => '2023-06-01',
            ])->post('https://api.anthropic.com/v1/messages', [
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
                    'body' => $response->body()
                ]);
                
                return response()->json([
                    'error' => 'Failed to get response from AI service',
                    'details' => $response->json()
                ], $response->status());
            }
        } catch (\Exception $e) {
            \Log::error('AI Assistant Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}