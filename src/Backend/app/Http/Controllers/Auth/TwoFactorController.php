<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TwoFactorController extends Controller
{
    protected $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->twoFactorService = $twoFactorService;
    }

    /**
     * Setup 2FA method (TOTP or Email)
     */
    public function setupMethod(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'method' => 'required|string|in:totp,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($request->user_id);

        try {
            if ($request->method === 'totp') {
                // Setup TOTP (Google Authenticator)
                $twoFactorData = $this->twoFactorService->setupTwoFactorForUser($user);
                
                return response()->json([
                    'message' => 'TOTP setup initiated',
                    'method' => 'totp',
                    'two_factor' => [
                        'secret' => $twoFactorData['secret'],
                        'qr_code_url' => $twoFactorData['qr_code_url'],
                        'qr_code_image' => $twoFactorData['qr_code_image'],
                    ]
                ], 200);
            } else {
                // Setup Email - just send the verification code
                $this->twoFactorService->sendEmailToken($user);
                
                return response()->json([
                    'message' => 'Email verification code sent',
                    'method' => 'email'
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Complete 2FA setup during registration
     */
    public function completeSetup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'verification_code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($request->user_id);

        try {
            $result = $this->twoFactorService->completeTwoFactorSetup($user, $request->verification_code);
            
            return response()->json([
                'message' => '2FA setup completed successfully',
                'recovery_codes' => $result['recovery_codes'],
                'user' => $user->fresh()->load('role', 'organization')
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Send email verification code for 2FA
     */
    public function sendEmailCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        try {
            $this->twoFactorService->sendEmailToken($user);
            
            return response()->json([
                'message' => 'Verification code sent to your email',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verify 2FA code during login
     */
    public function verifyLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string',
            'method' => 'required|string|in:totp,email,recovery',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $isValid = $this->twoFactorService->verifyLoginCode($user, $request->code, $request->method);

        if (!$isValid) {
            return response()->json([
                'message' => 'Invalid verification code'
            ], 400);
        }

        // Clear email token if it was used
        if ($request->method === 'email') {
            $user->clearEmailToken();
        }

        // Log the user in
        Auth::login($user);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load('role', 'organization')
        ], 200);
    }

    /**
     * Check what 2FA methods are available for a user
     */
    public function getAvailableMethods(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $methods = $this->twoFactorService->getAvailableMethods($user);

        return response()->json([
            'methods' => $methods,
            'has_totp' => in_array('totp', $methods),
            'has_email' => in_array('email', $methods),
            'has_recovery' => in_array('recovery', $methods),
        ], 200);
    }

    /**
     * Verify email setup during registration
     */
    public function verifyEmailSetup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($request->user_id);

        if (!$this->twoFactorService->verifyEmailToken($user, $request->code)) {
            return response()->json([
                'message' => 'Invalid or expired verification code'
            ], 400);
        }

        // Enable email-based 2FA
        $user->two_factor_enabled = true;
        $user->two_factor_confirmed_at = now();
        $user->clearEmailToken();
        $user->save();

        return response()->json([
            'message' => 'Email verification completed successfully'
        ], 200);
    }

    /**
     * Skip 2FA setup
     */
    public function skipSetup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Just return success - user will continue without 2FA
        return response()->json([
            'message' => 'Security setup skipped'
        ], 200);
    }

    /**
     * Resend QR code for setup (if user lost it during registration)
     */
    public function resendQrCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($request->user_id);

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => '2FA is already enabled for this user'
            ], 400);
        }

        $secret = $user->getTwoFactorSecret();
        if (!$secret) {
            return response()->json([
                'message' => 'No 2FA setup in progress for this user'
            ], 400);
        }

        $qrCodeUrl = $this->twoFactorService->generateQrCodeUrl($user, $secret);
        $qrCodeImage = $this->twoFactorService->generateQrCodeImage($user, $secret);

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'qr_code_image' => $qrCodeImage,
        ], 200);
    }
}