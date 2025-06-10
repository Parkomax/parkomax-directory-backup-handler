import { Controller, Get, Post, Query } from '@nestjs/common';
import { BackupService } from './backup.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('backup')
@Controller('backup')
export class BackupController {
  constructor(
    private readonly backupService: BackupService,
    private configService: ConfigService,
  ) {}

  @Post('manual')
  @ApiOperation({ summary: 'Trigger manual backup process' })
  @ApiResponse({
    status: 200,
    description: 'Returns console output and input params of backup',
    schema: {
      example: {
        success: true,
        message: 'Backup script run successfully',
        data: {
          consoleOutput: 'Backup completed successfully...',
          inputParams: {
            source: './uploads',
            destination: './backups',
            osType: 'linux',
            scriptUsed: './scripts/backup-handler.sh',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Backup script failed',
    schema: {
      example: {
        success: false,
        message: 'Backup script execution failed',
        errors: [
          {
            name: 'BackupScriptError',
            type: 'ExecutionError',
            errors: [
              'bash: ./scripts/backup-handler.sh: No such file or directory',
            ],
          },
        ],
      },
    },
  })
  async manualBackup() {
    console.log('did manually');
    return this.backupService.createBackup();
  }

  @ApiOperation({ summary: 'Restore a backup from the given backup name' })
  @ApiQuery({
    name: 'backupName',
    required: true,
    description:
      'The folder name under backup destination to restore from (e.g., backup-2025-06-09_16-25-00)',
    example: 'backup-2025-06-09_16-25-00',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully restored the backup',
    schema: {
      example: {
        success: true,
        message: 'Backup restored',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to restore backup',
    schema: {
      example: {
        success: false,
        error:
          'psql: FATAL:  password authentication failed for user "postgres"',
      },
    },
  })
  @Post('restore')
  async restore(@Query('backupName') backupName: string) {
    return this.backupService.restoreBackup(backupName);
  }





  @Get('list')
  @ApiOperation({
    summary: 'List all backup folders',
    description:
      'Returns a list of all backup folder names sorted in reverse chronological order.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of backup folder names',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: [
        'backup-2025-06-09_19-21-00',
        'backup-2025-06-09_18-00-00',
        'backup-2025-06-08_23-59-59',
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'BACKUP_DEST_PATH is not configured or read failed',
  })
  listBackups() {
    const dest = this.configService.get<string>('BACKUP_DEST_PATH');

    if (!dest) {
      throw new Error('BACKUP_DEST_PATH is not configured.');
    }

    const folders = fs.readdirSync(dest).filter((f) => f.startsWith('backup-'));
    return folders.sort().reverse();
  }
}
