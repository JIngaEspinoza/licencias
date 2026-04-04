import { Injectable } from '@nestjs/common';
import { CreatePasswordResetTokenDto } from './dto/create-password_reset_token.dto';
import { UpdatePasswordResetTokenDto } from './dto/update-password_reset_token.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PasswordResetTokenService {
  constructor(private readonly prisma: PrismaService){}

  create(createPasswordResetTokenDto: CreatePasswordResetTokenDto) {
    return 'This action adds a new passwordResetToken';
  }

  findAll() {
    return this.prisma.passwordResetToken.findMany({ orderBy: { id: 'asc' } });
  }

  findOne(id: number) {
    return `This action returns a #${id} passwordResetToken`;
  }

  update(id: number, updatePasswordResetTokenDto: UpdatePasswordResetTokenDto) {
    return `This action updates a #${id} passwordResetToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} passwordResetToken`;
  }
}
