const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io", // ou smtp.gmail.com, etc.
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetEmail(to, resetUrl) {
  await transporter.sendMail({
    from: '"Big Boss" <no-reply@bigboss.com>',
    to,
    subject: "Réinitialisez votre mot de passe",
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>
        Cliquez sur ce lien pour le faire :
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      <p>Ce lien est valable 1 heure.</p>
    `,
  });
}

async function sendConfirmationEmail(to) {
  await transporter.sendMail({
    from: '"Big Boss" <no-reply@bigboss.com>',
    to,
    subject: "Mot de passe réinitialisé",
    html: `
      <p>Bonjour,</p>
      <p>Votre mot de passe a été réinitialisé avec succès.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter immédiatement.</p>
      <p>L’équipe Big Boss</p>
    `,
  });
}


module.exports = {
  sendResetEmail,
  sendConfirmationEmail,
};
