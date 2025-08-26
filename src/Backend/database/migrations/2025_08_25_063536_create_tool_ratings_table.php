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
        Schema::create('tool_ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tool_id');
            $table->foreignId('user_id')->constrained('users');
            $table->integer('rating')->check('rating >= 1 AND rating <= 5');
            $table->text('review')->nullable();
            $table->timestamps();
            
            $table->foreign('tool_id')->references('id')->on('ai_tools')->onDelete('cascade');
            $table->unique(['tool_id', 'user_id']);
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_ratings');
    }
};
