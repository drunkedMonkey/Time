<?php

namespace App\Application\Business;

use App\Domain\Business\BusinessRepository;

class ListOwnedBusinesses
{
    public function __construct(private readonly BusinessRepository $businesses)
    {
    }

    /** @return \App\Domain\Business\Business[] */
    public function handle(int $ownerId): array
    {
        return $this->businesses->forOwner($ownerId);
    }
}
