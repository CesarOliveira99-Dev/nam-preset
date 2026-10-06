import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { join } from 'node:path';
import type {
  MailAttachment,
  MailerPort,
} from '../../application/ports/mailer.port';
import { MAILER } from '../../application/tokens';
import { LeadCapturedEvent } from '../../domain/events/lead-captured.event';
import { PresetType } from '../../domain/preset-type';
import { renderInterestEmail } from '../mail/interest-email.template';

/**
 * Reação ao evento. Amanhã um handler de WhatsApp escuta o mesmo LeadCaptured.
 * Este arquivo não altera o CaptureLeadUseCase.
 */
@Injectable()
export class SendInterestEmailHandler {
  private readonly logger = new Logger(SendInterestEmailHandler.name);

  constructor(@Inject(MAILER) private readonly mailer: MailerPort) {}

  private readonly eletricAttachment = {
    filename: 'Petrucci_Lead.zip',
    path: join(process.cwd(), 'data/files/eletric/Petrucci_Lead.zip'),
  };

  private readonly acousticAttachment = {
    filename: 'Acoustic_IR.zip',
    path: join(process.cwd(), 'data/files/acoustic/Acoustic_IR.zip'),
  };

  @OnEvent(LeadCapturedEvent.EVENT_NAME)
  async handle(event: LeadCapturedEvent): Promise<void> {
    try {
      const rendered = renderInterestEmail(event.payload);
      await this.mailer.send({
        to: event.payload.email,
        ...rendered,
        attachments: this.attachmentsFor(event.payload.presetType),
      });
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'erro desconhecido';
      this.logger.error(
        `Falha ao enviar e-mail para ${event.payload.email}: ${reason}`,
      );
    }
  }

  private attachmentsFor(presetType: PresetType): MailAttachment[] {
    if (presetType === PresetType.ELETRIC) {
      return [this.eletricAttachment];
    }

    if (presetType === PresetType.ACOUSTIC) {
      return [this.acousticAttachment];
    }

    return [this.eletricAttachment, this.acousticAttachment];
  }
}
