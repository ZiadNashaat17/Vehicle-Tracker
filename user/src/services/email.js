import sgMail from "@sendgrid/mail";
import { config } from "dotenv";
import path from "node:path";
import nodemailer from "nodemailer";

import { LOGGER } from "../logging.js";

const __dirname = import.meta.dirname;

config({ path: path.join(__dirname, "../../", ".env") });

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = async (to, subject, text, html) => {
//   const msg = {
//     to,
//     from: process.env.EMAIL_FROM,
//     subject,
//     text,
//     html,
//   };

//   try {
//     await sgMail.send(msg);
//     LOGGER.info("Email sent successfully");
//   } catch (error) {
//     LOGGER.error("Error sending email: ", error);

//     if (error.response) {
//       LOGGER.error(error.response.body);
//     }
//     throw error;
//   }
// };

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = transporter.sendMail(mailOptions);

    LOGGER.info("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    LOGGER.error("Error sending email: ", error);
    throw error;
  }
}

export default sendEmail;
