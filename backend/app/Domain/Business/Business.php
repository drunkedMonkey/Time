<?php

namespace App\Domain\Business;

final class Business
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $ownerId,
        public readonly string $name,
    ) {
    }
}
