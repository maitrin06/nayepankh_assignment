import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'mock@volunteerhub.org',
    pass: process.env.EMAIL_PASS || 'mockpassword',
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    // If we have default mock variables, we can print to the logs to verify it works without SMTP.
    console.log(`[MOCK EMAIL] Sending to: ${to}`);
    console.log(`[MOCK EMAIL] Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Content Preview: ${html.substring(0, 100)}...`);

    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'mock@volunteerhub.org') {
      const info = await transporter.sendMail({
        from: `"VolunteerHub" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`[SMTP EMAIL] Sent successfully. MessageId: ${info.messageId}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendRegistrationEmail = async (email: string, name: string) => {
  await sendMail(
    email,
    'Welcome to VolunteerHub!',
    `<h1>Welcome, ${name}!</h1>
     <p>Your registration was successful. You can now log in and complete your volunteer profile.</p>
     <p>Admin approval is required before you can participate in events and complete tasks.</p>`
  );
};

export const sendApprovalEmail = async (email: string, name: string, approved: boolean) => {
  const status = approved ? 'Approved' : 'Rejected';
  const message = approved 
    ? 'Congratulations! Your volunteer profile has been approved. You can now register for events and start tasks.'
    : 'Thank you for your interest. Unfortunately, your volunteer profile approval has been rejected at this time.';
  
  await sendMail(
    email,
    `VolunteerHub - Application ${status}`,
    `<h1>Hello, ${name}</h1>
     <p>${message}</p>
     ${approved ? '<p><a href="http://localhost:3000/auth">Login here</a> to explore available events.</p>' : ''}`
  );
};

export const sendTaskAssignmentEmail = async (email: string, name: string, taskTitle: string, deadline: string) => {
  await sendMail(
    email,
    'New Task Assigned - VolunteerHub',
    `<h1>New Task Assigned</h1>
     <p>Hello ${name},</p>
     <p>You have been assigned a new task: <strong>${taskTitle}</strong>.</p>
     <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
     <p>Please log in to your dashboard to view complete details and update the status.</p>`
  );
};

export const sendEventReminderEmail = async (email: string, name: string, eventTitle: string, eventDate: string) => {
  await sendMail(
    email,
    `Reminder: Upcoming Event - ${eventTitle}`,
    `<h1>Event Reminder</h1>
     <p>Hello ${name},</p>
     <p>This is a reminder that you are registered for <strong>${eventTitle}</strong> scheduled for <strong>${new Date(eventDate).toLocaleDateString()}</strong>.</p>
     <p>We look forward to seeing you there!</p>`
  );
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `http://localhost:3000/auth?resetToken=${token}`;
  await sendMail(
    email,
    'Password Reset Request - VolunteerHub',
    `<h1>Reset Your Password</h1>
     <p>You requested a password reset. Click the link below to set a new password:</p>
     <p><a href="${resetUrl}">${resetUrl}</a></p>
     <p>This link will expire in 1 hour.</p>
     <p>If you did not make this request, please ignore this email.</p>`
  );
};
