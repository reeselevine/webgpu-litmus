import { useState } from 'react';
import { reportTime, runPrefixSum } from '../components/litmus-setup';
import { buildThrottle } from '../components/test-page-utils';
import prefixSum from '../shaders/prefix-sum.wgsl';

const workgroupSize = 256;

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(1);
  const [workgroups, setWorkgroups] = useState(256);
  return {
    running: {
      value: running,
      update: setRunning
    },
    iterations: {
      value: iterations,
      update: setIterations
    },
    workgroups: {
      value: workgroups,
      update: setWorkgroups
    }
  }
}

function TestRow(props) {
  const [valid, setValid] = useState(0);
  const [nonValid, setNonValid] = useState(0);
  const [time, setTime] = useState(0);
  const state = {
    valid: {
      visibleState: valid,
      internalState: 0,
      update: buildThrottle(setValid)
    },
    nonValid: {
      visibleState: nonValid,
      internalState: 0,
      update: buildThrottle(setNonValid)
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
        <td>{state.valid.visibleState}</td>
        <td>{state.nonValid.visibleState}</td>
        <td><button className="button" onClick={() => {
          doTest(props.pageState, props.shader, state);
        }} disabled={props.pageState.running.value}>Run</button></td>
      </tr>

    </>
  )
}

async function doTest(pageState, shader, state) {
  pageState.running.update(true);
  state.nonValid.internalState = 0;
  state.nonValid.update(0);
  state.valid.internalState = 0;
  state.valid.update(0);
  state.time.update(0);
  await runPrefixSum(pageState.workgroups.value, workgroupSize, shader, pageState.iterations.value, handleResult(state, pageState));
  pageState.running.update(false);
}

function handleResult(state, pageState) {
  return function (result) {
    console.log(result);
    for (let i = 0; i < workgroupSize * pageState.workgroups.value; i++) {
      if (result[i] != (i * (i + 1)) / 2) {
        console.log("Expected: " + ((i * (i + 1)) / 2).toString() + " at index " + i.toString());
        console.log("Result: " + result[i].toString());
        state.nonValid.internalState = state.nonValid.internalState + 1;
        state.nonValid.update(state.nonValid.internalState);
        state.time.update(reportTime());
        return;
      }
    }
    state.valid.internalState = state.valid.internalState + 1;
    state.valid.update(state.valid.internalState);
    state.time.update(reportTime());
  }
}

export default function PrefixSum() {
  const pageState = getPageState();
  let initialIterations = pageState.iterations.value;
  let initialWorkgroups = pageState.workgroups.value;
  return (
    <>
      <div className="section">
        <h1 className="testName">Prefix Sum</h1>
        <p>
          For <i>N</i> elements, prefix sum calculates the sum of every element up to <i>i</i> for all <i>i</i> ranging from 0 to <i>N</i>.
        </p>
      </div>

      <div className="columns">
        <div className="column is-one-fifth">
          <div className="control">
            <label><b>Iterations:</b></label>
            <input className="input" type="text" defaultValue={initialIterations} onInput={(e) => {
              pageState.iterations.update(e.target.value);
            }} disabled={pageState.running.value} />
          </div>
        </div>
        <div className="column is-one-fifth">
          <div className="control">
            <label><b>Workgroups:</b></label>
            <input className="input" type="text" defaultValue={initialWorkgroups} onInput={(e) => {
              pageState.workgroups.update(e.target.value);
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
              <th>Correct Outcomes</th>
              <th>Incorrect Outcomes</th>
              <th>Run Test</th>
            </tr>
          </thead>
          <tbody>
            <TestRow testName="Prefix Sum" pageState={pageState} shader={prefixSum} />
          </tbody>
        </table>
      </div>

    </>
  )
}