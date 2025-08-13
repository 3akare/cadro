import { Controller, Get, Post, Body, UseGuards, Req, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// REMOVED: @UseGuards(JwtAuthGuard) from here
@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Post()
    @UseGuards(JwtAuthGuard) // Guard is now applied individually
    create(@Body() createQuizDto: CreateQuizDto, @Req() req) {
        const { userId } = req.user;
        return this.quizzesService.create(createQuizDto, userId);
    }

    @Get()
    @UseGuards(JwtAuthGuard) // Guard is now applied individually
    findAll(@Req() req) {
        const { userId } = req.user;
        return this.quizzesService.findAllForPresenter(userId);
    }

    // --- THIS ROUTE IS NOW PUBLIC ---
    // Anyone with a quiz ID (like a participant in a game) can fetch the quiz data.
    // The service layer will still perform an ownership check if a userId is passed,
    // but we won't pass one for public access.
    @Get(':id')
    findOne(@Param('id') id: string) {
        // We remove the @Req() and the userId. We need to modify the service for this.
        return this.quizzesService.findOnePublic(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard) // Guard is now applied individually
    update(@Param('id') id: string, @Body() updateQuizDto: CreateQuizDto, @Req() req) {
        const { userId } = req.user;
        return this.quizzesService.update(id, updateQuizDto, userId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard) // Guard is now applied individually
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @Req() req) {
        const { userId } = req.user;
        return this.quizzesService.remove(id, userId);
    }
}