import { Controller, Get, Post, Body, UseGuards, Req, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Post()
    create(@Body() createQuizDto: CreateQuizDto, @Req() req) {
        const { userId } = req.user; // Get userId from the token payload
        console.log(createQuizDto)
        return this.quizzesService.create(createQuizDto, userId);
    }

    @Get()
    findAll(@Req() req) {
        const { userId } = req.user;
        return this.quizzesService.findAllForPresenter(userId);
    }

    // --- NEW: Get a single quiz by ID ---
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req) {
        const { userId } = req.user;
        return this.quizzesService.findOne(id, userId);
    }

    // --- NEW: Update a quiz by ID ---
    @Put(':id')
    update(@Param('id') id: string, @Body() updateQuizDto: CreateQuizDto, @Req() req) {
        const { userId } = req.user;
        return this.quizzesService.update(id, updateQuizDto, userId);
    }

    // --- NEW: Delete a quiz by ID ---
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT) // Sets the status code to 204 on success
    remove(@Param('id') id: string, @Req() req) {
        const { userId } = req.user;
        return this.quizzesService.remove(id, userId);
    }
}