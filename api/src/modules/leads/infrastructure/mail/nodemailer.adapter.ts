import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import type {
  MailerPort,
  MailMessage,
} from '../../application/ports/mailer.port';

@Injectable()
export class NodemailerAdapter implements MailerPort {
  private readonly logger = new Logger(NodemailerAdapter.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('SMTP_PORT') ?? 587);
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    this.from = config.get<string>('SMTP_FROM') ?? 'nam-presets@localhost';

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP incompleto (SMTP_HOST/USER/PASS). O e-mail será só logado no console.',
      );
      this.transporter = null;
      return;
    }

    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
    });
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `E-mail (dry-run) para ${message.to}: ${message.subject}\n${message.text}`,
      );
      return;
    }

    const info = await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments: message.attachments,
    });

    this.logger.log(`E-mail enviado para ${message.to} (${info.messageId})`);
  }
}
