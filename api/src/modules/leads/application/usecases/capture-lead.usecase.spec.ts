import { Lead } from '../../domain/entities/lead';
import { InvalidLeadError } from '../../domain/errors/invalid-lead.error';
import { DomainEvent } from '../../domain/events/domain-event';
import { LeadCapturedEvent } from '../../domain/events/lead-captured.event';
import { PresetType } from '../../domain/preset-type';
import { LeadRepository } from '../../domain/repositories/lead.repository';
import { EventBusPort } from '../ports/event-bus.port';
import { CaptureLeadUseCase } from './capture-lead.usecase';

class InMemoryLeadRepository implements LeadRepository {
  readonly items = new Map<string, Lead>();

  findByEmail(email: string): Promise<Lead | null> {
    return Promise.resolve(
      [...this.items.values()].find((lead) => lead.email === email) ?? null,
    );
  }

  save(lead: Lead): Promise<void> {
    this.items.set(lead.id, lead);
    return Promise.resolve();
  }
}

class RecordingEventBus implements EventBusPort {
  readonly events: DomainEvent[] = [];

  publish(event: DomainEvent): Promise<void> {
    this.events.push(event);
    return Promise.resolve();
  }
}

describe('CaptureLeadUseCase', () => {
  let leads: InMemoryLeadRepository;
  let eventBus: RecordingEventBus;
  let useCase: CaptureLeadUseCase;

  beforeEach(() => {
    leads = new InMemoryLeadRepository();
    eventBus = new RecordingEventBus();
    useCase = new CaptureLeadUseCase(leads, eventBus);
  });

  it('cria o lead e publica LeadCaptured sem reenvio', async () => {
    const result = await useCase.execute({
      fullName: 'Cesar Silva',
      email: 'cesar@example.com',
      presetType: PresetType.ELETRIC,
    });

    expect(result.isResend).toBe(false);
    expect(leads.items.size).toBe(1);

    const event = eventBus.events[0] as LeadCapturedEvent;
    expect(event).toBeInstanceOf(LeadCapturedEvent);
    expect(event.payload).toMatchObject({
      email: 'cesar@example.com',
      fullName: 'Cesar Silva',
      presetType: PresetType.ELETRIC,
      isResend: false,
    });
  });

  it('normaliza o e-mail e o nome', async () => {
    await useCase.execute({
      fullName: '  Cesar   Silva ',
      email: 'cesar@example.com',
      presetType: PresetType.ACOUSTIC,
    });

    const stored = [...leads.items.values()][0];
    expect(stored.email).toBe('cesar@example.com');
    expect(stored.fullName).toBe('Cesar Silva');
  });

  it('atualiza o nome e republica como reenvio quando o e-mail já existe', async () => {
    const first = await useCase.execute({
      fullName: 'Cesar Silva',
      email: 'cesar@example.com',
      presetType: PresetType.ELETRIC,
    });

    const second = await useCase.execute({
      fullName: 'Cesar Souza Silva',
      email: 'cesar@example.com',
      presetType: PresetType.BOTH,
    });

    expect(second.leadId).toBe(first.leadId);
    expect(second.isResend).toBe(true);
    expect(leads.items.size).toBe(1);
    expect([...leads.items.values()][0].fullName).toBe('Cesar Souza Silva');
    expect([...leads.items.values()][0].presetType).toBe(PresetType.BOTH);
    expect(eventBus.events).toHaveLength(2);
    expect((eventBus.events[1] as LeadCapturedEvent).payload).toMatchObject({
      isResend: true,
      presetType: PresetType.BOTH,
    });
  });

  it('reenvia mesmo quando o nome não mudou', async () => {
    await useCase.execute({
      fullName: 'Cesar Silva',
      email: 'cesar@example.com',
      presetType: PresetType.BOTH,
    });

    const result = await useCase.execute({
      fullName: 'Cesar Silva',
      email: 'cesar@example.com',
      presetType: PresetType.BOTH,
    });

    expect(result.isResend).toBe(true);
    expect(eventBus.events).toHaveLength(2);
  });

  it('rejeita nome sem sobrenome', async () => {
    await expect(
      useCase.execute({
        fullName: 'Cesar',
        email: 'cesar@example.com',
        presetType: PresetType.ELETRIC,
      }),
    ).rejects.toBeInstanceOf(InvalidLeadError);
    expect(leads.items.size).toBe(0);
    expect(eventBus.events).toHaveLength(0);
  });

  it('rejeita tipo de preset inválido', async () => {
    await expect(
      useCase.execute({
        fullName: 'Cesar Silva',
        email: 'cesar@example.com',
        presetType: 'Bass' as never,
      }),
    ).rejects.toBeInstanceOf(InvalidLeadError);
  });

  it('rejeita e-mail inválido', async () => {
    await expect(
      useCase.execute({
        fullName: 'Cesar Silva',
        email: 'nao-e-email',
        presetType: PresetType.ELETRIC,
      }),
    ).rejects.toBeInstanceOf(InvalidLeadError);
  });
});
