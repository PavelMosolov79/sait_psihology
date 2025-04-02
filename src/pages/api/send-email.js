"use server"
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  console.log("API route /api/send-email called"); // Добавьте это
  if (req.method === 'POST') {
    const { excelBase64, recipientEmail } = req.body;
    console.log("Received data:", { excelBase64, recipientEmail }); // И это
    // ...
  

    // Настраиваем Nodemailer (замените на ваши данные)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Настраиваем письмо
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: 'Game Data Excel File',
      text: 'Please find attached the game data Excel file.',
      attachments: [
        {
          filename: 'game_data.xlsx',
          content: excelBase64,
          encoding: 'base64',
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to send email' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}