import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EVENT_BUS, LEAD_REPOSITORY, MAILER } from './application/tokens';
import { CaptureLeadUseCase } from './application/usecases/capture-lead.usecase';
import { SendInterestEmailHandler } from './infrastructure/handlers/send-interest-email.handler';
import { NodemailerAdapter } from './infrastructure/mail/nodemailer.adapter';
import { InProcessEventBus } from './infrastructure/messaging/in-process-event-bus';
import { LeadOrmEntity } from './infrastructure/persistence/lead.orm-entity';
import { TypeOrmLeadRepository } from './infrastructure/persistence/typeorm-lead.repository';
import { LeadsController } from './presentation/leads.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeadOrmEntity])],
  controllers: [LeadsController],
  providers: [
    CaptureLeadUseCase,
    SendInterestEmailHandler,
    {
      provide: LEAD_REPOSITORY,
      useClass: TypeOrmLeadRepository,
    },
    {
      provide: EVENT_BUS,
      useClass: InProcessEventBus,
    },
    {
      provide: MAILER,
      useClass: NodemailerAdapter,
    },
  ],
})
export class LeadsModule {}
