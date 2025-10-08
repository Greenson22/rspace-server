// src/services/email.service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Konfirmasi Pendaftaran Akun RSpace Anda',
        html: `
            <h1>Selamat Datang di RSpace!</h1>
            <p>Terima kasih telah mendaftar. Silakan klik link di bawah ini untuk mengaktifkan akun Anda:</p>
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verifikasi Akun Saya</a>
            <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
            <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};