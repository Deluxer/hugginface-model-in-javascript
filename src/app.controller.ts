import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('vectors')
  getVector() {
    return this.appService.getVector();
  }

  @Get('vectors/search')
  search(@Query('word') word: string) {
    return this.appService.semanticSearch(word);
  }
}
