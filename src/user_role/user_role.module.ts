import { Module } from '@nestjs/common';
import { UserRoleService } from './user_role.service';
import { UserRoleController } from './user_role.controller';

@Module({
  controllers: [UserRoleController],
  providers: [UserRoleService],
})
export class UserRoleModule {}
