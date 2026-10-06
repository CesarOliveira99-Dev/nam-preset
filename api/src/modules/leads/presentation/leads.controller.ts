import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  CaptureLeadResult,
  CaptureLeadUseCase,
} from '../application/usecases/capture-lead.usecase';
import { CaptureLeadDto } from './dto/capture-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly captureLead: CaptureLeadUseCase) {}

  @Post()
  @HttpCode(201)
  execute(@Body() body: CaptureLeadDto): Promise<CaptureLeadResult> {
    return this.captureLead.execute(body);
  }
}
