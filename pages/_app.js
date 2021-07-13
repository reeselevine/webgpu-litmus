//import '../styles/global.css'
import '../sass/style.css'
import Head from 'next/head'
import Panel from '../components/panel'
export default function App({ Component, pageProps }) {
    return(
      <div>
        <Head>
         <title>WebGPU-LitmusTest</title>
         <link rel="stylesheet" href="https://www.jsdelivr.com/package/npm/bulma"></link>
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