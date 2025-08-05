import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { QuizzesModule } from './quizzes/quizzes.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
    SubscriptionsModule,
    AuthModule,
    QuizzesModule,
  ]
})
export class AppModule { }