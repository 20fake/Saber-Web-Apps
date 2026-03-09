<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DeliveryController extends Controller
{
    public function store(Request $request, Order $order)
    {
        // Partner Only
        $user = Auth::user();
        if ($user->role !== 'partner') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->partner_id !== $user->id) {
            return response()->json(['message' => 'Order not assigned to user'], 403);
        }

        // Check if delivery already exists
        if ($order->delivery) {
             return response()->json(['message' => 'Delivery already started'], 400);
        }

        $delivery = Delivery::create([
            'order_id' => $order->id,
            'start_time' => now(),
        ]);
        
        $order->update(['status' => 'delivering']);

        return response()->json($delivery, 201);
    }

    public function update(Request $request, Delivery $delivery)
    {
        $user = Auth::user();
        if ($delivery->order->partner_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:completed',
            'proof_image' => 'nullable|image|max:10240',
        ]);

        if ($request->status === 'completed') {
            $updateData = ['end_time' => now()];

            if ($request->hasFile('proof_image')) {
                $path = $request->file('proof_image')->store('deliveries', 'public');
                $updateData['proof_image_url'] = Storage::url($path);
            }

            $delivery->update($updateData);
            $delivery->order->update(['status' => 'completed']);
        }

        return response()->json($delivery);
    }
}
