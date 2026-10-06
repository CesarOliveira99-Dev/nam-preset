import { InvalidLeadError } from '../errors/invalid-lead.error';
import { isPresetType, type PresetType } from '../preset-type';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LeadProps = {
  id: string;
  fullName: string;
  email: string;
  presetType: PresetType;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Entidade de domínio — sem Nest, sem TypeORM, sem e-mail.
 * Invariantes de Lead moram aqui para qualquer entrada (HTTP, CLI, teste) passar pelo mesmo caminho.
 */
export class Lead {
  private constructor(private readonly props: LeadProps) {}

  get id(): string {
    return this.props.id;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get email(): string {
    return this.props.email;
  }

  get presetType(): PresetType {
    return this.props.presetType;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(
    fullName: string,
    email: string,
    presetType: PresetType,
  ): Lead {
    const now = new Date();

    return new Lead({
      id: crypto.randomUUID(),
      fullName: Lead.normalizeName(fullName),
      email: Lead.normalizeEmail(email),
      presetType: Lead.normalizePresetType(presetType),
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: LeadProps): Lead {
    return new Lead({
      ...props,
      fullName: Lead.normalizeName(props.fullName),
      email: Lead.normalizeEmail(props.email),
      presetType: Lead.normalizePresetType(props.presetType),
    });
  }

  /**
   * Retorna a mesma instância se o nome não mudou — o use case evita write inútil.
   */
  rename(fullName: string): Lead {
    const normalized = Lead.normalizeName(fullName);

    if (normalized === this.fullName) {
      return this;
    }

    return new Lead({
      ...this.props,
      fullName: normalized,
      updatedAt: new Date(),
    });
  }

  choosePresetType(presetType: PresetType): Lead {
    const normalized = Lead.normalizePresetType(presetType);

    if (normalized === this.presetType) {
      return this;
    }

    return new Lead({
      ...this.props,
      presetType: normalized,
      updatedAt: new Date(),
    });
  }

  private static normalizeName(fullName: string): string {
    const normalized = fullName.trim().replace(/\s+/g, ' ');
    const parts = normalized.split(' ').filter(Boolean);

    if (parts.length < 2) {
      throw new InvalidLeadError('Informe o nome completo.');
    }

    if (normalized.length < 5) {
      throw new InvalidLeadError('Informe o nome completo.');
    }

    return normalized;
  }

  private static normalizeEmail(email: string): string {
    const normalized = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidLeadError('Informe um e-mail válido.');
    }

    return normalized;
  }

  private static normalizePresetType(presetType: string): PresetType {
    if (!isPresetType(presetType)) {
      throw new InvalidLeadError('Escolha o tipo de preset.');
    }

    return presetType;
  }
}
