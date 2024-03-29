import Link from 'next/link'
export default function Panel({ children }) {
  return (
    <nav className="panel is-shadowless">
      <div className="panel-heading">
        <Link href="/">
          WebGPU Memory Model Testing
        </Link>
      </div>
      <div className="panel-block">
        <Link href="/tuning">
          <a>Tune/Conform</a>
        </Link>
      </div>
      <div className="panel-block">
        <b>Weak Memory Tests:</b>
      </div>
      <div className="panel-block ">
        <Link href='/tests/message-passing'>
          Message Passing
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/store'>
          Store
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/read'>
          Read
        </Link>
      </div>

      <div className="panel-block ">
        <Link href='/tests/load-buffer'>
          Load Buffer
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/store-buffer'>
          Store Buffer
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/2-plus-2-write'>
          2+2 Write
        </Link>
      </div>
      <div className="panel-block">
        <b>Coherence Tests:</b>
      </div>
      <div className="panel-block ">
        <Link href='/tests/corr'>
          CoRR
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/coww'>
          CoWW
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/cowr'>
          CoWR
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/corw1'>
          CoRW1
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/corw2'>
          CoRW2
        </Link>
      </div>
      <div className="panel-block">
        <b>Atomicity Tests:</b>
      </div>
      <div className="panel-block ">
        <Link href='/tests/atomicity'>
          Atomicity
        </Link>
      </div>
      <div className="panel-block">
        <b>Workgroup Execution Barrier Tests:</b>
      </div>
      <div className="panel-block ">
        <Link href='/tests/barrier-store-load'>
          Barrier Store Load
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/barrier-load-store'>
          Barrier Load Store
        </Link>
      </div>
      <div className="panel-block ">
        <Link href='/tests/barrier-store-store'>
          Barrier Store Store
        </Link>
      </div>
      <div className="panel-block ">
        <div className="columns">
          <div className="column">
            <footer className="footer">
              <div className="content has-text-centered">
                Developed and maintained at UC Santa Cruz by <a href="https://users.soe.ucsc.edu/~reeselevine">Reese Levine</a> and <a href="http://linkedin.com/in/tim-guo-04a574194">Tim Guo</a>,
                working with Professor <a href="https://users.soe.ucsc.edu/~tsorensen">Tyler Sorensen</a>. This work is supported in part by a gift from Google.
              </div>
            </footer>
          </div>
        </div>
      </div>
      <div className="panel-block ">
        <a href="https://github.com/reeselevine/webgpu-litmus">
          Github
        </a>
      </div>
    </nav>
  );
}