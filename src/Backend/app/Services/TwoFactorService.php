<?php

namespace App\Services;

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorService
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Generate a secret key for 2FA
     */
    public function generateSecretKey(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * Generate QR code URL for Google Authenticator
     */
    public function generateQrCodeUrl(User $user, string $secret): string
    {
        $appName = config('app.name', 'AI Tools Platform');
        $email = $user->email;
        
        return $this->google2fa->getQRCodeUrl(
            $appName,
            $email,
            $secret
        );
    }

    /**
     * Generate QR code as base64 image
     */
    public function generateQrCodeImage(User $user, string $secret): string
    {
        $qrCodeUrl = $this->generateQrCodeUrl($user, $secret);
        
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        
        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrCodeUrl);
        
        return 'data:image/svg+xml;base64,' . base64_encode($qrCodeSvg);
    }

    /**
     * Verify TOTP code from Google Authenticator
     */
    public function verifyKey(string $secret, string $key): bool
    {
        return $this->google2fa->verifyKey($secret, $key);
    }

    /**
     * Send email verification code
     */
    public function sendEmailToken(User $user): string
    {
        $token = $user->generateEmailToken();
        
        try {
            // Send email with verification code
            Mail::send('emails.two-factor-code', ['token' => $token, 'user' => $user], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Your Two-Factor Authentication Code');
            });
            
            Log::info("2FA email sent to user {$user->id} ({$user->email})");
        } catch (\Exception $e) {
            Log::error("Failed to send 2FA email to user {$user->id}: " . $e->getMessage());
            throw new \Exception('Failed to send verification email. Please try again.');
        }
        
        return $token;
    }

    /**
     * Verify email token
     */
    public function verifyEmailToken(User $user, string $token): bool
    {
        return $user->isEmailTokenValid($token);
    }

    /**
     * Verify recovery code
     */
    public function verifyRecoveryCode(User $user, string $code): bool
    {
        $recoveryCodes = $user->two_factor_recovery_codes ?? [];
        
        if (in_array($code, $recoveryCodes)) {
            // Remove used recovery code
            $recoveryCodes = array_diff($recoveryCodes, [$code]);
            $user->two_factor_recovery_codes = array_values($recoveryCodes);
            $user->save();
            
            return true;
        }
        
        return false;
    }

    /**
     * Setup 2FA for user during registration
     */
    public function setupTwoFactorForUser(User $user): array
    {
        $secret = $this->generateSecretKey();
        $qrCodeUrl = $this->generateQrCodeUrl($user, $secret);
        $qrCodeImage = $this->generateQrCodeImage($user, $secret);
        
        // Store temporary secret (not enabled until verified)
        $user->two_factor_secret = encrypt($secret);
        $user->save();
        
        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'qr_code_image' => $qrCodeImage,
        ];
    }

    /**
     * Complete 2FA setup after verification
     */
    public function completeTwoFactorSetup(User $user, string $verificationCode): array
    {
        $secret = $user->getTwoFactorSecret();
        
        if (!$secret) {
            throw new \Exception('No 2FA setup in progress');
        }
        
        if (!$this->verifyKey($secret, $verificationCode)) {
            throw new \Exception('Invalid verification code');
        }
        
        // Enable 2FA and generate recovery codes
        $recoveryCodes = $user->enableTwoFactor($secret);
        
        return [
            'recovery_codes' => $recoveryCodes
        ];
    }

    /**
     * Verify 2FA during login (supports both TOTP and email)
     */
    public function verifyLoginCode(User $user, string $code, string $method = 'totp'): bool
    {
        switch ($method) {
            case 'totp':
                $secret = $user->getTwoFactorSecret();
                return $secret && $this->verifyKey($secret, $code);
                
            case 'email':
                return $this->verifyEmailToken($user, $code);
                
            case 'recovery':
                return $this->verifyRecoveryCode($user, $code);
                
            default:
                return false;
        }
    }

    /**
     * Get available 2FA methods for user
     */
    public function getAvailableMethods(User $user): array
    {
        $methods = [];
        
        if ($user->hasTwoFactorEnabled()) {
            $methods[] = 'totp';
        }
        
        // Email method is always available
        $methods[] = 'email';
        
        // Recovery codes available if user has them
        if (!empty($user->two_factor_recovery_codes)) {
            $methods[] = 'recovery';
        }
        
        return $methods;
    }
}