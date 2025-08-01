import { Controller, Post, Body, UseGuards, Req, Headers, RawBodyRequest, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('api/v1/subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create-intent')
    async createIntent(@Body() createSubDto: CreateSubscriptionDto, @Req() req) {
        const { userId, email } = req.user;
        return this.subscriptionsService.createPaymentIntent(createSubDto.plan, email, userId);
    }

    @Post('/webhook/paystack')
    async handlePaystackWebhook(@Headers('x-paystack-signature') signature: string, @Req() req: RawBodyRequest<Request>) {
        const secret = await this.subscriptionsService.getPaystackSecret();

        if (!req.rawBody) {
            throw new BadRequestException('Missing rawBody in request');
        }
        const hash = crypto
            .createHmac('sha512', secret)
            .update(req.rawBody)
            .digest('hex');

        if (hash !== signature) {
            throw new BadRequestException('Invalid signature');
        }

        let event: any;
        try {
            event = JSON.parse(req.rawBody.toString());
        } catch (err) {
            throw new BadRequestException('Invalid JSON in rawBody');
        }
        // "charge.success" is the event for a successful payment
        if (event && event.event === 'charge.success') {
            const { userId, plan } = event.data.metadata;
            const transactionRef = event.data.reference;
            await this.subscriptionsService.activateSubscription(userId, plan, transactionRef);
        }

        return { status: 'success' };
    }
}