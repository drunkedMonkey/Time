<?php

namespace App\Providers;

use App\Domain\Appointment\AppointmentRepository;
use App\Domain\Business\BusinessRepository;
use App\Infrastructure\Persistence\EloquentAppointmentRepository;
use App\Infrastructure\Persistence\EloquentBusinessRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(BusinessRepository::class, EloquentBusinessRepository::class);
        $this->app->bind(AppointmentRepository::class, EloquentAppointmentRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
