import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('telegram')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getAllUsers() {
    return this.appService.getAllUsers();
  }

  @Get('goods')
  getAllGoods() {
    return this.appService.getAllGoods();
  }

  @Get(':id')
  getHello(id) {
    return this.appService.getUserById(id);
  }
}
