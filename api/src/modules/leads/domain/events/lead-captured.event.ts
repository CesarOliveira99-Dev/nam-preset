import type { PresetType } from '../preset-type';
import { DomainEvent } from './domain-event';

export type LeadCapturedPayload = {
  leadId: string;
  fullName: string;
  email: string;
  presetType: PresetType;
  isResend: boolean;
};

/**
 * Algo que JÁ aconteceu no domínio: um lead foi capturado
 * (primeira vez ou reenvio). Handlers reagem; o use case não espera canal nenhum.
 */
export class LeadCapturedEvent implements DomainEvent {
  static readonly EVENT_NAME = 'lead.captured';

  readonly eventName = LeadCapturedEvent.EVENT_NAME;

  constructor(public readonly payload: LeadCapturedPayload) {}
}
