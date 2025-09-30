const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
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
        // Check if email configuration is available
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email configuration missing. Skipping email send.');
            console.log('=== VERIFICATION TOKEN FOR TESTING ===');
            console.log('Email:', email);
            console.log('Verification Token:', verificationToken);
            console.log('Verification URL:', `${process.env.FRONTEND_URL || 'http://localhost:6000'}/verify-email?token=${verificationToken}`);
            console.log('=====================================');
            return { messageId: 'test-message-id' };
        }

        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:6000'}/verify-email?token=${verificationToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email - FindSinners System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p>Hello ${fullname},</p>
                    <p>Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                    </div>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 14px;">Best regards,<br>Online Tracking criminal System Team</p>
                </div>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Verification email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending verification email:', error.message);
            // Log the verification details for testing
            console.log('=== VERIFICATION TOKEN FOR TESTING ===');
            console.log('Email:', email);
            console.log('Verification Token:', verificationToken);
            console.log('Verification URL:', verifyUrl);
            console.log('=====================================');
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