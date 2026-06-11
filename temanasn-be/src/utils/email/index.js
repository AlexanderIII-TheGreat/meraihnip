const nodemailer = require('nodemailer');
const mustache = require('mustache');
const fs = require('fs');
require('dotenv').config();

const sendMail = async (data) => {
  try {
    const { to, subject, template } = data;

    const fileTemplate = fs.readFileSync(
      `src/utils/email/templates/${template}`,
      'utf8'
    );

    console.log({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const platformName = process.env.PLATFORM_NAME || 'MeraihNIP';
    const platformLogo = process.env.PLATFORM_LOGO_URL || 'https://fungsional.id/wp-content/uploads/2025/03/logo-fungsional.id-3-scaled.webp';
    const platformUrl = process.env.URL_CLIENT || 'http://localhost:5173';

    const renderData = {
      platform_name: platformName,
      platform_logo: platformLogo,
      platform_url: platformUrl,
      ...data
    };

    const mailOptions = {
      from: `"${platformName}" <${process.env.SMTP_EMAIL}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      html: mustache.render(fileTemplate, renderData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[+] BERHASIL MENGIRIM EMAIL [+]');
    return true;
  } catch (error) {
    console.error('[-] GAGAL MENGIRIM EMAIL [-]', error);
    return false;
    // throw error; // Rethrow the error to be handled by the caller
  }
};

module.exports = sendMail;
