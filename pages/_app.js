//import '../styles/global.css'
import '../sass/style.css'
import Head from 'next/head'
import Panel from '../components/panel'
import Link from'next/link'
export default function App({ Component, pageProps }) {
    return(
      <div>
        <Head>
         <title>WebGPU-LitmusTest</title>
         <link rel="stylesheet" href="https://www.jsdelivr.com/package/npm/bulma"></link>
         <meta name="originToken" httpEquiv="origin-trial" content="At7ZfxpwxGMlaA1gEbZTXExHo2gp951QbRcDj56Ez1NLMPY/vSWsTvethUJWjEPs6/3hAMv2OR+Jl2pHwY6TfwgAAABSeyJvcmlnaW4iOiJodHRwczovL2dwdWhhcmJvci51Y3NjLmVkdTo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjUyODMxOTk5fQ=="></meta>
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