import { Module } from '@nestjs/common';
import { NotesModule } from '../notes/notes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PostgresModule } from '../postgress/postgress.module';

@Module({
  imports: [
    NotesModule,
    AuthModule,
    PostgresModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
