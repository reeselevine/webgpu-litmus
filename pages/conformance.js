import { useState } from 'react';
import StressPanel from '../components/stressPanel.js';
import { buildThrottle, clearState, handleResult, coRRHandlers, coRR4Handlers, coWWHandlers, coWRHandlers, coRW1Handlers, coRW2Handlers, atomicityHandlers } from '../components/test-page-utils.js';
import { runLitmusTest, reportTime, getCurrentIteration } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import coRR from '../shaders/corr.wgsl';
import coRR_RMW from '../shaders/corr-rmw.wgsl';
import coRR4 from '../shaders/corr4.wgsl';
import coRR4_RMW from '../shaders/corr4-rmw.wgsl';
import coWW from '../shaders/coww.wgsl';
import coWW_RMW from '../shaders/coww-rmw.wgsl';
import coWR from '../shaders/cowr.wgsl';
import coWR_RMW from '../shaders/cowr-rmw.wgsl';
import coRW1 from '../shaders/corw1.wgsl';
import coRW2 from '../shaders/corw2.wgsl';
import coRW2_RMW from '../shaders/corw2-rmw.wgsl';
import atomicity from '../shaders/atomicity.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const keys = ["seq", "interleaved", "weak"];

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

function buildStateValues(key, handlers, state, updateFunc) {
  return {
    visibleState: state,
    internalState: 0,
    syncUpdate: updateFunc,
    throttledUpdate: buildThrottle(updateFunc),
    resultHandler: handlers[key]
  }
}

function TestStatus(props) {
  if (props.pass == undefined) {
    return <td></td>;
  } else if (props.pass) {
    return <td className="testPassed">Pass</td>;
  } else {
    return <td className="testFailed">Fail</td>;
  }
}

function buildTest(testName, pageState, testParams, shaderCode, handlers) {
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  const [pass, setPass] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(0);
  const [time, setTime] = useState(0);
  const state = {
    seq: {
      ...buildStateValues("seq", handlers, seq, setSeq)
    },
    interleaved: {
      ...buildStateValues("interleaved", handlers, interleaved, setInterleaved)
    },
    weak: {
      ...buildStateValues("weak", handlers, weak, setWeak)
    },
    result: {
      value: pass,
      update: setPass
    },
    progress: {
      value: progress,
      update: buildThrottle(setProgress)
    },
    rate: {
      value: rate,
      update: buildThrottle(setRate)
    },
    time: {
      value: time,
      update: buildThrottle(setTime)
    }
  };
  const jsx = (
    <>
      <tr>
        <th>{testName}</th>
        <td>{progress}%</td>
        <td>{rate}</td>
        <td>{time}</td>
        <TestStatus pass={pass}/>
        <td>{seq}</td>
        <td>{interleaved}</td>
        <td>{weak}</td>
        <td><button className="button" onClick={() => {
          doTest(pageState, testParams, shaderCode, state);
        }} disabled={pageState.running.value}>Run</button></td>
      </tr>
    </>
  );
  return {
    run: async function () {
      return doTest(pageState, testParams, shaderCode, state);
    },
    jsx: jsx
  }
}

function updateStateAndHandleResult(pageState, testState) {
  const fn = handleResult(testState, keys);
  return function (result, memResult) {
    let time = reportTime();
    let curIter = getCurrentIteration();
    var rate;
    if (time == 0) {
      rate == 0;
    } else {
      rate = Math.round(curIter / time);
    }
    testState.progress.update(Math.floor(curIter * 100 / pageState.iterations.value));
    testState.rate.update(rate);
    testState.time.update(time);
    fn(result, memResult);
  }
}

