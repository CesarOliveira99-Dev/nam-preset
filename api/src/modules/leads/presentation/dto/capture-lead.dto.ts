import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { PRESET_TYPES, type PresetType } from '../../domain/preset-type';

export class CaptureLeadDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  fullName: string;

  @IsEmail()
  @MaxLength(320)
  email: string;

  @IsIn(PRESET_TYPES)
  presetType: PresetType;
}
