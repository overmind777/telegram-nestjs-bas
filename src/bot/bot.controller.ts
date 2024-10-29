import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { BotService } from './bot.service';
import { Request, Response } from "express";

@Controller('telegram')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('webhook')
  async getHandleGet(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(req.body)
      await this.botService.processUpdate(req.body)
      res.sendStatus(200)
    } catch (error) {
      console.error('Error processing webhook:', error)
      res.sendStatus(400)
    }
  }
}
