import { Controller, Get } from '@nestjs/common';
import { NominationService } from './nomination.service';

@Controller('nomination')
export class NominationController {
  constructor(private readonly nominationService: NominationService) {}

  // @Get('stats')
  // async getStats() {
  //   return this.nominationService.getNominationStats();
  // }
}
