import Link from 'next/link'
import { runLitmusTest } from '../../components/litmus-setup.js'

export default function MessagePassingStress() {
  try {
    const p = runLitmusTest();
    if (p instanceof Promise) {
      p.catch((err) => {
        console.error(err);
        setError(err);
      });
    }
  } catch (err) {
    console.error(err);
    setError(err);
  }
  return (
      <>
        <h1>Message Passing (with stress)</h1>
        <h2>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </h2>
      </>
    )
}
