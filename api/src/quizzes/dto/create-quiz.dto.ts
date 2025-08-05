import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { QuestionDto } from './question.dto';
import { Type } from 'class-transformer';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}