import { PartialType } from '@nestjs/mapped-types';
import { CreatePasswordResetTokenDto } from './create-password_reset_token.dto';

export class UpdatePasswordResetTokenDto extends PartialType(CreatePasswordResetTokenDto) {}
