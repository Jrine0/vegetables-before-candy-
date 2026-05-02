import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@vegetables-before-candy.app',
    to: email,
    subject: 'Verify Your Email - vegetables-before-candy',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #4F46E5;">Welcome to vegetables-before-candy!</h2>
        <p>Thank you for joining our task-reward platform.</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendTaskApprovalEmail = async (email: string, taskTitle: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@vegetables-before-candy.app',
    to: email,
    subject: 'Task Completed - Reward Ready to Claim!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #10B981;">🎉 Task Completed!</h2>
        <p>Congratulations! Your task has been verified and your reward is ready to claim:</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #374151;">${taskTitle}</h3>
        </div>
        <p>Your reward is now available in your dashboard. Redeem it securely through Stellar Soroban.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="background-color: #10B981; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            View Dashboard
          </a>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Task approval email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send task approval email:', error);
  }
};