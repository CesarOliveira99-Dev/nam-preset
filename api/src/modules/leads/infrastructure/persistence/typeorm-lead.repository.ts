import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../../domain/entities/lead';
import type { LeadRepository } from '../../domain/repositories/lead.repository';
import { LeadOrmEntity } from './lead.orm-entity';

@Injectable()
export class TypeOrmLeadRepository implements LeadRepository {
  constructor(
    @InjectRepository(LeadOrmEntity)
    private readonly repository: Repository<LeadOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<Lead | null> {
    const row = await this.repository.findOne({ where: { email } });

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async save(lead: Lead): Promise<void> {
    await this.repository.save(this.toOrm(lead));
  }

  private toDomain(row: LeadOrmEntity): Lead {
    return Lead.rehydrate({
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      presetType: row.presetType,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toOrm(lead: Lead): LeadOrmEntity {
    const row = new LeadOrmEntity();
    row.id = lead.id;
    row.fullName = lead.fullName;
    row.email = lead.email;
    row.presetType = lead.presetType;
    row.createdAt = lead.createdAt;
    row.updatedAt = lead.updatedAt;
    return row;
  }
}
