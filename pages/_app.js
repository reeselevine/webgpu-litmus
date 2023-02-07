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
        <meta name="originToken" httpEquiv="origin-trial" content="Ah4uWU+/egyrlov7rmCK2NGM3x2rhtHGK7E5WWtmq3ESA+JdCBbr29qZkE2iYWZBZJ72McNs+9cJ8PcIKaI67gAAAABSeyJvcmlnaW4iOiJodHRwczovL2dwdWhhcmJvci51Y3NjLmVkdTo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjkxNzExOTk5fQ=="></meta>
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
