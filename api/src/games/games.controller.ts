import { Controller, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GamesService } from './games.service';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateGameDto {
    @IsString()
    @IsNotEmpty()
    quizId: string;
}

interface AnswerSubmission {
    answer: string;
    participantId: string;
    timeLeft: number; // NEW: The time left on the clock when submitted
}

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createGameDto: CreateGameDto, @Req() req) {
        const { userId } = req.user;
        return this.gamesService.create(createGameDto.quizId, userId);
    }

    @Post(':gameCode/start')
    @UseGuards(JwtAuthGuard)
    start(@Param('gameCode') gameCode: string, @Req() req) {
        const { userId } = req.user;
        return this.gamesService.startGame(gameCode, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':gameCode/next')
    nextQuestion(@Param('gameCode') gameCode: string, @Req() req) {
        const { userId } = req.user;
        return this.gamesService.nextQuestion(gameCode, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':gameCode/leaderboard')
    showLeaderboard(@Param('gameCode') gameCode: string, @Req() req) {
        const { userId } = req.user;
        return this.gamesService.showLeaderboard(gameCode, userId);
    }

    @Post(':gameCode/submit')
    submitAnswer(@Param('gameCode') gameCode: string, @Body() submission: AnswerSubmission) {
        return this.gamesService.submitAnswer(gameCode, submission);
    }
}