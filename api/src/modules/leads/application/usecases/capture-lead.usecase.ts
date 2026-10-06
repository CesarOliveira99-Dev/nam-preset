import { Inject, Injectable } from '@nestjs/common';
import { Lead } from '../../domain/entities/lead';
import { LeadCapturedEvent } from '../../domain/events/lead-captured.event';
import type { PresetType } from '../../domain/preset-type';
import type { LeadRepository } from '../../domain/repositories/lead.repository';
import type { EventBusPort } from '../ports/event-bus.port';
import { EVENT_BUS, LEAD_REPOSITORY } from '../tokens';

export type CaptureLeadInput = {
  fullName: string;
  email: string;
  presetType: PresetType;
};

export type CaptureLeadResult = {
  leadId: string;
  isResend: boolean;
};

/**
 * @description Persiste (ou atualiza) um lead e publica LeadCaptured.
 * Não envia e-mail: isso é reação ao evento, não parte deste caso de uso.
 */
@Injectable()
export class CaptureLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly leads: LeadRepository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBusPort,
  ) {}

  async execute(input: CaptureLeadInput): Promise<CaptureLeadResult> {
    const candidate = Lead.create(
      input.fullName,
      input.email,
      input.presetType,
    );
    const existing = await this.leads.findByEmail(candidate.email);

    if (existing) {
      const updated = existing
        .rename(input.fullName)
        .choosePresetType(input.presetType);
      await this.leads.save(updated);
      await this.publish(updated, true);

      return { leadId: updated.id, isResend: true };
    }

    await this.leads.save(candidate);
    await this.publish(candidate, false);

    return { leadId: candidate.id, isResend: false };
  }

  private async publish(lead: Lead, isResend: boolean): Promise<void> {
    await this.eventBus.publish(
      new LeadCapturedEvent({
        leadId: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        presetType: lead.presetType,
        isResend,
      }),
    );
  }
}
