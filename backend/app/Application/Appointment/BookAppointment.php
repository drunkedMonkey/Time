<?php

namespace App\Application\Appointment;

use App\Domain\Appointment\Appointment;
use App\Domain\Appointment\AppointmentRepository;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

class BookAppointment
{
    public function __construct(private readonly AppointmentRepository $appointments)
    {
    }

    public function handle(
        int $businessId,
        string $customerName,
        string $customerPhone,
        DateTimeImmutable $startsAt,
        DateTimeImmutable $endsAt,
        string $channel,
    ): Appointment {
        return DB::transaction(fn () => $this->appointments->save(new Appointment(
            id: null,
            businessId: $businessId,
            customerName: $customerName,
            customerPhone: $customerPhone,
            startsAt: $startsAt,
            endsAt: $endsAt,
            channel: $channel,
        )));
    }
}
