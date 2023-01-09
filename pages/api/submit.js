import { databaseConnector } from '../../components/db-connector';
import { validateSubmit } from '../../components/request-validator';

export default async function handler(req, res) {
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