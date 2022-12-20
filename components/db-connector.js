import Database from 'better-sqlite3'

const DB_PATH = "./gpuharbor.db";

class SqliteConnector {

  constructor() {
    this.db = new Database(DB_PATH);
    const setup = this.db.prepare(`
      create table if not exists tuning_results (
        name text,
        email text,
        results text
      );`);
    const info = setup.run();
    console.log(info.changes);
  }

}

export const databaseConnector = new SqliteConnector();