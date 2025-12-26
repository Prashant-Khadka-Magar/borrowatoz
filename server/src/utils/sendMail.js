import nodemailer from "nodemailer";

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or use your email provider (e.g., Yahoo, Outlook)
      auth: {
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"BorrowAtoZ" <${process.env.EMAIL_USER}>`, // Sender address
      to, // Receiver email
      subject, // Email subject
      html: htmlContent, // HTML content of the email
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw to handle errors in calling function
  }
};

export default sendEmail;


