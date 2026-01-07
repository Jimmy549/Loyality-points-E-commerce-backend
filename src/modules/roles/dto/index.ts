export class CreateRoleDto {
  name: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  permissions?: string[];
  description?: string;
}

export class UpdateRoleDto {
  permissions?: string[];
  description?: string;
}