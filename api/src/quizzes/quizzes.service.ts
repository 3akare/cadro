import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { firestore } from 'firebase-admin';

@Injectable()
export class QuizzesService {
    private readonly db: firestore.Firestore;

    constructor(private firebaseService: FirebaseService) {
        this.db = this.firebaseService.getFirestore();
    }

    async create(createQuizDto: CreateQuizDto, userId: string) {
        const plainQuizObject = JSON.parse(JSON.stringify(createQuizDto));

        const quizData = {
            ...plainQuizObject,
            creatorId: userId,
            createdAt: firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await this.db.collection('quizzes').add(quizData);

        return { id: docRef.id, ...quizData };
    }

    async findAllForPresenter(userId: string) {
        const quizzesSnapshot = await this.db.collection('quizzes')
            .where('creatorId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        if (quizzesSnapshot.empty) {
            return [];
        }

        const quizzes = quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return quizzes;
    }

    async findOne(id: string, userId: string) {
        const docRef = this.db.collection('quizzes').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new NotFoundException(`Quiz with ID "${id}" not found.`);
        }

        const quizData = doc.data();
        if (!quizData || quizData.creatorId !== userId) {
            throw new ForbiddenException('You are not authorized to access this quiz.');
        }

        return { id: doc.id, ...quizData };
    }

    async findOnePublic(id: string) {
        const docRef = this.db.collection('quizzes').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new NotFoundException(`Quiz with ID "${id}" not found.`);
        }

        return { id: doc.id, ...doc.data() };
    }

    async update(id: string, updateQuizDto: CreateQuizDto, userId: string) {
        await this.findOne(id, userId);

        const docRef = this.db.collection('quizzes').doc(id);
        const plainQuizObject = JSON.parse(JSON.stringify(updateQuizDto));

        await docRef.update(plainQuizObject);

        return { id, ...plainQuizObject };
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);

        const docRef = this.db.collection('quizzes').doc(id);
        await docRef.delete();

        return { message: `Successfully deleted quiz with ID "${id}"` };
    }
}