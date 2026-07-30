import nodemailer from "nodemailer";

/**
 * Send an email (using Ethereal for development/testing).
 * In production, you would configure this with a real SMTP server (like Gmail/SendGrid).
 */
const sendEmail = async (options) => {
  // If no real credentials are provided in .env, use Ethereal (fake inbox)
  let transporter;
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production/Real config
    transporter = nodemailer.createTransport({
      service: 'gmail', // or your provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development/Ethereal config
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  const mailOptions = {
    from: '"TVDS Admin" <noreply@tvds.gov>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  if (!process.env.EMAIL_USER) {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

export default sendEmail;
