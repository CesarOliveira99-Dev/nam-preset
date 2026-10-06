import { DomainEvent } from '../../domain/events/domain-event';

/**
 * Porta do barramento. Hoje: EventEmitter in-process.
 * Depois: RabbitMQ, Redis, etc. — o use case não muda.
 */
export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>;
}
