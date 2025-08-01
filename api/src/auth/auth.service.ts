import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
    constructor(private readonly firebaseService: FirebaseService) { }

    async registerPresenter(registerDto: RegisterUserDto) {
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