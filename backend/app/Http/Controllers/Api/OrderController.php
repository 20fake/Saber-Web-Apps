<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role === 'client') {
            $orders = Order::where('client_id', $user->id)
                ->with(['delivery'])
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user->role === 'partner') {
            // Partners see their accepted orders AND pending orders available for pickup
            $orders = Order::where('partner_id', $user->id)
                ->orWhere('status', 'pending')
                ->with(['client', 'delivery']) // Eager load client info
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Admin
            $orders = Order::with(['client', 'partner', 'delivery'])->get();
        }

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pickup_location' => 'required|string',
            'delivery_location' => 'required|string',
            'details' => 'nullable|string',
        ]);

        $order = Order::create([
            'client_id' => Auth::id(),
            'status' => 'pending',
            'pickup_location' => $request->pickup_location,
            'delivery_location' => $request->delivery_location,
            'details' => $request->details,
        ]);

        return response()->json($order, 201);
    }

    public function show(Order $order)
    {
        // Authorization check
        $user = Auth::user();
        if ($user->role === 'client' && $order->client_id !== $user->id) {
            abort(403);
        }
        if ($user->role === 'partner' && $order->partner_id !== $user->id && $order->status !== 'pending') {
            abort(403);
        }

        return response()->json($order->load(['client', 'partner', 'delivery']));
    }

    public function update(Request $request, Order $order)
    {
        $user = Auth::user();
        $request->validate([
            'status' => 'required|in:pending,confirmed,pickup,delivering,completed,cancelled',
        ]);

        // Partner accepting an order
        if ($user->role === 'partner' && $request->status === 'confirmed' && $order->status === 'pending') {
            $order->update([
                'status' => 'confirmed',
                'partner_id' => $user->id,
            ]);
            return response()->json($order);
        }

        // Logic for other status updates (managed by Partner or Client cancelling)
        // For simplicity allow partner to update status if they own the order
        if ($user->role === 'partner' && $order->partner_id === $user->id) {
            $order->update(['status' => $request->status]);
            return response()->json($order);
        }

        if ($user->role === 'client' && $order->client_id === $user->id && $request->status === 'cancelled') {
             $order->update(['status' => 'cancelled']);
             return response()->json($order);
        }

        return response()->json(['message' => 'Unauthorized status change'], 403);
    }
}
