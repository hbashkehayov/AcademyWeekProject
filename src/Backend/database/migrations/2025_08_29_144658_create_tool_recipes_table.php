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
        Schema::create('tool_recipes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description');
            $table->text('goal');
            $table->json('steps'); // [{"step": 1, "tool_id": "...", "instruction": "...", "tool_name": "..."}]
            $table->integer('estimated_time')->nullable(); // in minutes
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->uuid('created_by');
            $table->integer('uses_count')->default(0);
            $table->float('success_rate', 3, 2)->default(0.0); // 0.00 to 100.00
            $table->json('tags')->nullable(); // ["content", "social-media", "marketing"]
            $table->enum('status', ['active', 'draft', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->json('categories')->nullable(); // Related to AI tool categories
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            // Indexes
            $table->index(['status', 'is_featured']);
            $table->index('difficulty');
            $table->index('success_rate');
            $table->index('uses_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_recipes');
    }
};
