import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterUserDto } from './dto/register-user.dto';
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

            // Here, you could fetch user data from your Firestore `users` collection if needed
            // For now, we'll just use the data from the token
            const payload = { sub: uid, email };
            // Sign and return our custom backend JWT
            const accessToken = this.jwtService.sign(payload);
            return { accessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid Firebase token.');
        }
    }

    async register(registerDto: RegisterUserDto) {
        const { email, password } = registerDto;
        const auth = this.firebaseService.getAuth();

        try {
            const userRecord = await auth.createUser({
                email,
                password,
                emailVerified: false,
                disabled: false,
            });
            return { uid: userRecord.uid, email: userRecord.email };
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                throw new BadRequestException('The email address is already in use by another account.');
            }
            throw new InternalServerErrorException('An error occurred during registration.');
        }
    }
}