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
    from: process.env.SMTP_FROM || 'noreply@future-me.app',
    to: email,
    subject: 'Verify Your University Email - future me',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #4F46E5;">Welcome to future me!</h2>
        <p>Thank you for joining our cross-university academic achievement platform.</p>
        <p>Please verify your university email address by clicking the button below:</p>
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

export const sendAchievementApprovalEmail = async (email: string, achievementTitle: string, nftType: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@future-me.app',
    to: email,
    subject: 'Achievement Approved - NFT Ready to Mint!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #10B981;">🎉 Achievement Approved!</h2>
        <p>Congratulations! Your achievement has been verified and approved:</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #374151;">${achievementTitle}</h3>
          <p style="margin: 10px 0 0 0; color: #6B7280;">NFT Type: ${nftType}</p>
        </div>
        <p>You can now mint your exclusive NFT and unlock premium opportunities!</p>
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
    console.log(`Achievement approval email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send achievement approval email:', error);
  }
};