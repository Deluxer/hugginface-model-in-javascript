import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('data-loader')
  getVector() {
    return this.appService.dataLoader();
  }

  @Get('vector/search')
  search(@Query('word') word: string) {
    return this.appService.semanticSearch(word);
  }
}
