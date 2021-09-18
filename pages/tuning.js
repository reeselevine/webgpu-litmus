import { useState } from 'react';
import { buildThrottle, loadBufferHandlers, messagePassingHandlers, randomConfig } from '../components/test-page-utils.js';
import { reportTime, getCurrentIteration, runLitmusTest } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import messagePassing from '../shaders/message-passing.wgsl';
import loadBuffer from '../shaders/load-buffer.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const keys = ["seq", "interleaved", "weak"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(100);
  const [tuningTimes, setTuningTimes] = useState(2);
  const [rows, setRows] = useState([]);
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [completedTests, setCompletedTests] = useState(0);
  return {
    running: {
      value: running,
      update: setRunning
    },
    iterations: {
      value: iterations,
      update: setIterations
    },
    tuningTimes: {
      value: tuningTimes,
      update: setTuningTimes
    },
    tuningRows: {
      value: rows,
      update: setRows
    },
    seq: {
      ...buildStateValues(seq, setSeq)
    },
    interleaved: {
      ...buildStateValues(interleaved, setInterleaved)
    },
    weak: {
      ...buildStateValues(weak, setWeak)
    },
    totalTime: {
      ...buildStateValues(totalTime, setTotalTime)
    },
    totalTests: {
      ...buildStateValues(totalTests, setTotalTests)
    },
    completedTests: {
      ...buildStateValues(completedTests, setCompletedTests)
    },
    curParams: testParams
  }
}

function buildTest(shader, handler) {
  return {
    shader: shader,
    handler: handler,
    state: {
      seq: 0,
      interleaved: 0,
      weak: 0
    }
  }
}

function buildStateValues(state, updateFunc) {
  return {
    visibleState: state,
    internalState: 0,
    update: buildThrottle(updateFunc)
  }
}

function handleResult(test, pageState) {
  return function (result, memResult) {
    for (const key of keys) {
      if (test.handler[key](result, memResult)) {
        test.state[key] = test.state[key] + 1;
        pageState[key].internalState = pageState[key].internalState + 1;
        pageState[key].update(pageState[key].internalState);
        break;
      }
    }
  }
}

function ParamButton(props) {
  return (
    <button className="button is-info is-small" onClick={() => {
      alert(JSON.stringify(props.testParams, null, 4))
    }}>
      Show Param
    </button>
  )
}

function DynamicRow(props) {
  let time = reportTime();
  let curIter = getCurrentIteration();
  return (
    <tr >
      <td>
        Currently Running
      </td>
      <td>
        <ParamButton testParams={props.pageState.curParams}/>
      </td>
      <td>
        {props.pageState.completedTests.visibleState}/{props.pageState.totalTests.visibleState}
      </td>
      <td>
        {100 * (props.pageState.completedTests.visibleState * props.pageState.iterations.value + curIter)/(props.pageState.totalTests.visibleState * props.pageState.iterations.value)}

      </td>
      <td>
        {props.pageState.totalTime.visibleState + time}
      </td>
      <td>
        {props.pageState.seq.visibleState}
      </td>
      <td>
        {props.pageState.interleaved.visibleState}
      </td>
      <td>
        {props.pageState.weak.visibleState}
      </td>
    </tr>
  )
}

export function StaticRow(props) {
  return (
    <tr  >
      <td>
        {props.pageState.curParams.id + 1}
      </td>
      <td>
        <ParamButton params={props.pageState.curParams}></ParamButton>
      </td>
      <td>
        {props.pageState.completedTests.internalState}/{props.pageState.totalTests.internalState}
      </td>
      <td>
        100
      </td>
      <td>
        {props.pageState.totalTime.internalState}
      </td>
      <td>
        {props.pageState.seq.internalState}
      </td>
      <td>
        {props.pageState.interleaved.internalState}
      </td>
      <td>
        {props.pageState.weak.internalState}
      </td>
    </tr>
  )
}

async function tune(tests, testParams, pageState) {
  pageState.tuningRows.update([]);
  pageState.totalTests.internalState = tests.length;
  pageState.totalTests.update(pageState.totalTests.internalState);
  pageState.running.update(true);
  for (let i = 0; i < pageState.tuningTimes.value; i++) {
    pageState.totalTime.internalState = 0;
    pageState.totalTime.update(pageState.totalTime.internalState);
    pageState.completedTests.internalState = 0;
    pageState.completedTests.update(pageState.completedTests.internalState);
    pageState.seq.internalState = 0;
    pageState.seq.update(pageState.seq.internalState);
    pageState.interleaved.internalState = 0;
    pageState.interleaved.update(pageState.interleaved.internalState);
    pageState.weak.internalState = 0;
    pageState.weak.update(pageState.weak.internalState);
    let params = {
      ...randomConfig(),
      id: i,
      minWorkgroupSize: testParams.minWorkgroupSize,
      maxWorkgroupSize: testParams.maxWorkgroupSize,
      numMemLocations: testParams.numMemLocations,
      numOutputs: testParams.numOutputs,
      memoryAliases: testParams.memoryAliases
    };
    pageState.curParams = params;
    for (let j = 0; j < tests.length; j++) {
      let curTest = tests[j];
      await runLitmusTest(curTest.shader, params, pageState.iterations.value, handleResult(curTest, pageState));
      pageState.totalTime.internalState = pageState.totalTime.internalState + reportTime();
      pageState.totalTime.update(pageState.totalTime.internalState);
      pageState.completedTests.internalState = pageState.completedTests.internalState + 1;
      pageState.completedTests.update(pageState.completedTests.internalState);
    }
    let row = <StaticRow pageState={pageState} key={params.id} />
    pageState.tuningRows.update(oldRows => [...oldRows, row]);
  }
  pageState.running.update(false);
}

export default function TuningSuite() {
  const pageState = getPageState();
  const messagePassingConfig = buildTest(messagePassing, messagePassingHandlers);
  const loadBufferConfig = buildTest(loadBuffer, loadBufferHandlers);
  const tests = [messagePassingConfig, loadBufferConfig];
  let initialIterations = pageState.iterations.value;
  let initialTuningTimes = pageState.tuningTimes.value;
  testParams.memoryAliases[1] = 0;
  testParams.numOutputs = 4;
  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section">
            <h1 className="testName">Tuning Suite</h1>
            <p>
              The tuning suite is used to tune over user selected tests.
            </p>
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <div className="control mb-2">
            <label><b>Tuning Config Num:</b></label>
            <input className="input" type="text" defaultValue={initialTuningTimes} onInput={(e) => {
              pageState.tuningTimes.update(e.target.value);
            }} disabled={pageState.running.value} />
          </div>
          <button className="button is-primary" onClick={() => {
            pageState.tuningRows.value.splice(0, pageState.tuningRows.length);
            tune(tests, testParams, pageState);
          }} disabled={pageState.running.value}>
            Start Tuning
          </button>
        </div>
        <div className="column" >
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
              <th>Run number</th>
              <th>Parameters</th>
              <th>Tests Completed</th>
              <th>Overall Progress</th>
              <th>Time (seconds)</th>
              <th>Total Sequential Behaviors</th>
              <th>Total Interleaved Behaviors</th>
              <th>Total Weak Behaviors</th>
            </tr>
          </thead>
          <tbody>
            <DynamicRow pageState={pageState} testParams={testParams}/>
            {pageState.tuningRows.value}
          </tbody>
        </table>
      </div>
    </>
  );
}
