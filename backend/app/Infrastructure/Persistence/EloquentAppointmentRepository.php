<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Appointment\Appointment;
use App\Domain\Appointment\AppointmentRepository;
use App\Infrastructure\Persistence\Eloquent\AppointmentModel;
use DateTimeImmutable;

class EloquentAppointmentRepository implements AppointmentRepository
{
    public function save(Appointment $appointment): Appointment
    {
        $model = $appointment->id
            ? AppointmentModel::findOrFail($appointment->id)
            : new AppointmentModel();

        $model->fill([
            'business_id' => $appointment->businessId,
            'customer_name' => $appointment->customerName,
            'customer_phone' => $appointment->customerPhone,
            'starts_at' => $appointment->startsAt,
            'ends_at' => $appointment->endsAt,
            'channel' => $appointment->channel,
            'status' => $appointment->status,
        ])->save();

        return $this->toDomain($model);
    }

    public function find(int $id): ?Appointment
    {
        $model = AppointmentModel::find($id);

        return $model ? $this->toDomain($model) : null;
    }

    public function forBusiness(int $businessId): array
    {
        return AppointmentModel::where('business_id', $businessId)
            ->get()
            ->map(fn (AppointmentModel $model) => $this->toDomain($model))
            ->all();
    }

    private function toDomain(AppointmentModel $model): Appointment
    {
        return new Appointment(
            id: $model->id,
            businessId: $model->business_id,
            customerName: $model->customer_name,
            customerPhone: $model->customer_phone,
            startsAt: DateTimeImmutable::createFromInterface($model->starts_at),
            endsAt: DateTimeImmutable::createFromInterface($model->ends_at),
            channel: $model->channel,
            status: $model->status,
        );
    }
}
