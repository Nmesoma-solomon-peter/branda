const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

let transporter = null;

const getTransporter = async () => {
  const settings = await Settings.findOne().lean();
  if (!settings?.smtpEnabled || !settings.smtpUser) return null;

  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: settings.smtpHost || 'smtp.gmail.com',
    port: settings.smtpPort || 587,
    secure: false,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass
    }
  });

  return transporter;
};

const getFromAddress = async () => {
  const settings = await Settings.findOne().lean();
  return settings?.smtpFrom || settings?.smtpUser || 'noreply@branda.ng';
};

const sendEmail = async (to, subject, html) => {
  try {
    const transport = await getTransporter();
    if (!transport) return false;

    const from = await getFromAddress();
    await transport.sendMail({ from, to, subject, html });
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
        <tr><td style="background:#000000;padding:24px 32px;">
          <h1 style="margin:0;font-size:22px;color:#6f9c3e;font-weight:700;">Branda</h1>
        </td></tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; 2026 Branda. Branding made simple for small businesses.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const templates = {
  welcome: (name) => ({
    subject: 'Welcome to Branda',
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Welcome to Branda, ${name}!</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Thank you for joining Branda — the platform connecting small businesses in Aba with talented brand designers.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Get started by creating your first project or browsing available designers.
      </p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Go to Dashboard</a>
    `)
  }),

  specialistWelcome: (name) => ({
    subject: 'Welcome to Branda — Designer Account',
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Welcome, ${name}!</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Your designer account has been created. Complete your KYC verification to start receiving project assignments.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Once verified, you'll be matched with small businesses looking for logos, brand guides, and design assets.
      </p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/kyc" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Complete KYC</a>
    `)
  }),

  projectAssigned: (specialistName, projectTitle, smeName) => ({
    subject: `New Project Assigned: ${projectTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Project Assigned</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${specialistName}, you've been assigned a new project.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#000;">${projectTitle}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;">Client: ${smeName}</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/specialist-dashboard" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Project</a>
    `)
  }),

  projectCreated: (smeName, projectTitle) => ({
    subject: `Project Created: ${projectTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Project Created</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${smeName}, your project has been created successfully.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#000;">${projectTitle}</p>
      </div>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Our team will review and assign a designer to your project shortly.
      </p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Dashboard</a>
    `)
  }),

  kycSubmitted: (name) => ({
    subject: 'KYC Verification Submitted',
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">KYC Submitted</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${name}, we've received your identity verification documents.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Our team will review your submission within 24-48 hours. You'll receive an email once your verification is complete.
      </p>
    `)
  }),

  kycApproved: (name) => ({
    subject: 'KYC Verified — You\'re All Set!',
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">KYC Approved</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${name}, your identity has been verified successfully.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        You can now receive project assignments. We'll match you with businesses based on your skills and availability.
      </p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/specialist-dashboard" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Dashboard</a>
    `)
  }),

  kycRejected: (name, reason) => ({
    subject: 'KYC Verification — Action Required',
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">KYC Requires Update</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${name}, we were unable to verify your identity.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;color:#dc2626;font-weight:500;">Reason: ${reason || 'Documents could not be verified'}</p>
      </div>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Please update your documents and resubmit.
      </p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/kyc" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Resubmit KYC</a>
    `)
  }),

  messageReceived: (recipientName, senderName, subject) => ({
    subject: `New Message from ${senderName}: ${subject}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">New Message</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${recipientName}, you have a new message from <strong>${senderName}</strong>.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#000;">${subject}</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Read Message</a>
    `)
  }),

  projectStatusUpdate: (userName, projectTitle, newStatus) => ({
    subject: `Project Status Updated: ${projectTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Project Update</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${userName}, the status of your project has been updated.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#000;">${projectTitle}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;">Status: <span style="color:#6f9c3e;font-weight:600;text-transform:capitalize;">${newStatus}</span></p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Project</a>
    `)
  }),

  verifyEmail: (name, token) => ({
    subject: 'Verify Your Email Address',
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Verify Your Email</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${name}, please verify your email address to activate your account.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Click the button below to verify your email. This link expires in 24 hours.
      </p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Verify Email</a>
    `)
  }),

  passwordReset: (name, token) => ({
    subject: 'Reset Your Password',
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Password Reset</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${name}, you requested a password reset.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Click the button below to reset your password. This link expires in 15 minutes.
      </p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Reset Password</a>
      <p style="font-size:13px;color:#9ca3af;margin:16px 0 0;">If you didn't request this, you can safely ignore this email.</p>
    `)
  }),

  accountDeleted: (name) => ({
    subject: 'Account Deleted',
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Account Deleted</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${name}, your Branda account has been permanently deleted.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        All your data, projects, and files have been removed. We're sorry to see you go.
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        If this was a mistake, you can always create a new account.
      </p>
    `)
  }),

  commentNotification: (userName, commenterName, projectTitle) => ({
    subject: `New Comment on ${projectTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">New Comment</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${userName}, <strong>${commenterName}</strong> commented on your project.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#000;">${projectTitle}</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Project</a>
    `)
  }),

  revisionRequested: (specialistName, projectTitle, note) => ({
    subject: `Revision Requested: ${projectTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Revision Requested</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${specialistName}, the client has requested revisions on your project.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#000;">${projectTitle}</p>
        <p style="margin:0;font-size:13px;color:#374151;">${note || 'No specific notes provided'}</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Project</a>
    `)
  }),

  deliverableUploaded: (smeName, projectTitle) => ({
    subject: `New Deliverable Uploaded: ${projectTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">New Deliverable</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${smeName}, your designer has uploaded new deliverables for your project.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#000;">${projectTitle}</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Deliverables</a>
    `)
  }),

  projectCompleted: (userName, projectTitle) => ({
    subject: `Project Completed: ${projectTitle}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">Project Completed</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${userName}, your project has been completed!
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#000;">${projectTitle}</p>
      </div>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects" style="display:inline-block;padding:12px 28px;background:#6f9c3e;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Project</a>
    `)
  }),

  broadcast: (userName, title, message) => ({
    subject: title,
    html: baseTemplate(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#000;">${title}</h2>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
        Hi ${userName},
      </p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        ${message}
      </p>
    `)
  })
};

module.exports = { sendEmail, templates };
