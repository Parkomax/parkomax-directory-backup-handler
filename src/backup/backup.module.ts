import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { BackupStateService } from './backupState.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([]),],
  controllers: [BackupController],
  providers: [BackupService  , BackupStateService ],
})
export class BackupModule {}
