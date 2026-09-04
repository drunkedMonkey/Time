<?php

namespace App\Domain\Appointment;

use DateTimeImmutable;

final class Appointment
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $businessId,
        public readonly string $customerName,
        public readonly string $customerPhone,
        public readonly DateTimeImmutable $startsAt,
        public readonly DateTimeImmutable $endsAt,
        public readonly string $channel,
        public readonly string $status = 'scheduled',
    ) {
    }
}
