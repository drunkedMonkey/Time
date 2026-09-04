<?php

namespace App\Infrastructure\Persistence\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentModel extends Model
{
    protected $table = 'appointments';

    protected $fillable = [
        'business_id',
        'customer_name',
        'customer_phone',
        'starts_at',
        'ends_at',
        'channel',
        'status',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(BusinessModel::class, 'business_id');
    }
}
