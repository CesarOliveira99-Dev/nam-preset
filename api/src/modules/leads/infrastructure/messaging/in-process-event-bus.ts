import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { EventBusPort } from '../../application/ports/event-bus.port';
import type { DomainEvent } from '../../domain/events/domain-event';

/**
 * Adapter in-process: o evento não sai deste processo Node.
 * Trocar por um broker = implementar EventBusPort de outro jeito.
 */
@Injectable()
export class InProcessEventBus implements EventBusPort {
  constructor(private readonly emitter: EventEmitter2) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.emitter.emitAsync(event.eventName, event);
  }
}
