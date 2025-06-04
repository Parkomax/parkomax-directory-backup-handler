import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { CronService } from './cron.service';
import { ConfigService } from '@nestjs/config';
import { BackupStateService } from './backupState.service';

@Module({
  controllers: [BackupController],
  providers: [BackupService, CronService,ConfigService , BackupStateService],
})
export class BackupModule {}
