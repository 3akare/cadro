import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { firestore } from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const planPrices = {
    '1-day': 10000,
    '3-day': 25000,
    '7-day': 50000,
};

@Injectable()
export class SubscriptionsService {
    private readonly paystackSecret: string;
    private readonly callbackUrl: string;

    constructor(private configService: ConfigService, private firebaseService: FirebaseService) {
        const callbackUrl = this.configService.get<string>('PAYSTACK_CALLBACK_URL');
        const paystackSecret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

        if (!callbackUrl) throw new InternalServerErrorException('PAYSTACK_CALLBACK_URL is not defined in environment variables.');
        if (!paystackSecret) throw new InternalServerErrorException('PAYSTACK_SECRET_KEY is not defined in environment variables.');

        this.callbackUrl = callbackUrl;
        this.paystackSecret = paystackSecret;
    }

    async getPaystackSecret(): Promise<string> {
        return this.paystackSecret;
    }

    async createPaymentIntent(plan: '1-day' | '3-day' | '7-day', email: string, userId: string) {
        const amount = planPrices[plan];
        const url = 'https://api.paystack.co/transaction/initialize';

        const data = {
            email,
            amount,
            callback_url: this.callbackUrl,
            metadata: {
                userId,
                plan,
            },
        };

        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${this.paystackSecret}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }

    async activateSubscription(userId: string, plan: '1-day' | '3-day' | '7-day', transactionRef: string) {
        const db = this.firebaseService.getFirestore(); // You need to add `getFirestore` to FirebaseService
        const userRef = db.collection('users').doc(userId);
        const days = { '1-day': 1, '3-day': 3, '7-day': 7 }[plan];
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        await userRef.set({
            subscription: {
                plan,
                status: 'active',
                activatedAt: firestore.Timestamp.now(),
                expiresAt: firestore.Timestamp.fromDate(expiresAt),
                lastTransactionRef: transactionRef,
            },
        }, { merge: true });

        console.log(`Successfully activated ${plan} plan for user ${userId}`);
    }
}