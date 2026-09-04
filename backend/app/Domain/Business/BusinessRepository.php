<?php

namespace App\Domain\Business;

interface BusinessRepository
{
    public function save(Business $business): Business;

    public function find(int $id): ?Business;

    /** @return Business[] */
    public function forOwner(int $ownerId): array;
}
