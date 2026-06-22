import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Load credentials if available
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;

let db: any;
let isMock = false;

if (PROJECT_ID && CLIENT_EMAIL && PRIVATE_KEY) {
  try {
    initializeApp({
      credential: cert({
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        privateKey: PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    db = getFirestore();
    console.log('[Firebase] Connected to real Firestore database successfully.');
  } catch (error) {
    console.error('[Firebase] Failed to initialize real Firebase SDK:', error);
    isMock = true;
  }
} else {
  isMock = true;
}

// Emulated Firestore Database Wrapper if credentials are not configured
if (isMock) {
  console.log('[Firebase] Running in Mock Firestore Mode. Syncing with local JSON storage.');
  
  const dbFilePath = path.join(process.cwd(), 'firebase_db.json');
  
  // Helper to read and write database state
  const readDb = (): any => {
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(dbFilePath, JSON.stringify({
        users: {},
        volunteers: {},
        events: {},
        tasks: {},
        activityLogs: {},
        notifications: {},
        certificates: {}
      }, null, 2));
    }
    try {
      return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    } catch {
      return {};
    }
  };

  const writeDb = (data: any) => {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  };

  // Mock document query wrapper
  class MockDocumentReference {
    private colName: string;
    private docId: string;

    constructor(colName: string, docId: string) {
      this.colName = colName;
      this.docId = docId;
    }

    async get() {
      const store = readDb();
      const docData = store[this.colName]?.[this.docId];
      return {
        exists: !!docData,
        id: this.docId,
        data: () => docData ? { ...docData, id: this.docId } : undefined
      };
    }

    async set(data: any, options?: { merge?: boolean }) {
      const store = readDb();
      if (!store[this.colName]) store[this.colName] = {};
      
      const current = store[this.colName][this.docId] || {};
      store[this.colName][this.docId] = options?.merge ? { ...current, ...data } : data;
      
      writeDb(store);
      return { id: this.docId };
    }

    async update(data: any) {
      const store = readDb();
      if (!store[this.colName]?.[this.docId]) {
        throw new Error(`Document ${this.docId} not found in ${this.colName}`);
      }
      
      store[this.colName][this.docId] = {
        ...store[this.colName][this.docId],
        ...data
      };
      writeDb(store);
      return { id: this.docId };
    }

    async delete() {
      const store = readDb();
      if (store[this.colName]?.[this.docId]) {
        delete store[this.colName][this.docId];
        writeDb(store);
      }
      return { success: true };
    }
  }

  // Mock collection query wrapper
  class MockCollectionReference {
    private colName: string;
    private queryFilters: ((item: any) => boolean)[] = [];
    private orderField: string = '';
    private orderDirection: 'asc' | 'desc' = 'asc';
    private queryLimit: number | null = null;

    constructor(colName: string) {
      this.colName = colName;
    }

    doc(id?: string) {
      const docId = id || Math.random().toString(36).substring(7);
      return new MockDocumentReference(this.colName, docId);
    }

    async add(data: any) {
      const id = Math.random().toString(36).substring(7);
      await this.doc(id).set(data);
      return { id, get: () => this.doc(id).get() };
    }

    where(field: string, operator: string, value: any) {
      const filter = (item: any) => {
        const itemVal = item[field];
        if (operator === '==') return itemVal === value;
        if (operator === '>=') return itemVal >= value;
        if (operator === '<=') return itemVal <= value;
        if (operator === 'array-contains') return Array.isArray(itemVal) && itemVal.includes(value);
        return true;
      };
      this.queryFilters.push(filter);
      return this;
    }

    orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
      this.orderField = field;
      this.orderDirection = direction;
      return this;
    }

    limit(num: number) {
      this.queryLimit = num;
      return this;
    }

    async get() {
      const store = readDb();
      const colItems = store[this.colName] || {};
      
      let items = Object.keys(colItems).map(id => ({
        ...colItems[id],
        id
      }));

      // Apply filters
      for (const filter of this.queryFilters) {
        items = items.filter(filter);
      }

      // Apply ordering
      if (this.orderField) {
        items.sort((a: any, b: any) => {
          const aVal = a[this.orderField];
          const bVal = b[this.orderField];
          if (aVal === undefined || bVal === undefined) return 0;
          if (typeof aVal === 'string') {
            return this.orderDirection === 'asc' 
              ? aVal.localeCompare(bVal) 
              : bVal.localeCompare(aVal);
          }
          return this.orderDirection === 'asc' 
            ? aVal - bVal 
            : bVal - aVal;
        });
      }

      // Apply limit
      if (this.queryLimit !== null) {
        items = items.slice(0, this.queryLimit);
      }

      return {
        empty: items.length === 0,
        size: items.length,
        docs: items.map(item => ({
          id: item.id,
          exists: true,
          data: () => item
        }))
      };
    }
  }

  db = {
    collection: (name: string) => new MockCollectionReference(name)
  };
}

export { db, isMock };
