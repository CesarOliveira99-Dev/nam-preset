import { Lead } from '../entities/lead';

/**
 * Porta do domínio. A aplicação depende disto — nunca de TypeORM.
 */
export interface LeadRepository {
  findByEmail(email: string): Promise<Lead | null>;
  save(lead: Lead): Promise<void>;
}
