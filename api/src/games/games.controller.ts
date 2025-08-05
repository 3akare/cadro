import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GamesService } from './games.service';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateGameDto {
    @IsString()
    @IsNotEmpty()
    quizId: string;
}

@UseGuards(JwtAuthGuard)
@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    @Post()
    create(@Body() createGameDto: CreateGameDto, @Req() req) {
        const { userId } = req.user;
        return this.gamesService.create(createGameDto.quizId, userId);
    }
}