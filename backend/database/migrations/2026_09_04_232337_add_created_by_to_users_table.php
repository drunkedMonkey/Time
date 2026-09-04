<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        });

        // Backfill: attribute existing staff to the owner of their current business,
        // so they stay manageable/findable after this change.
        DB::statement(<<<'SQL'
            UPDATE users
            SET created_by = businesses.owner_id
            FROM businesses
            WHERE users.business_id = businesses.id
              AND users.role IN ('supervisor', 'employee')
              AND users.created_by IS NULL
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
        });
    }
};
