/**
 * Contrato mínimo de um evento de domínio.
 * O bus só precisa do nome; o payload fica na classe concreta.
 */
export interface DomainEvent {
  readonly eventName: string;
}
