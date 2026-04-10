import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { TradingModule } from './modules/trading/trading.module';
import { AmmModule } from './modules/amm/amm.module';
import { DramasModule } from './modules/dramas/dramas.module';
import { WatchModule } from './modules/watch/watch.module';
import { PointsModule } from './modules/points/points.module';
import { ShopModule } from './modules/shop/shop.module';
import { VipModule } from './modules/vip/vip.module';
import { StakeModule } from './modules/stake/stake.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { InviteModule } from './modules/invite/invite.module';
import { KycModule } from './modules/kyc/kyc.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { AdsModule } from './modules/ads/ads.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';
import { DeviceFingerprintModule } from './modules/device-fingerprint/device-fingerprint.module';
import { RiskModule } from './modules/risk/risk.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'funreelrwa',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
      logging: process.env.DB_LOGGING === 'true',
    }),
    AuthModule,
    UsersModule,
    AssetsModule,
    TradingModule,
    AmmModule,
    DramasModule,
    WatchModule,
    PointsModule,
    ShopModule,
    VipModule,
    StakeModule,
    TasksModule,
    InviteModule,
    KycModule,
    WalletModule,
    AdsModule,
    BlockchainModule,
    WebsocketsModule,
    DeviceFingerprintModule,
    RiskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
