import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { Auth } from 'firebase-admin/auth';
import { firestore } from 'firebase-admin'; // Correctly import firestore namespace

@Injectable()
export class FirebaseService {
  private readonly adminApp: App;

  constructor(private configService: ConfigService) {
    // Check if the app is already initialized to prevent errors during hot-reloading
    if (admin.apps.length === 0) {
      const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

      if (!serviceAccountPath) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not defined in the environment variables.');
      }

      // We use require() here because it dynamically loads the JSON at runtime
      const serviceAccount = require(process.cwd() + '/' + serviceAccountPath);

      this.adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin Initialized.');
    } else {
      this.adminApp = admin.app(); // Get the already initialized app
    }
  }

  // This method gets the Authentication service
  getAuth(): Auth {
    return admin.auth();
  }

  // This method gets the Firestore service
  getFirestore(): firestore.Firestore {
    return admin.firestore();
  }
}