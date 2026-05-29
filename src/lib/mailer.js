import nodemailer from "nodemailer";

export async function sendOtpEmail({ to, otp, fromEmail, fromPassword }) {
  if (!fromEmail || !fromPassword) {
    throw new Error("No sender email credentials configured");
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: fromEmail, pass: fromPassword },
  });

  await transport.sendMail({
    from: fromEmail,
    to,
    subject: "Your password reset code",
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Your password reset code is:</p>
           <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p>
           <p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
  });
}
