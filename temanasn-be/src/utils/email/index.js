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
    const platformUrl = process.env.URL_CLIENT || 'http://localhost:5173';
    
    // Resolve public server URL to serve the static logo image
    let serverUrl = process.env.URL_SERVER || process.env.BASE_URL || 'http://localhost:8002';
    // Remove /api or trailing slash if present
    serverUrl = serverUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    const platformLogo = process.env.PLATFORM_LOGO_URL || `${serverUrl}/logo-meraihnip.png`;

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
