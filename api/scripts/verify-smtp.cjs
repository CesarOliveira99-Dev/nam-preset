'use strict';

const nodemailer = require('nodemailer');

const html = `
  <div style="font-family: Georgia, serif; max-width: 520px; color: #1a1a1a; line-height: 1.6;">
    <p>Olá, Cesar.</p>
    <p>Obrigado por deixar seu contato.</p>
    <p>
      Estou disponibilizando, neste momento, os meus <strong>presets NAM</strong>
      de forma gratuita. Queria saber se isso é algo que te interessa.
    </p>
    <p>Se fizer sentido pra você, é só responder este e-mail.</p>
    <p>Abraço,<br/>Cesar</p>
  </div>
`.trim();

const text = [
  'Olá, Cesar.',
  '',
  'Obrigado por deixar seu contato.',
  '',
  'Estou disponibilizando, neste momento, os meus presets NAM de forma gratuita.',
  'Queria saber se isso é algo que te interessa.',
  '',
  'Se fizer sentido pra você, é só responder este e-mail.',
  '',
  'Abraço,',
  'Cesar',
].join('\n');

async function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const from = process.env.SMTP_FROM ?? 'Cesar Oliveira - NAM Presets <bibimasson@gmail.com>';
  const to = process.env.SMTP_TEST_TO;

  if (host && user && pass) {
    if (!to) {
      throw new Error(
        'SMTP do .env está preenchido. Defina SMTP_TEST_TO com o e-mail que deve receber o teste.',
      );
    }

    return {
      mode: 'env',
      from,
      to,
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10_000,
      }),
    };
  }

  const account = await nodemailer.createTestAccount();

  return {
    mode: 'ethereal',
    from: `NAM Presets <${account.user}>`,
    to: 'lead@example.com',
    transporter: nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    }),
  };
}

async function main() {
  const { mode, from, to, transporter } = await createTransport();

  await transporter.verify();
  console.log(`SMTP ok (${mode}): verify() passou.`);

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Você tem interesse nos presets NAM?',
    html,
    text,
  });

  console.log(`Enviado. messageId=${info.messageId}`);
  console.log(`Para: ${to}`);

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log(`Preview Ethereal: ${preview}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
