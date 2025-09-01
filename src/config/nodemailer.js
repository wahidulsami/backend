// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: 'smtp-relay.brevo.com',
//   port: 587,
//   auth: {
//     user: "94f1ac002@smtp-brevo.com",
//     pass: "kyvMghaKBA2SwtXb"
//   }
// });

// export default transporter;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Test connection
transporter.verify(function(error, success) {
   if (error) {
        console.log("SMTP Error:", error);
   } else {
        console.log("Server is ready to take messages");
   }
});

export default transporter;