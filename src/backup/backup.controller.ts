import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { CreateBackupDto } from './dto/create-backup.dto';
import { UpdateBackupDto } from './dto/update-backup.dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Controller('backup')
export class BackupController {
  constructor(
    private readonly backupService: BackupService,
    private configService: ConfigService,
  ) {}

  @Post('manual')
  async manualBackup() {
    return this.backupService.createBackup();
  }

  @Post('restore')
  async restore(@Query('backupName') backupName: string) {
    return this.backupService.restoreBackup(backupName);
  }

  @Get('list')
  listBackups() {
    const dest = this.configService.get<string>('BACKUP_DEST_PATH');

    if (!dest) {
      throw new Error('BACKUP_DEST_PATH is not configured.');
    }

    const folders = fs.readdirSync(dest).filter((f) => f.startsWith('backup-'));
    return folders.sort().reverse();
  }
}
