const nodemailer = require('nodemailer');

module.exports = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'your mail',
      pass: 'your pass', 
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates if needed
    },
  });

  const mailOptions = {
    from: 'your mail',
    to: email,
    subject: 'Verification Code',
    text: `Your verification code is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; font-size: 16px;">
        <p>Your verification code is: <b>${otp}</b></p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
    `,

  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
