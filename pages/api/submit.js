import Cors from 'cors'
import fs from 'fs'
import { databaseConnector } from '../../components/db-connector';

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  origin: process.env.corsAllow
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware( req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
  fs.writeFile('/Users/reeselevine/dev/webgpu-litmus/test.txt', JSON.stringify(req.body), err => {
    if (err) {
      console.error(err);
    }
  });
  res.status(200).send();
}