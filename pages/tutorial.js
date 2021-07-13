import Layout from '../components/layout'
import Link from 'next/link'
export default function Tutorial(){
    return (
        <Layout>
          <h1>This is the tutorial</h1>
          <h2>
            <Link href="/">
              <a>Back to home</a>
            </Link>
          </h2>
        </Layout>
      );
}