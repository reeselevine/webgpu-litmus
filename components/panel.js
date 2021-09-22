import Link from'next/link'
export default function Panel({children}){
return(
<nav className="panel is-shadowless">
  <div className="panel-heading">
    <Link href="/">
      WebGPU Litmus
    </Link>
  </div>
  <div className="panel-block ">
    <div className="columns">
        <div className="column">
            <Link href="/tutorial">
                <a>Tutorial</a>
            </Link>
        </div>
        <div className="column">
            <a href="https://github.com/reeselevine/webgpu-litmus">
                Github!
            </a>
        </div>
    </div>
  </div>
  <div className="panel-block">
    <Link href="/conformance">
      <a>Conformance Test Suite</a>
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
    <Link href='/tests/corr4'>
         4-Threaded CoRR 
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
          Here is the footer
          </div>
        </footer>
      </div>
    </div>
  </div>
  
</nav>
  );
}