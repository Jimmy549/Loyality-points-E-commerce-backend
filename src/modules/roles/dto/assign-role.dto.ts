import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'Email of the user to assign role to' 
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ 
    example: 'ADMIN', 
    description: 'Role to assign', 
    enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] 
  })
  @IsEnum(['USER', 'ADMIN', 'SUPER_ADMIN'], { 
    message: 'Role must be one of: USER, ADMIN, SUPER_ADMIN' 
  })
  @IsNotEmpty({ message: 'Role is required' })
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}
