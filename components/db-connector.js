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
      )`);
    setup.run();
  }

  submitTuningResults(results) {
    if (this.preparedSubmitStmt == undefined) {
      this.preparedSubmitStmt = this.db.prepare(`
        insert into tuning_results 
          (name, email, gpu_vendor, browser, os, random_seed, results)
        values
          (@name, @email, @gpu_vendor, @browser, @os, @random_seed, @results)
      `);
    }
    this.preparedSubmitStmt.run({
      name: results.userInfo.name,
      email: results.userInfo.email,
      gpu_vendor: results.platformInfo.gpu.vendor,
      browser: results.platformInfo.browser.vendor,
      os: results.platformInfo.os.vendor,
      random_seed: results.randomSeed,
      results: JSON.stringify(results)
    });
  }
}

export const databaseConnector = new SqliteConnector();