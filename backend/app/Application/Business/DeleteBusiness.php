<?php

namespace App\Application\Business;

use App\Domain\Business\BusinessRepository;

class DeleteBusiness
{
    public function __construct(private readonly BusinessRepository $businesses)
    {
    }

    public function handle(int $businessId): void
    {
        $this->businesses->delete($businessId);
    }
}
