<?php

namespace App\Domain\Appointment;

interface AppointmentRepository
{
    public function save(Appointment $appointment): Appointment;

    public function find(int $id): ?Appointment;

    /** @return Appointment[] */
    public function forBusiness(int $businessId): array;
}
