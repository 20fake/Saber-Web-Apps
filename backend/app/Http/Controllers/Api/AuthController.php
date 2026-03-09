<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'in:client,partner', // Optional, default to client
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'client',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function verifyId(Request $request)
    {
        $request->validate([
            'id_image' => 'required|image|max:10240', // Max 10MB
        ]);

        $user = $request->user();

        if ($request->hasFile('id_image')) {
            $path = $request->file('id_image')->store('id_images', 'public');
            $url = Storage::url($path);

            $user->id_image_url = $url;
            
            // Mock AI Validation Service
            // In production, send $path to Python service or API
            $isReal = $this->mockAiValidation($path);
            
            $user->is_verified = $isReal;
            $user->save();

            return response()->json([
                'message' => $isReal ? 'ID Verified successfully' : 'ID Validation failed. Image appears edited.',
                'is_verified' => $isReal,
                'id_image_url' => $url
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 400);
    }

    private function mockAiValidation($imagePath)
    {
        // Simple mock: if filename contains "fake", return false. 
        // Otherwise return true with 90% probability.
        // For demo purposes, we can assume it always passes unless specified.
        return true; 
    }
}
