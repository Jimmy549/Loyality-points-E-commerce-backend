import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('roles')
@UseGuards(AuthGuard, RolesGuard)
export class RolesController {
  constructor(private usersService: UsersService) {}

  @Post('assign')
  @Roles('SUPER_ADMIN')
  assignRole(@Body() dto: AssignRoleDto) {
    return this.usersService.assignRole(dto.email, dto.role);
  }
}