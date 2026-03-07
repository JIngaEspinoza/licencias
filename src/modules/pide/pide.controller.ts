import { Controller } from '@nestjs/common';
import { PideService } from './pide.service';

@Controller('pide')
export class PideController {
  constructor(private readonly pideService: PideService) {}
}
