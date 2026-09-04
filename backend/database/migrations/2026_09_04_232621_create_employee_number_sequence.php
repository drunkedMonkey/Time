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
        // A dedicated auto-increment counter (not a users column) so employee
        // numbers keep incrementing even if a user row is later deleted.
        Schema::create('employee_number_counters', function (Blueprint $table) {
            $table->id();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_number_counters');
    }
};
