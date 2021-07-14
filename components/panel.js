import Link from'next/link'
export default function Panel(){
return(
<nav className="panel is-shadowless">
  <p className="panel-heading">
    <Link href="/">
      <a>WebGPU Litmus</a>
    </Link>
  </p>
  <div className="panel-block ">
    <div className="columns">
        <div className="column">
            <Link href="/tutorial">
                <a>Tutorial</a>
            </Link>
        </div>
        <div className="column">
            <a href="https://github.com/reeselevine/webgpu-litmus">
                <a>Github!</a>
            </a>
        </div>
    </div>
  </div>
  <div className="panel-block ">
    <Link href='/tests/message-passing'>
          Message-Passing
    </Link>
  </div>
  <div className="panel-block">
    Load Buffering
  </div>
  <div className="panel-block">
    Store Buffering
  </div>
</nav>
  );
}