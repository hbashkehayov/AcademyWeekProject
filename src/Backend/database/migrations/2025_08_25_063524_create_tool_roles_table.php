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
        Schema::create('tool_roles', function (Blueprint $table) {
            $table->uuid('tool_id');
            $table->foreignId('role_id')->constrained('roles');
            $table->decimal('relevance_score', 3, 2)->default(0.50);
            $table->json('use_cases')->nullable();
            $table->primary(['tool_id', 'role_id']);
            
            $table->foreign('tool_id')->references('id')->on('ai_tools')->onDelete('cascade');
            $table->index('relevance_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_roles');
    }
};
