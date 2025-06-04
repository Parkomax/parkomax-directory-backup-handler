import { Injectable } from "@nestjs/common";

@Injectable()
export class BackupConfigService {
  getBackupPath(): string {
    return process.env.BACKUP_PATH || '/default/path';
  }

  getRetentionCount(): number {
    return Number(process.env.BACKUP_COUNT || 2);
  }

  getOS(): 'linux' | 'windows' {
    return process.env.OS_TYPE === 'windows' ? 'windows' : 'linux';
  }

  getIsAutoBackupEnabled(): boolean {
    return process.env.AUTO_BACKUP === 'true';
  }

  // Add more getters/setters as needed
}
