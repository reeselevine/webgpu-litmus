import { useState } from 'react';
import StressPanel from '../components/stressPanel.js';
import { buildThrottle, clearState, handleResult, coRRHandlers, coRR4Handlers, coWWHandlers, coWRHandlers, coRW1Handlers, coRW2Handlers, atomicityHandlers } from '../components/test-page-utils.js';
import { runLitmusTest, reportTime, getCurrentIteration } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import coRR from '../shaders/corr.wgsl';
import coWW from '../shaders/coww.wgsl';
import coWR from '../shaders/cowr.wgsl';
import coRW1 from '../shaders/corw1.wgsl';
import coRW2 from '../shaders/corw2.wgsl';
import atomicity from '../shaders/atomicity.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const keys = ["seq", "interleaved", "weak"];
const iterations = 100;

function getPageState() {
  const [running, setRunning] = useState(false);
  return {
    running: {
      value: running,
      update: setRunning
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

function buildTest(testName, pageState, testParams, shaderCode, handlers) {
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  const [pass, setPass] = useState("");
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
        <td>{pass}</td>
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

function updateStateAndHandleResult(testState) {
  const fn = handleResult(testState, keys);
  return function (result, memResult) {
    testState.progress.update(Math.floor(getCurrentIteration() * 100 / iterations));
    testState.rate.update(Math.round((getCurrentIteration() / (reportTime()))));
    testState.time.update(reportTime());
    fn(result, memResult);
  }
}

async function doTest(pageState, testParams, shaderCode, testState) {
  pageState.running.update(true);
  clearState(testState, keys);
  testState.progress.update(0);
  testState.rate.update(0);
  testState.time.update(0);
  testState.result.update("");
  await runLitmusTest(shaderCode, testParams, iterations, updateStateAndHandleResult(testState));
  if (testState.weak.internalState > 0) {
    testState.result.update("Failed");
  } else {
    testState.result.update("Pass");
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
  const coWWConfig = buildTest("CoWW", pageState, testParams, coWW, coWWHandlers);
  const coWRConfig = buildTest("CoWR", pageState, testParams, coWR, coWRHandlers);
  const coRW1Config = buildTest("CoRW1", pageState, testParams, coRW1, coRW1Handlers);
  const coRW2Config = buildTest("CoRW2", pageState, testParams, coRW2, coRW2Handlers);
  const atomicityConfig = buildTest("Atomicity", pageState, testParams, atomicity, atomicityHandlers);

  const tests = [coRRConfig, coWWConfig, coWRConfig, coRW1Config, coRW2Config, atomicityConfig];

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
      <button className="button" onClick={() => {
        doAllTests(tests);
      }} disabled={pageState.running.value} >Run CTS</button>
      <table className="table">
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
          {coWWConfig.jsx}
          {coWRConfig.jsx}
          {coRW1Config.jsx}
          {coRW2Config.jsx}
          {atomicityConfig.jsx}
        </tbody>
      </table>
    </>
  )
}
