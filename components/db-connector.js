import Database from 'better-sqlite3'

const DB_PATH = "./gpuharbor.db";

class SqliteConnector {

  constructor() {
    this.db = new Database(DB_PATH);
    const setup = this.db.prepare(`
      create table if not exists tuning_results (
        name text,
        email text,
        gpu_vendor text,
        browser text,
        os text,
        random_seed text,
        results text
      );`);
    setup.run();
  }
}

export const databaseConnector = new SqliteConnector();