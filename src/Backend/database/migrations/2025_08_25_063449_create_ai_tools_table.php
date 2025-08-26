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
        Schema::create('ai_tools', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('website_url', 500)->nullable();
            $table->string('api_endpoint', 500)->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->json('pricing_model')->nullable();
            $table->json('features')->nullable();
            $table->string('integration_type', 50)->default('redirect');
            $table->enum('status', ['active', 'pending', 'archived'])->default('pending');
            $table->foreignId('submitted_by')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->index('slug');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_tools');
    }
};
