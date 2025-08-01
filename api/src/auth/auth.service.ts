import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly jwtService: JwtService,
    ) { }

    async login(firebaseToken: string): Promise<{ accessToken: string }> {
        const auth = this.firebaseService.getAuth();
        try {
            const decodedToken: DecodedIdToken = await auth.verifyIdToken(firebaseToken);
            const { uid, email } = decodedToken;

            const db = this.firebaseService.getFirestore();
            const userRef = db.collection('users').doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                await userRef.set({
                    email,
                    createdAt: new Date(),
                    subscription: {
                        plan: null,
                        status: 'expired',
                        expiresAt: null
                    }
                });
            }
            const payload = { sub: uid, email };
            const accessToken = this.jwtService.sign(payload);
            return { accessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid Firebase token.');
        }
    }
}