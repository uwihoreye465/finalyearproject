const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
    this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
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
            subject: 'Welcome to FindSinners System',
            html: `
                <h1>Welcome ${name}!</h1>
                <p>Thank you for registering with FindSinners System.</p>
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
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>You requested a password reset for your FindSinners System account.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
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

    async sendVerificationEmail(email, verificationToken) {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            html: `
                <h1>Email Verification</h1>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verifyUrl}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Verification email sent:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();