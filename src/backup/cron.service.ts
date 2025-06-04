import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupStateService } from './backupState.service';

@Injectable()
export class CronService {

    
  constructor(private backupService: BackupService , private stateService: BackupStateService) {}

  // This runs daily at midnight
//   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
@Cron('*/1 * * * *') // Every 1 minute
  async handleBackup() {
    console.log('⏰ Cron is running at', new Date().toISOString());
    await this.backupService.createBackup();
  }

  // You can control this via flags stored in DB/env and skip if disabled
}
