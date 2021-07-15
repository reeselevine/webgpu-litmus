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
        </Head>
      <div className="columns">
        <div className="column is-one-quarter">
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