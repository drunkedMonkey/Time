<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Business\Business;
use App\Domain\Business\BusinessRepository;
use App\Infrastructure\Persistence\Eloquent\BusinessModel;

class EloquentBusinessRepository implements BusinessRepository
{
    public function save(Business $business): Business
    {
        $model = $business->id
            ? BusinessModel::findOrFail($business->id)
            : new BusinessModel();

        $model->fill([
            'owner_id' => $business->ownerId,
            'name' => $business->name,
        ])->save();

        return $this->toDomain($model);
    }

    public function find(int $id): ?Business
    {
        $model = BusinessModel::find($id);

        return $model ? $this->toDomain($model) : null;
    }

    public function delete(int $id): void
    {
        BusinessModel::destroy($id);
    }

    public function forOwner(int $ownerId): array
    {
        return BusinessModel::where('owner_id', $ownerId)
            ->get()
            ->map(fn (BusinessModel $model) => $this->toDomain($model))
            ->all();
    }

    private function toDomain(BusinessModel $model): Business
    {
        return new Business(
            id: $model->id,
            ownerId: $model->owner_id,
            name: $model->name,
        );
    }
}
