import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { PresetType } from '../../domain/preset-type';

@Entity({ name: 'leads' })
export class LeadOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName: string;

  @Column({ name: 'email', type: 'varchar', length: 320, unique: true })
  email: string;

  @Column({ name: 'preset_type', type: 'varchar', length: 20, default: 'Both' })
  presetType: PresetType;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
