<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyOtpController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user->otp_code || $user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid OTP code.'], 422);
        }

        if ($user->otp_expires_at && now()->greaterThan($user->otp_expires_at)) {
             return response()->json(['message' => 'OTP code has expired.'], 422);
        }

        // Clear OTP
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->email_verified_at = now();
        $user->save();

        // Login user
        Auth::login($user);

        return response()->json([
            'status' => 'verified',
            'user' => $user,
            'role' => $user->role // Pass role for redirection
        ]);
    }
}
