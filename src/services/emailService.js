const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com',
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Verify connection configuration
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Gmail SMTP connection verified successfully');
        } catch (error) {
            console.error('❌ Gmail SMTP connection failed:', error.message);
            console.log('💡 Make sure you have:');
            console.log('   1. Enabled 2-factor authentication on your Gmail account');
            console.log('   2. Generated an App Password for this application');
            console.log('   3. Set EMAIL_PASS environment variable with the App Password');
        }
    }

    async sendWelcomeEmail(email, name) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Online Tracking criminal System',
            html: `
                <h1>Welcome ${name}!</h1>
                <p>Thank you for registering with Online Tracking criminal System.</p>
                <p>Your account has been successfully created.</p>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw error;
        }
    }

    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:6000'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Online Tracking criminal Syste',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You requested a password reset for your FindSinners System account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    </div>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 14px;">Best regards,<br>FindSinners System Team</p>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    }

    async sendVerificationEmail(email, verificationToken, fullname) {
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:6000'}/api/v1/auth/verify-email/${verificationToken}`;
        
        const mailOptions = {
            from: `"FindSinners System" <${process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com'}>`,
            to: email,
            subject: '🔐 Verify Your Email - FindSinners System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2c3e50; margin: 0;">🚔 FindSinners System</h1>
                            <p style="color: #7f8c8d; margin: 5px 0 0 0;">Criminal Tracking & Management</p>
                        </div>
                        
                        <h2 style="color: #2c3e50; margin-bottom: 20px;">Email Verification Required</h2>
                        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Hello <strong>${fullname}</strong>,</p>
                        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Thank you for registering with FindSinners System. To complete your registration and access your account, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">✅ Verify My Email</a>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="color: #155724; margin: 0; font-size: 14px;"><strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
                        </div>
                        
                        <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="color: #007bff; font-size: 12px; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">${verifyUrl}</p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">Best regards,<br><strong>FindSinners System Team</strong></p>
                    </div>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Verification email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('❌ Error sending verification email:', error.message);
            // Log the verification details for testing
            console.log('=== VERIFICATION TOKEN FOR TESTING ===');
            console.log('Email:', email);
            console.log('Verification Token:', verificationToken);
            console.log('Verification URL:', verifyUrl);
            console.log('=====================================');
            throw error;
        }
    }

    // Resend verification email
    async resendVerificationEmail(email, verificationToken, fullname) {
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:6000'}/api/v1/auth/verify-email/${verificationToken}`;
        
        const mailOptions = {
            from: `"FindSinners System" <${process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com'}>`,
            to: email,
            subject: '🔄 Resend: Verify Your Email - FindSinners System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2c3e50; margin: 0;">🚔 FindSinners System</h1>
                            <p style="color: #7f8c8d; margin: 5px 0 0 0;">Criminal Tracking & Management</p>
                        </div>
                        
                        <h2 style="color: #2c3e50; margin-bottom: 20px;">🔄 Email Verification (Resend)</h2>
                        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Hello <strong>${fullname}</strong>,</p>
                        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">You requested a new verification email. Please verify your email address by clicking the button below to complete your registration:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);">🔄 Verify My Email Now</a>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="color: #856404; margin: 0; font-size: 14px;"><strong>⚠️ Note:</strong> This is a resend of your verification email. The previous link may have expired.</p>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="color: #155724; margin: 0; font-size: 14px;"><strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
                        </div>
                        
                        <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="color: #007bff; font-size: 12px; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">${verifyUrl}</p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">Best regards,<br><strong>FindSinners System Team</strong></p>
                    </div>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Resend verification email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('❌ Error sending resend verification email:', error.message);
            throw error;
        }
    }

    async sendPasswordChangeNotification(email, fullname) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Changed - Online Tracking criminal System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Changed Successfully</h2>
                    <p>Hello ${fullname},</p>
                    <p>Your password has been changed successfully.</p>
                    <p>If you didn't make this change, please contact support immediately.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 14px;">Best regards,<br>FindSinners System Team</p>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Password change notification sent:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending password change notification:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();