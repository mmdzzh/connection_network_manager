import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../../data.sqlite');

export function openDb(): Database {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Failed to open database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
    }
  });
  // SQLite 默认关闭外键约束，必须显式开启
  db.run('PRAGMA foreign_keys = ON');
  return db;
}

export function initDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = openDb();
    db.exec(
      `
      CREATE TABLE IF NOT EXISTS persons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        avatar TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_person_id INTEGER NOT NULL,
        to_person_id INTEGER NOT NULL,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_person_id) REFERENCES persons(id) ON DELETE CASCADE,
        FOREIGN KEY (to_person_id) REFERENCES persons(id) ON DELETE CASCADE,
        UNIQUE(from_person_id, to_person_id)
      );
      `,
      (err) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }
        // 迁移：为已存在的关系表添加 type 列
        db.run('ALTER TABLE relationships ADD COLUMN type TEXT', (_alterErr) => {
          db.close();
          console.log('Database initialized.');
          resolve();
        });
      }
    );
  });
}

export function run(sql: string, params: unknown[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    const db = openDb();
    db.run(sql, params, function (err) {
      db.close();
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const db = openDb();
    db.get(sql, params, (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

export function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const db = openDb();
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}
