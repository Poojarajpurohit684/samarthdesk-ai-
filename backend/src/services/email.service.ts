import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

// Lazy transporter — only created when actually needed so the app starts
// without crashing if SMTP credentials are not configured.
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    if (!config.email.smtp.host || !config.email.smtp.user) {
      throw new Error('SMTP is not configured (SMTP_HOST / SMTP_USER missing)');
    }
    _transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.port === 465,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password,
      },
    });
  }
  return _transporter;
}

export const emailService = {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${config.app.frontendUrl}/verify-email?token=${token}`;
    await getTransporter().sendMail({
      from: config.email.smtp.from,
      to,
      subject: 'Verify your Samarthdesk AI email',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Verify your email</h2>
          <p>Click the button below to verify your account.</p>
          <a href="${verifyUrl}"
             style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">
            Verify Email
          </a>
          <p style="margin-top:16px;color:#6b7280;font-size:12px">
            This link expires in 24 hours. If you did not create an account, you can ignore this email.
          </p>
        </div>`,
    });
    logger.info(`Verification email sent to ${to}`);
  },

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${config.app.frontendUrl}/reset-password?token=${token}`;
    await getTransporter().sendMail({
      from: config.email.smtp.from,
      to,
      subject: 'Reset your Samarthdesk AI password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Reset your password</h2>
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">
            Reset Password
          </a>
          <p style="margin-top:16px;color:#6b7280;font-size:12px">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>`,
    });
    logger.info(`Password reset email sent to ${to}`);
  },

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await getTransporter().sendMail({
      from: config.email.smtp.from,
      to,
      subject: `Welcome to ${config.app.name}!`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Welcome, ${firstName}!</h2>
          <p>Your account has been created on <strong>${config.app.name}</strong>.</p>
          <p>You can now submit support tickets and track their progress in real time.</p>
          <a href="${config.app.frontendUrl}/dashboard"
             style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">
            Go to Dashboard
          </a>
        </div>`,
    });
    logger.info(`Welcome email sent to ${to}`);
  },

  async sendTicketReplyNotification(to: string, ticketNumber: string, agentName: string): Promise<void> {
    const ticketUrl = `${config.app.frontendUrl}/tickets`;
    await getTransporter().sendMail({
      from: config.email.smtp.from,
      to,
      subject: `New reply on ticket #${ticketNumber}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>New reply on your ticket</h2>
          <p>${agentName} has replied to ticket <strong>#${ticketNumber}</strong>.</p>
          <a href="${ticketUrl}"
             style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">
            View Ticket
          </a>
        </div>`,
    });
    logger.info(`Reply notification sent to ${to} for ticket ${ticketNumber}`);
  },
};
