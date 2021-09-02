export function buildPseudoCode(threads, sameWorkgroup = false) {
    let pseudoCode = new Array(threads.length);
    for (let i = 0; i < threads.length; i++) {
      var thread;
      var workgroup;
      if (sameWorkgroup) {
        workgroup = 0;
        thread = i;
      } else {
        workgroup = i;
        thread = 0;
      }
      pseudoCode[i] = <TestThreadPseudoCode key={i} workgroup={workgroup} thread={thread} code={threads[i]}/>;
    }
    if (threads.length == 4) {
        return <>
            <div className="columns">
                {pseudoCode.slice(0, 2)}
            </div>
            <div className="columns">
                {pseudoCode.slice(2, 4)}
            </div>
        </>;
    } else {
        return <>
            <div className="columns">
                {pseudoCode}
            </div>
        </>;
    }
}

function TestThreadPseudoCode(props) {
    return (
        <div className="column">
            <div className="box">
                <b>Workgroup {props.workgroup} Thread {props.thread}</b>
                <pre><code>
                    {props.code}
                </code></pre>
            </div>
        </div>
    )
}

export function TestSetupPseudoCode(props) {
    return (
        <>
        <div className="box">
            <b>Initial State</b> <code>{props.init}</code> <b>Final State:</b> <code>{props.finalState}</code>
        </div>
        </>
    )
}