import { IsIn, IsString } from 'class-validator';

export class CreateSubscriptionDto {
    @IsString()
    @IsIn(['1-day', '3-day', '7-day'])
    plan: '1-day' | '3-day' | '7-day';
}