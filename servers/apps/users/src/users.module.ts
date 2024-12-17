import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { PrismaService } from '../../../prisma/Prisma.service';
import { UserResolver } from './user.resolver';
import { EmailModule } from './email/email.module';
import { EmailService } from './email/email.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile:{
        federation:2,
      }
    }),
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService,ConfigService,JwtService,PrismaService,UserResolver],
})
export class UsersModule {}
