import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import type { app as adminAppType } from 'firebase-admin'; // <-- key change
import { Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private adminApp: adminAppType.App; // <-- updated type

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

    if (!serviceAccountPath) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not defined in the environment variables.');
    }

    const resolvedPath = path.resolve(serviceAccountPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Firebase service account file not found at path: ${resolvedPath}`);
    }

    const serviceAccount = require(resolvedPath);

    this.adminApp =
      admin.apps.length === 0
        ? admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          })
        : admin.app();
  }

  getAuth(): Auth {
    return this.adminApp.auth(); // ✅ now properly typed
  }
}
