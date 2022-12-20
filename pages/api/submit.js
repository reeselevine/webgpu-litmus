import Cors from 'cors'
import fs from 'fs'
import { databaseConnector } from '../../components/db-connector';
import { validateSubmit } from '../../components/request-validator';

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
    res.status(405).send({ error: 'Only POST requests allowed' });
    return;
  }
  const valid = validateSubmit(req.body);
  if (!valid) {
    console.log(validateSubmit.errors);
    res.status(400).send({ error: validateSubmit.errors});
    return;
  }
  try {
    databaseConnector.submitTuningResults(req.body);
    res.status(200).send();
  } catch (err) {
    console.log(err.message);
    res.status(500).send({error: err.message});
  }
}