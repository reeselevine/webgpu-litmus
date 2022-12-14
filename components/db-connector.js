import mariadb from 'mariadb'

class MariaDBConnector {

  constructor() {
    this.pool = mariadb.createPool({
      host: 'localhost', 
      user:'reeselevine', 
      password: '',
      connectionLimit: 5
    });
  }

  async setup() {
    let conn;
    try {
	    conn = await this.pool.getConnection();
      let res = await conn.query("CREATE DATABASE IF NOT EXISTS gpuharbor");
      console.log(res);
      res = await conn.query(`
        CREATE TABLE IF NOT EXISTS gpuharbor.tuningResults (
          id int AUTO_INCREMENT,
          name varchar(255),
          email varchar(255),
          results JSON,
          CHECK (JSON_VALID(results)),
          PRIMARY KEY (id)
        )`);
        console.log(res);
    } catch (err) {
      throw err;
    } finally {
	    if (conn) return conn.end();
    }
  }
}

export const databaseConnector = new MariaDBConnector();
try {
  const res = await databaseConnector.setup();
} catch (err) {
  //do nothing for now
}
