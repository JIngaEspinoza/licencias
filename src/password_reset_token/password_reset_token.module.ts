import { Module } from '@nestjs/common';
import { PasswordResetTokenService } from './password_reset_token.service';
import { PasswordResetTokenController } from './password_reset_token.controller';

@Module({
  controllers: [PasswordResetTokenController],
  providers: [PasswordResetTokenService],
})
export class PasswordResetTokenModule {}
