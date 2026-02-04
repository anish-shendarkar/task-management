import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    UserModule, AdminModule, AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
