import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email: ', error);

    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};

export default sendEmail;
