export function buildPseudoCode(threads) {
    let pseudoCode = new Array(threads.length);
    for (let i = 0; i < threads.length; i++) {
        pseudoCode[i] = <TestThreadPseudoCode thread={i} code={threads[i]}/>;
    }
    return pseudoCode;
}

export function TestThreadPseudoCode(props) {
    return (
        <div className="column">
            <div className="box">
                <b>Thread {props.thread}</b>
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