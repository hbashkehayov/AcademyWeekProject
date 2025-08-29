<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_ai_interactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('tool_id')->nullable()->constrained('ai_tools')->onDelete('set null');
            $table->enum('interaction_type', ['viewed', 'clicked', 'added', 'suggested_by_ai', 'favorited', 'rated']);
            $table->string('source')->default('dashboard'); // dashboard, ai_assistant, search, etc.
            $table->json('metadata')->nullable(); // Store additional context like AI assistant conversation ID, search query, etc.
            $table->integer('session_duration')->nullable(); // In seconds, for view interactions
            $table->decimal('rating', 3, 2)->nullable(); // For rating interactions
            $table->timestamp('created_at');
            $table->timestamp('updated_at');
            
            // Indexes for performance
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'interaction_type']);
            $table->index(['tool_id', 'interaction_type']);
            $table->index(['user_id', 'tool_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_ai_interactions');
    }
};