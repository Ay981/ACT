<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
// TEMPORARILY DISABLED FOR PRESENTATION - UNCOMMENT AFTER
// use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

// TEMPORARILY DISABLED FOR PRESENTATION - UNCOMMENT AFTER
// use Illuminate\Support\Facades\Mail;
// use App\Mail\OtpMail;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $start = microtime(true);
        
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['nullable', 'string', 'in:student,instructor,admin'],
        ]);
        
        \Log::info('Validation took: ' . (microtime(true) - $start) . ' seconds');

        $otp = rand(100000, 999999);

        $userStart = microtime(true);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Changed from $request->string('password')
            'role' => $request->role ?? 'student',
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);
        \Log::info('User creation took: ' . (microtime(true) - $userStart) . ' seconds');

        // TEMPORARILY DISABLED FOR PRESENTATION - UNCOMMENT AFTER
        // event(new Registered($user));

        // FORCE MAIL TO USE ARRAY DRIVER FOR PRESENTATION (INSTANT)
        \Config::set('mail.default', 'array');
        
        // COMPLETELY SKIP EMAIL FOR PRESENTATION
        // try {
        //     // Send email immediately (not queued)
        //     // TEMPORARILY DISABLED FOR PRESENTATION - UNCOMMENT AFTER
        //     // Mail::to($user->email)->send(new OtpMail($otp));
        //     // \Log::info('OTP email sent successfully to: ' . $user->email);
        //     \Log::info('OTP email SKIPPED for presentation to: ' . $user->email);
        // } catch (\Exception $e) {
        //     \Illuminate\Support\Facades\Log::error('OTP Mail Error: ' . $e->getMessage());
        //     \Log::error('Mail config: ' . json_encode([
        //         'host' => config('mail.mailers.smtp.host'),
        //         'port' => config('mail.mailers.smtp.port'),
        //         'from' => config('mail.from.address')
        //     ]));
        //     // Fallback: return OTP in response for testing
        //     return response()->json([
        //         'status' => 'otp_sent',
        //         'message' => 'Email failed. Your OTP is: ' . $otp . ' Error: ' . $e->getMessage(), 
        //         'email' => $user->email,
        //         'otp' => $otp // Include OTP for testing
        //     ]);
        // }

        // Do not login immediately
        // Auth::login($user);

        $responseStart = microtime(true);
        $response = response()->json([
            'status' => 'otp_sent',
            'message' => 'Please check your email for the verification code.', 
            'email' => $user->email,
            'otp' => $otp // Always include OTP for testing
        ]);
        \Log::info('Response creation took: ' . (microtime(true) - $responseStart) . ' seconds');
        \Log::info('TOTAL REQUEST took: ' . (microtime(true) - $start) . ' seconds');
        
        return $response;
    }
}
