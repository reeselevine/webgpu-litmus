import { useState } from 'react';
import { reportTime, runParallelLitmusTest } from '../components/litmus-setup';
import { buildThrottle } from '../components/test-page-utils';
import mp from '../shaders/message-passing-parallel.wgsl';

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(1000);
  return {
    running: {
      value: running,
      update: setRunning
    },
    iterations: {
      value: iterations,
      update: setIterations
    }
  }
}

function TestRow(props) {
  const [nonWeak, setNonWeak] = useState(0);
  const [weak, setWeak] = useState(0);
  const [time, setTime] = useState(0);
  const state = {
    nonWeak: {
      visibleState: nonWeak,
      internalState: 0,
      update: buildThrottle(setNonWeak)
    },
    weak: {
      visibleState: weak,
      internalState: 0,
      update: buildThrottle(setWeak)
    },
    time: {
      value: time,
      update: buildThrottle(setTime)
    }
  };
  return (
    <>
      <tr>
        <th>{props.testName}</th>
        <td>{state.time.value}</td>
        <td>{state.nonWeak.visibleState}</td>
        <td>{state.weak.visibleState}</td>
        <td><button className="button" onClick={() => {
          doTest(props.pageState, props.shader, state);
        }} disabled={props.pageState.running.value}>Run</button></td>
      </tr>

    </>
  )
}

async function doTest(pageState, shader, state) {
  pageState.running.update(true);
  state.weak.internalState = 0;
  state.weak.update(0);
  state.nonWeak.internalState = 0;
  state.nonWeak.update(0);
  state.time.update(0);
  await runParallelLitmusTest(shader, pageState.iterations.value, handleResult(state))
  pageState.running.update(false);
}

function handleResult(state) {
  return function (result) {
    console.log(result);
    state.weak.internalState = state.weak.internalState + result[0];
    state.nonWeak.internalState = state.nonWeak.internalState + 65536 - result[0];
    state.weak.update(state.weak.internalState);
    state.nonWeak.update(state.nonWeak.internalState);
    state.time.update(reportTime());
  }
}



export default function ParallelPlayground() {
  const pageState = getPageState();
  let initialIterations = pageState.iterations.value;

  return (
    <>
      <div className="columns">
        <div className="column is-one-fifth">
          <div className="control">
            <label><b>Iterations:</b></label>
            <input className="input" type="text" defaultValue={initialIterations} onInput={(e) => {
              pageState.iterations.update(e.target.value);
            }} disabled={pageState.running.value} />
          </div>
        </div>
      </div>
      <div className="table-container">
        <table className="table is-hoverable">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Time (seconds)</th>
              <th>Non-Weak Behaviors</th>
              <th>Weak Behaviors</th>
              <th>Run Test</th>
            </tr>
          </thead>
          <tbody>
            <TestRow testName="Message Passing" pageState={pageState} shader={mp}/>
          </tbody>
        </table>
      </div>

    </>
  )
}