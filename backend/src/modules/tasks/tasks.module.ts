import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { UserTask } from './entities/user-task.entity';
import { PointsModule } from '../points/points.module';
import { UserTokensModule } from '../tokens/user-tokens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, UserTask]),
    PointsModule,
    UserTokensModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
