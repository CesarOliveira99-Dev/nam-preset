import { readFileSync } from 'node:fs';
import { LeadCapturedPayload } from '../../domain/events/lead-captured.event';
import { join } from 'node:path';

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

export function renderInterestEmail(
  payload: LeadCapturedPayload,
): RenderedEmail {
  const firstName = payload.fullName.split(' ')[0];
  const subject = payload.isResend
    ? 'De novo: você tem interesse nos presets NAM?'
    : 'Você tem interesse nos presets NAM?';

  const text = [
    `Olá, ${firstName}.`,
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

  const html = `
    <div style="font-family: Georgia, serif; max-width: 520px; color: #1a1a1a; line-height: 1.6;">
      <p>Olá, ${escapeHtml(firstName)}!</p>
      <p>Obrigado por deixar seu contato.</p>
      <p>
        Estou disponibilizando, neste momento, os meus <strong>presets NAM</strong>
        Qualquer dúvida, é só responder este e-mail ou me chamar no instagram!
      </p>
      <p></p>
      <p>Abraço,<br/>Cesar</p>
    </div>
  `.trim();

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
