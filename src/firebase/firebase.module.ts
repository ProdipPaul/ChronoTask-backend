import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin/firebase-admin.service';

@Module({
  providers: [FirebaseAdminService]
})
export class FirebaseModule {}
