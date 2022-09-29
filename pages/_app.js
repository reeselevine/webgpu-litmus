//import '../styles/global.css'
import '../sass/style.css'
import Head from 'next/head'
import Panel from '../components/panel'
import Link from 'next/link'
export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>WebGPU Memory Model Testing</title>
        <link rel="stylesheet" href="https://www.jsdelivr.com/package/npm/bulma"></link>
        <meta name="originToken" httpEquiv="origin-trial" content="AuQlCk4zWhNm0Ykoaq0KKF2PokXbQe9XquUvWHmHL2nMVX0wxjwFp9Vi9HAFwd9r6pTZ23fHw67u3/2sas+UagUAAABSeyJvcmlnaW4iOiJodHRwczovL2dwdWhhcmJvci51Y3NjLmVkdTo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjc1MjA5NTk5fQ=="></meta>
      </Head>
      <div className="columns">
        <div className="column is-one-fifth">
          <Panel>
            <Link href="/">
              <a>← Back to home</a>
            </Link>
          </Panel>
        </div>
        <div className="column is-three-quarters">
          <Component {...pageProps} />
        </div>
      </div>
    </div>

  );
}
