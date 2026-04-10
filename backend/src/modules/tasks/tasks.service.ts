import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { UserTask } from './entities/user-task.entity';
import { PointsService } from '../points/points.service';
import { UserTokensService } from '../tokens/user-tokens.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,
    private readonly pointsService: PointsService,
    private readonly userTokensService: UserTokensService,
  ) {}

  async getTasks(userId: number, type?: number) {
    let query = this.taskRepository.createQueryBuilder('t')
      .where('t.status = 1');
    
    if (type !== undefined) {
      query = query.andWhere('t.type = :type', { type });
    }

    const tasks = await query.getMany();
    
    // Join user progress
    const result = await Promise.all(tasks.map(async (task) => {
      const userTask = await this.userTaskRepository.findOne({
        where: { userId, taskId: task.id },
      });
      return {
        ...task,
        progress: userTask?.progress || 0,
        status: userTask?.status || 0,
      };
    }));

    return result;
  }

  async claim(userId: number, taskId: number) {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    let userTask = await this.userTaskRepository.findOne({ where: { userId, taskId } });
    if (!userTask) {
      userTask = this.userTaskRepository.create({ userId, taskId, progress: 0, status: 0 });
    }

    if (userTask.status !== 2) { // 2 = can claim
      return { success: false, message: 'Task not completed' };
    }

    // Grant rewards
    if (task.rewardPoints > 0) {
      await this.pointsService.addPoints(userId, task.rewardPoints, 6, `task_${taskId}`);
    }
    if (task.rewardToken && task.rewardToken > 0) {
      await this.userTokensService.addReward(userId, task.rewardToken, 'task', undefined);
    }

    userTask.status = 3; // completed and claimed
    await this.userTaskRepository.save(userTask);

    return {
      success: true,
      pointsEarned: task.rewardPoints,
      tokenEarned: task.rewardToken,
    };
  }
}
