<?php

namespace App\Application\Business;

use App\Domain\Business\Business;
use App\Domain\Business\BusinessRepository;

class CreateBusiness
{
    public function __construct(private readonly BusinessRepository $businesses)
    {
    }

    public function handle(int $ownerId, string $name): Business
    {
        return $this->businesses->save(new Business(id: null, ownerId: $ownerId, name: $name));
    }
}
