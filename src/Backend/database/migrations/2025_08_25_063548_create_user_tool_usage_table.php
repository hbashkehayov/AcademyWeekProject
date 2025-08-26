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
        Schema::create('user_tool_usage', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users');
            $table->uuid('tool_id');
            $table->timestamp('last_used')->nullable();
            $table->integer('usage_frequency')->default(0);
            $table->boolean('is_favorite')->default(false);
            $table->text('custom_notes')->nullable();
            $table->timestamps();
            
            $table->foreign('tool_id')->references('id')->on('ai_tools')->onDelete('cascade');
            $table->unique(['user_id', 'tool_id']);
            $table->index('is_favorite');
            $table->index('usage_frequency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_tool_usage');
    }
};
