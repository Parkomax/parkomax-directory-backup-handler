import { Injectable } from '@nestjs/common';

import { exec } from 'child_process';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import { ApiResponses } from 'src/common/api-response.interface';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  constructor(private configService: ConfigService) {}

  async createBackup(): Promise<
    ApiResponses<{ consoleOutput: string; inputParams: any }>
  > {
    const source = this.configService.get<string>('BACKUP_SOURCE_PATH');
    const dest = this.configService.get<string>('BACKUP_DEST_PATH');

    // const scriptPath = './scripts/backup-handler.sh';
    const osType = this.configService.get<string>('OS_TYPE'); // 'linux' | 'windows'
    const isWindows = osType === 'windows';
    console.log('is', isWindows);
    const scriptPath = isWindows
      ? 'scripts\\backup-handler-windows.bat'
      : './scripts/backup-handler.sh';
    console.log('is', osType);
    // Prepare DB credentials
    const envVars = {
      PGUSER: this.configService.get('DB_USERNAME'),
      PGHOST: this.configService.get('DB_HOST'),
      PGPORT: this.configService.get('DB_PORT'),
      PGDATABASE: this.configService.get('DB_DATABASE'),
      PGPASSWORD: this.configService.get('DB_PASSWORD'),
      BACKUP_COUNT: this.configService.get('BACKUP_COUNT') || '2', // Optional: pass backup count too
    };

    console.log('envars', envVars);

    const envString = Object.entries(envVars)
      .map(([key, val]) => `${key}=${val}`)
      .join(' ');

    const command = `${envString} bash ${scriptPath} ${source} ${dest}`;

    try {
      const { stdout } = await execAsync(command);
      return {
        success: true,
        message: 'Backup script run successfully',
        data: {
          consoleOutput: stdout,
          inputParams: {
            source,
            destination: dest,
            osType,
            scriptUsed: scriptPath,
          },
        },
      };
    } catch (err) {
      return {
        success: false,
        message: 'Backup script execution failed',
        errors: [
          {
            name: 'BackupScriptError',
            type: 'ExecutionError',
            errors: [err.message],
          },
        ],
      };
    }
  }

  async restoreBackup(backupName: string) {
    const dest = this.configService.get<string>('BACKUP_DEST_PATH');
    console.log('dest', dest);
    console.log('backup', backupName);
    const sourcePath = `${dest}/${backupName}`;
    console.log('sourcepath', sourcePath);
    const sqlFile = `${sourcePath}/db_backup.dump`;
    const filesPath = `${sourcePath}/files`;

    const envVars = {
      PGUSER: this.configService.get('DB_USERNAME'),
      PGHOST: this.configService.get('DB_HOST'),
      PGPORT: this.configService.get('DB_PORT'),
      PGDATABASE: this.configService.get('DB_DATABASE'),
      PGPASSWORD: this.configService.get('DB_PASSWORD'),
    };

    const envString = Object.entries(envVars)
      .map(([key, val]) => `${key}=${val}`)
      .join(' ');

    const restoreCommand = `${envString} pg_restore --clean --no-owner --dbname=${envVars.PGDATABASE} ${sqlFile}`;

    try {
      await execAsync(restoreCommand);
      await execAsync(
        `cp -r ${filesPath}/* ${this.configService.get('BACKUP_SOURCE_PATH')}`,
      );
      return { success: true, message: 'Backup restored' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}
