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
  <div className="panel-block ">
    <Link href='/tests/message-passing'>
          Message Passing
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
    <Link href='/tests/corr'>
         CoRR 
    </Link>
  </div>
  <div className="panel-block ">
    <Link href='/tests/corr-rmw'>
         CoRR RMW 
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

</nav>
  );
}