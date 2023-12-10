import { User } from '@org/graphql';
import {
  DocumentData,
  DocumentSnapshot,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { database } from './firebase';

export const streamUser = (
  uid: User['id'],
  snapshot: {
    (docSnapshot: DocumentSnapshot<DocumentData>): void;
  }
) => {
  const docRef = doc(database, 'users', uid);
  return onSnapshot(docRef, snapshot);
};
