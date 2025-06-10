import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available app-wide
    }),
    //db connection
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory:(ConfigService:ConfigService)=>({
        type:'postgres',
        host:ConfigService.get('DB_HOST'),
        port:+ConfigService.get('DB_PORT'),
        username:ConfigService.get('DB_USERNAME'),
        password:ConfigService.get('DB_PASSWORD'),
        database:ConfigService.get('DB_DATABASE'),
        entities: [],
        synchronize: true,
      }),
      inject:[ConfigService]
    }),

    ScheduleModule.forRoot()

  ]
  
})
export class AppModule {}