async function doTest(pageState, testParams, shaderCode, testState) {
  pageState.running.update(true);
  clearState(testState, keys);
  testState.progress.update(0);
  testState.rate.update(0);
  testState.time.update(0);
  testState.result.update(undefined);
  await runLitmusTest(shaderCode, testParams, pageState.iterations.value, updateStateAndHandleResult(pageState, testState));
  if (testState.weak.internalState > 0) {
    testState.result.update(false);
  } else {
    testState.result.update(true);
  }
  testState.progress.update(100);
  pageState.running.update(false);
}

async function doAllTests(tests) {
  for (let test of tests) {
    await test.run();
  }
}

export default function ConformanceTestSuite() {
  testParams.memoryAliases[1] = 0;
  const pageState = getPageState();
  const coRRConfig = buildTest("CoRR", pageState, testParams, coRR, coRRHandlers);
  const coRRRMWConfig = buildTest("CoRR (RMW)", pageState, testParams, coRR_RMW, coRRHandlers);
  const coRR4Config = buildTest("4-threaded CoRR", pageState, testParams, coRR4, coRR4Handlers);
  const coRR4RMWConfig = buildTest("4-threaded CoRR (RMW)", pageState, testParams, coRR4_RMW, coRR4Handlers);
  const coWWConfig = buildTest("CoWW", pageState, testParams, coWW, coWWHandlers);
  const coWWRMWConfig = buildTest("CoWW (RMW)", pageState, testParams, coWW_RMW, coWWHandlers);
  const coWRConfig = buildTest("CoWR", pageState, testParams, coWR, coWRHandlers);
  const coWRRMWConfig = buildTest("CoWR (RMW)", pageState, testParams, coWR_RMW, coWRHandlers);
  const coRW1Config = buildTest("CoRW1", pageState, testParams, coRW1, coRW1Handlers);
  const coRW2Config = buildTest("CoRW2", pageState, testParams, coRW2, coRW2Handlers);
  const coRW2RMWConfig = buildTest("CoRW2 (RMW)", pageState, testParams, coRW2_RMW, coRW2Handlers);
  const atomicityConfig = buildTest("Atomicity", pageState, testParams, atomicity, atomicityHandlers);

  const tests = [coRRConfig, coRRRMWConfig, coRR4Config, coRR4RMWConfig, coWWConfig, coWWRMWConfig, coWRConfig, coWRRMWConfig, coRW1Config, coRW2Config, coRW2RMWConfig, atomicityConfig];

  let initialIterations = pageState.iterations.value;

  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section">
            <h1 className="testName">Conformance Test Suite</h1>
            <h2 className="testDescription">Run all the tests.</h2>
          </div>
        </div>
        <StressPanel params={testParams} pageState={pageState} />
      </div>
      <div className="columns">
        <div className="column is-one-fifth">
          <div className="control">
            <label><b>Iterations:</b></label>
            <input className="input" type="text" defaultValue={initialIterations} onInput={(e) => {
              pageState.iterations.update(e.target.value);
            }} disabled={pageState.running.value}/>
          </div>
        </div>
      </div>
      <button className="button" onClick={() => {
        doAllTests(tests);
      }} disabled={pageState.running.value} >Run CTS</button>
      <div className="table-container">
        <table className="table is-hoverable">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Progress</th>
              <th>Iterations per second</th>
              <th>Time (seconds)</th>
              <th>Result</th>
              <th>Sequential Behaviors</th>
              <th>Interleaved Behaviors</th>
              <th>Weak Behaviors</th>
              <th>Run Test</th>
            </tr>
          </thead>
          <tbody>
            {coRRConfig.jsx}
            {coRRRMWConfig.jsx}
            {coRR4Config.jsx}
            {coRR4RMWConfig.jsx}
            {coWWConfig.jsx}
            {coWWRMWConfig.jsx}
            {coWRConfig.jsx}
            {coWRRMWConfig.jsx}
            {coRW1Config.jsx}
            {coRW2Config.jsx}
            {coRW2RMWConfig.jsx}
            {atomicityConfig.jsx}
          </tbody>
        </table>
      </div>
    </>
  );
}
