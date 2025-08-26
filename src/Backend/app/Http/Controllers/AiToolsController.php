<?php

namespace App\Http\Controllers;

use App\Models\AiTool;
use App\Models\Category;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiToolsController extends Controller
{
    public function index()
    {
        $roles = Role::all();
        $categories = Category::all();
        
        return view('ai-tools.index', compact('roles', 'categories'));
    }

    public function browse()
    {
        $user = auth()->user();
        $userRole = $user->role;
        
        // Get recommended tools for user's role (sorted by relevance)
        $recommendedTools = AiTool::active()
            ->with(['suggestedForRole', 'categories', 'roles'])
            ->whereHas('roles', function($query) use ($userRole) {
                $query->where('role_id', $userRole->id);
            })
            ->get()
            ->sortByDesc(function($tool) use ($userRole) {
                $roleData = $tool->roles->where('id', $userRole->id)->first();
                return $roleData ? $roleData->pivot->relevance_score : 0;
            });

        // Get all other active tools
        $allTools = AiTool::active()
            ->with(['suggestedForRole', 'categories'])
            ->get();

        $roles = Role::all();
        $categories = Category::all();

        return view('ai-tools.browse', compact('recommendedTools', 'allTools', 'userRole', 'roles', 'categories'));
    }

    public function show(AiTool $aiTool)
    {
        $aiTool->load(['suggestedForRole', 'categories', 'roles', 'submittedBy', 'ratings']);
        
        $userRole = auth()->user()->role;
        $relevanceForUser = null;
        
        if ($userRole) {
            $roleData = $aiTool->roles->where('id', $userRole->id)->first();
            $relevanceForUser = $roleData ? $roleData->pivot : null;
        }

        return view('ai-tools.show', compact('aiTool', 'userRole', 'relevanceForUser'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ai_tools,name',
            'website_url' => 'required|url|max:500',
            'description' => 'required|string',
            'suggested_for_role' => 'required|exists:roles,id',
            'categories' => 'required|array|min:1',
            'categories.*' => 'exists:categories,id',
            'documentation_url' => 'nullable|url|max:500',
            'logo_url' => 'nullable|url|max:500',
        ]);

        $tool = AiTool::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'website_url' => $validated['website_url'],
            'api_endpoint' => $validated['documentation_url'],
            'logo_url' => $validated['logo_url'],
            'suggested_for_role' => $validated['suggested_for_role'],
            'integration_type' => 'redirect',
            'status' => 'active',
            'submitted_by' => auth()->id(),
        ]);

        $tool->categories()->attach($validated['categories']);

        return redirect()->route('ai-tools.index')
            ->with('success', 'AI Tool added successfully! It is now available for everyone to discover.');
    }
}
