import { IsString, IsNotEmpty, IsArray, IsIn, IsNumber, IsOptional, ArrayMinSize } from 'class-validator';

export class QuestionDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsIn(['multiple-choice', 'true-false', 'text-entry'])
    type: 'multiple-choice' | 'true-false' | 'text-entry';

    @IsNumber()
    timer: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    options?: string[];

    @IsString()
    @IsNotEmpty()
    answer: string;
}