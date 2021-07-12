//import '../styles/global.css'
import '../sass/style.css'
import Head from 'next/head'
import Panel from '../components/panel'
export default function App({ Component, pageProps }) {
    return(
      <div>
        <Head>
         <title>WebGPU-LitmusTest</title>
         <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.2/css/bulma.min.css"></link>
        </Head>
      <div className="columns">
        <div className="column is-one-quarter">
         <Panel></Panel>
        </div>
        <div className="column is-two-thrid">
         <Component {...pageProps} />
        </div>
      </div>
     
      </div>
      
    );
  }