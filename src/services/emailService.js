const nodemailer = require('nodemailer');
const { Resend } = require('resend');

class EmailService {
    constructor() {
        this.isConnected = false;
        this.useResend = process.env.USE_RESEND === 'true' || process.env.RESEND_API_KEY;
        
        // Try Gmail SMTP first, fallback to Resend
        if (!this.useResend) {
            this.setupGmailSMTP();
        } else {
            this.setupResend();
        }
        
        // Verify connection configuration (non-blocking)
        this.verifyConnection();
    }

    setupGmailSMTP() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com',
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            },
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000,   // 30 seconds
            socketTimeout: 60000,     // 60 seconds
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 20000,
            rateLimit: 5
        });
    }

    setupResend() {
        console.log('📧 Using Resend email service');
        this.resend = new Resend(process.env.RESEND_API_KEY || 're_G6cQaYBW_BpZQH9SmgHiQrHoMzuHSnxAc');
        this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    }

    async verifyConnection() {
        try {
            if (this.useResend) {
                // Test Resend API by sending a test email
                const testResult = await this.resend.emails.send({
                    from: this.fromEmail,
                    to: 'test@example.com',
                    subject: 'Test Connection',
                    html: '<p>Test</p>'
                });
                this.isConnected = true;
                console.log('✅ Resend API connection verified successfully');
            } else {
                await this.transporter.verify();
                this.isConnected = true;
                console.log('✅ Gmail SMTP connection verified successfully');
            }
        } catch (error) {
            this.isConnected = false;
            console.error('❌ Email service connection failed:', error.message);
            
            if (this.useResend) {
                console.log('💡 Resend setup:');
                console.log('   1. Get API key from: https://resend.com/api-keys');
                console.log('   2. Set RESEND_API_KEY environment variable');
                console.log('   3. Set RESEND_FROM_EMAIL environment variable');
            } else {
                console.log('💡 Gmail SMTP setup:');
                console.log('   1. Enabled 2-factor authentication on your Gmail account');
                console.log('   2. Generated an App Password for this application');
                console.log('   3. Set EMAIL_PASS environment variable with the App Password');
                console.log('   4. Check your .env file has EMAIL_PASS set correctly');
            }
        }
    }

    async sendEmailViaResend(to, subject, html) {
        try {
            const response = await this.resend.emails.send({
                from: this.fromEmail,
                to: [to],
                subject: subject,
                html: html
            });
            
            console.log('✅ Email sent via Resend:', response.data.id);
            return { success: true, messageId: response.data.id };
        } catch (error) {
            console.error('❌ Resend email failed:', error.message);
            throw error;
        }
    }

    async sendEmailViaSMTP(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: to,
                subject: subject,
                html: html
            });
            
            console.log('✅ Email sent via SMTP:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ SMTP email failed:', error.message);
            throw error;
        }
    }

    async sendEmail(to, subject, html) {
        try {
            if (this.useResend) {
                return await this.sendEmailViaResend(to, subject, html);
            } else {
                return await this.sendEmailViaSMTP(to, subject, html);
            }
        } catch (error) {
            // Fallback: Try Resend if SMTP fails
            if (!this.useResend && process.env.RESEND_API_KEY) {
                console.log('🔄 SMTP failed, trying Resend as fallback...');
                try {
                    return await this.sendEmailViaResend(to, subject, html);
                } catch (resendError) {
                    console.error('❌ Both SMTP and Resend failed');
                    throw resendError;
                }
            }
            throw error;
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
            const result = await this.sendEmail(email, mailOptions.subject, mailOptions.html);
            console.log('✅ Welcome email sent successfully');
            return result;
        } catch (error) {
            console.error('❌ Error sending welcome email:', error.message);
            throw error;
        }
    }

    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'https://tracking-criminal.onrender.com'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset - Online Tracking criminal System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You requested a password reset for your account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    <p>If the button doesn't work, copy and paste this link:</p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p>This link will expire in 1 hour.</p>
                </div>
            `
        };

        try {
            const result = await this.sendEmail(email, mailOptions.subject, mailOptions.html);
            console.log('✅ Password reset email sent successfully');
            return result;
        } catch (error) {
            console.error('❌ Error sending password reset email:', error.message);
            throw error;
        }
    }

    async sendVerificationEmail(email, verificationToken) {
        const verifyUrl = `${process.env.FRONTEND_URL || 'https://tracking-criminal.onrender.com'}/my_account.html?token=${verificationToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com',
            to: email,
            subject: 'USER VERIFICATION - Email Verification Required',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🔐 Email Verification</h1>
                        <p style="margin: 15px 0; font-size: 16px;">Online Tracking criminal System</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px;">Welcome to Online Tracking criminal System!</h2>
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            Thank you for registering with our system. To complete your registration and activate your account, 
                            please verify your email address by clicking the button below.
                        </p>
                        
                    <div style="text-align: center; margin: 30px 0;">
                            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                Click here to verify
                            </a>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #495057; margin-top: 0;">Alternative Access Method</h3>
                            <p style="color: #6c757d; margin-bottom: 10px;">If the button above doesn't work, you can also:</p>
                            <p style="color: #6c757d; margin: 5px 0;">1. Copy this link: <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">${verifyUrl}</code></p>
                            <p style="color: #6c757d; margin: 5px 0;">2. Or open this file directly: <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">my_account.html</code></p>
                        </div>
                        
                        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 25px;">
                            <p style="color: #6c757d; font-size: 14px; margin: 0;">
                                <strong>Important:</strong> This verification link will expire in 24 hours. 
                                If you didn't create an account with us, please ignore this email.
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                        <p>This email was sent by Online Tracking criminal System</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            `
        };

        try {
            console.log('📧 Sending verification email...');
            console.log('📧 To:', email);
            console.log('📧 Token:', verificationToken.substring(0, 20) + '...');
            console.log('📧 URL:', verifyUrl);
            
            const result = await this.sendEmail(email, mailOptions.subject, mailOptions.html);
            console.log('✅ Verification email sent successfully');
            console.log('📧 Email sent to:', email);
            return result;
        } catch (error) {
            console.error('❌ Error sending verification email:', error.message);
            console.log('=== VERIFICATION TOKEN FOR TESTING ===');
            console.log('Email:', email);
            console.log('Verification Token:', verificationToken);
            console.log('Verification URL:', verifyUrl);
            console.log('=====================================');
            throw error;
        }
    }

    async resendVerificationEmail(email, verificationToken) {
        const verifyUrl = `${process.env.FRONTEND_URL || 'https://tracking-criminal.onrender.com'}/my_account.html?token=${verificationToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com',
            to: email,
            subject: 'USER VERIFICATION - Resend Email Verification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🔄 Resend Verification</h1>
                        <p style="margin: 15px 0; font-size: 16px;">Online Tracking criminal System</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px;">Email Verification Resent</h2>
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            We've generated a new verification link for your account. Please click the button below 
                            to verify your email address and activate your account.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                Click here to verify
                            </a>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #495057; margin-top: 0;">Alternative Access Method</h3>
                            <p style="color: #6c757d; margin-bottom: 10px;">If the button above doesn't work, you can also:</p>
                            <p style="color: #6c757d; margin: 5px 0;">1. Copy this link: <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">${verifyUrl}</code></p>
                            <p style="color: #6c757d; margin: 5px 0;">2. Or open this file directly: <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">my_account.html</code></p>
                        </div>
                        
                        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 25px;">
                            <p style="color: #6c757d; font-size: 14px; margin: 0;">
                                <strong>Note:</strong> This is a new verification link. Previous links may no longer work. 
                                This link will expire in 24 hours.
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                        <p>This email was sent by Online Tracking criminal System</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            `
        };

        try {
            console.log('📧 Resending verification email...');
            console.log('📧 To:', email);
            console.log('📧 Token:', verificationToken.substring(0, 20) + '...');
            console.log('📧 URL:', verifyUrl);
            
            const result = await this.sendEmail(email, mailOptions.subject, mailOptions.html);
            console.log('✅ Verification email resent successfully');
            console.log('📧 Email sent to:', email);
            return result;
        } catch (error) {
            console.error('❌ Error resending verification email:', error.message);
            console.log('=== VERIFICATION TOKEN FOR TESTING ===');
            console.log('Email:', email);
            console.log('Verification Token:', verificationToken);
            console.log('Verification URL:', verifyUrl);
            console.log('=====================================');
            throw error;
        }
    }
}

module.exports = new EmailService();