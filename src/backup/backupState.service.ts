import { Injectable } from "@nestjs/common";

@Injectable()
export class BackupStateService {
  private isAutoBackupEnabled = true;
  private isCleanupEnabled = true;

  toggleBackup(enabled: boolean) {
    this.isAutoBackupEnabled = enabled;
  }

  isBackupEnabled() {
    return this.isAutoBackupEnabled;
  }

  toggleCleanup(enabled: boolean) {
    this.isCleanupEnabled = enabled;
  }

  isCleanupEnabledFn() {
    return this.isCleanupEnabled;
  }
}
