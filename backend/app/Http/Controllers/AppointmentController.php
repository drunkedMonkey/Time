<?php

namespace App\Http\Controllers;

use App\Application\Appointment\BookAppointment;
use DateTimeImmutable;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function store(Request $request, BookAppointment $bookAppointment)
    {
        $data = $request->validate([
            'business_id' => ['required', 'integer', 'exists:businesses,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'channel' => ['required', 'in:whatsapp,call,manual'],
        ]);

        $appointment = $bookAppointment->handle(
            businessId: $data['business_id'],
            customerName: $data['customer_name'],
            customerPhone: $data['customer_phone'],
            startsAt: new DateTimeImmutable($data['starts_at']),
            endsAt: new DateTimeImmutable($data['ends_at']),
            channel: $data['channel'],
        );

        return response()->json($appointment, 201);
    }
}
