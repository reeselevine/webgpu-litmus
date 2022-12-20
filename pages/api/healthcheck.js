import { runCors } from "../../components/api-helper";

export default async function handler(req, res) {
  await runCors(req, res);
  res.status(200).json({ status: 'healthy' })
}