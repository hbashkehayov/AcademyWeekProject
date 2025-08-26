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
        Schema::table('ai_tools', function (Blueprint $table) {
            $table->foreignId('suggested_for_role')->nullable()->constrained('roles');
            $table->index('suggested_for_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_tools', function (Blueprint $table) {
            $table->dropForeign(['suggested_for_role']);
            $table->dropIndex(['suggested_for_role']);
            $table->dropColumn('suggested_for_role');
        });
    }
};
