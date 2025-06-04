import { Injectable } from '@nestjs/common';
import { CreateBackupDto } from './dto/create-backup.dto';
import { UpdateBackupDto } from './dto/update-backup.dto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {

  constructor(private configService: ConfigService) {}



async createBackup() {
    const source = this.configService.get<string>('BACKUP_SOURCE_PATH');
    const dest = this.configService.get<string>('BACKUP_DEST_PATH');

    const scriptPath = './scripts/backup-handler.sh';
    // Prepare DB credentials
    const envVars = {
      PGUSER: this.configService.get('DB_USERNAME'),
      PGHOST: this.configService.get('DB_HOST'),
      PGPORT: this.configService.get('DB_PORT'),
      PGDATABASE: this.configService.get('DB_DATABASE'),
      PGPASSWORD: this.configService.get('DB_PASSWORD'),
      BACKUP_COUNT: this.configService.get('BACKUP_COUNT') || '2', // Optional: pass backup count too
    };

    const envString = Object.entries(envVars)
      .map(([key, val]) => `${key}=${val}`)
      .join(' ');

    const command = `${envString} bash ${scriptPath} ${source} ${dest}`;

    try {
      const { stdout } = await execAsync(command);
      return { success: true, output: stdout };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }


  async restoreBackup(backupName: string) {
  const dest = this.configService.get<string>('BACKUP_DEST_PATH');
  const sourcePath = `${dest}/${backupName}`;
  const sqlFile = `${sourcePath}/db-backup.sql`;
  const filesPath = `${sourcePath}/uploads`;

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

  const restoreCommand = `${envString} psql -f ${sqlFile}`;

  try {
    await execAsync(restoreCommand);
    await execAsync(`cp -r ${filesPath}/* ${this.configService.get('BACKUP_SOURCE_PATH')}`);
    return { success: true, message: 'Backup restored' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

}
