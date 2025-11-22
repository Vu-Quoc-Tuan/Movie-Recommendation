import { Controller, Get } from '@nestjs/common';



@Controller()
export class AppController {
  constructor() {}
 @Get('make-server/health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}