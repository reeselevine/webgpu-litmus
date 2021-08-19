import { useState } from 'react';
import Link from'next/link'
import { getStressPanel } from '../components/stressPanel.js';
import { buildThrottle, clearState, handleResult, coRRHandlers, coRR4Handlers, coWWHandlers, coWRHandlers, coRW1Handlers, coRW2Handlers, atomicityHandlers, barrierLoadStoreHandlers, barrierStoreLoadHandlers, barrierStoreStoreHandlers, workgroupMemorySize } from '../components/test-page-utils.js';
import { runLitmusTest, reportTime, getCurrentIteration } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import coRR from '../shaders/corr.wgsl';
import coRR_RMW from '../shaders/corr-rmw.wgsl';
import coRR_RMW1 from '../shaders/corr-rmw1.wgsl';
import coRR_RMW2 from '../shaders/corr-rmw2.wgsl';
import coRR4 from '../shaders/corr4.wgsl';
import coRR4_RMW from '../shaders/corr4-rmw.wgsl';
import coWW from '../shaders/coww.wgsl';
import coWW_RMW from '../shaders/coww-rmw.wgsl';
import coWR from '../shaders/cowr.wgsl';
import coWR_RMW from '../shaders/cowr-rmw.wgsl';
import coWR_RMW1 from '../shaders/cowr-rmw1.wgsl';
import coWR_RMW2 from '../shaders/cowr-rmw2.wgsl';
import coWR_RMW3 from '../shaders/cowr-rmw3.wgsl';
import coWR_RMW4 from '../shaders/cowr-rmw4.wgsl';
import coRW1 from '../shaders/corw1.wgsl';
import coRW2 from '../shaders/corw2.wgsl';
import coRW2_RMW from '../shaders/corw2-rmw.wgsl';
import atomicity from '../shaders/atomicity.wgsl';
import barrierLS from '../shaders/barrier-load-store.wgsl';
import barrierSL from '../shaders/barrier-store-load.wgsl';
import barrierSS from '../shaders/barrier-store-store.wgsl';
import barrierWorkgroupLS from '../shaders/barrier-load-store-workgroup.wgsl';
import barrierWorkgroupSL from '../shaders/barrier-store-load-workgroup.wgsl';
import barrierWorkgroupSS from '../shaders/barrier-store-store-workgroup.wgsl';

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

function TestRow(props) {
  return (
    <>
      <tr>
        <th><Link href={'/tests/' + props.testUrl}>{props.testName}</Link></th>
        <td>{props.state.progress.value}%</td>
        <td>{props.state.rate.value}</td>
        <td>{props.state.time.value}</td>
        <TestStatus pass={props.state.result.value} />
        <td>{props.state.seq.visibleState}</td>
        <td>{props.state.interleaved.visibleState}</td>
        <td>{props.state.weak.visibleState}</td>
        <td><button className="button" onClick={() => {
          doTest(props.pageState, props.testParams, props.shaderCode, props.state, props.fixedMemorySize);
        }} disabled={props.pageState.running.value}>Run</button></td>
      </tr>
    </>
  );

}

function buildTest(testName, testUrl, pageState, testParams, shaderCode, handlers, fixedMemorySize = false) {
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
  return {
    run: async function () {
      return doTest(pageState, testParams, shaderCode, state, fixedMemorySize);
    },
    jsx: <TestRow key={testName} testName={testName} testUrl={testUrl} state={state} pageState={pageState} testParams={testParams} shaderCode={shaderCode} fixedMemorySize={fixedMemorySize}/>
  }
}

function buildBarrierTest(testName, testUrl, pageState, testParams, shaderCode, handlers, fixedMemorySize = false) {
  const barrierTestParams = JSON.parse(JSON.stringify(testParams));
  barrierTestParams.minWorkgroupSize = 256;
  barrierTestParams.maxWorkgroupSize = 256;
  return buildTest(testName, testUrl, pageState, barrierTestParams, shaderCode, handlers, fixedMemorySize);
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

async function doTest(pageState, testParams, shaderCode, testState, useWorkgroupMemorySize) {
  let newParams;
  if (useWorkgroupMemorySize) {
    newParams = JSON.parse(JSON.stringify(testParams));
    console.log("here");
    newParams.testMemorySize = workgroupMemorySize;
  } else {
    newParams = testParams;
  }
  pageState.running.update(true);
  clearState(testState, keys);
  testState.progress.update(0);
  testState.rate.update(0);
  testState.time.update(0);
  testState.result.update(undefined);
  await runLitmusTest(shaderCode, newParams, pageState.iterations.value, updateStateAndHandleResult(pageState, testState));
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
  testParams.numOutputs = 4;
  const pageState = getPageState();
  const coRRConfig = buildTest("CoRR", "corr", pageState, testParams, coRR, coRRHandlers);
  const coRRRMWConfig = buildTest("CoRR (strongest idiomatic RMW variant)", "corr", pageState, testParams, coRR_RMW, coRRHandlers);
  const coRRRMW1Config = buildTest("CoRR (idiomatic RMW variant 1)", "corr", pageState, testParams, coRR_RMW1, coRRHandlers);
  const coRRRMW2Config = buildTest("CoRR (idiomatic RMW variant 2)", "corr", pageState, testParams, coRR_RMW2, coRRHandlers);
  const coRR4Config = buildTest("4-threaded CoRR", "corr4", pageState, testParams, coRR4, coRR4Handlers);
  const coRR4RMWConfig = buildTest("4-threaded CoRR (strongest idiomatic RMW variant)", "corr4", pageState, testParams, coRR4_RMW, coRR4Handlers);
  const coWWConfig = buildTest("CoWW", "coww", pageState, testParams, coWW, coWWHandlers);
  const coWWRMWConfig = buildTest("CoWW (strongest idiomatic RMW variant)", "coww", pageState, testParams, coWW_RMW, coWWHandlers);
  const coWRConfig = buildTest("CoWR", "cowr", pageState, testParams, coWR, coWRHandlers);
  const coWRRMWConfig = buildTest("CoWR (strongest idiomatic RMW variant)", "cowr", pageState, testParams, coWR_RMW, coWRHandlers);
  const coWRRMW1Config = buildTest("CoWR (idiomatic RMW variant 1)", "cowr", pageState, testParams, coWR_RMW1, coWRHandlers);
  const coWRRMW2Config = buildTest("CoWR (idiomatic RMW variant 2)", "cowr", pageState, testParams, coWR_RMW2, coWRHandlers);
  const coWRRMW3Config = buildTest("CoWR (idiomatic RMW variant 3)", "cowr", pageState, testParams, coWR_RMW3, coWRHandlers);
  const coWRRMW4Config = buildTest("CoWR (idiomatic RMW variant 4)", "cowr", pageState, testParams, coWR_RMW4, coWRHandlers);
  const coRW1Config = buildTest("CoRW1", "corw1", pageState, testParams, coRW1, coRW1Handlers);
  const coRW2Config = buildTest("CoRW2", "corw2", pageState, testParams, coRW2, coRW2Handlers);
  const coRW2RMWConfig = buildTest("CoRW2 (strongest idiomatic RMW variant)", "corw2", pageState, testParams, coRW2_RMW, coRW2Handlers);
  const atomicityConfig = buildTest("Atomicity", "atomicity", pageState, testParams, atomicity, atomicityHandlers);
  const barrierLoadStoreConfig = buildBarrierTest("Barrier Load Store", "barrier-load-store", pageState, testParams, barrierLS, barrierLoadStoreHandlers);
  const barrierStoreLoadConfig = buildBarrierTest("Barrier Store Load", "barrier-store-load", pageState, testParams, barrierSL, barrierStoreLoadHandlers);
  const barrierStoreStoreConfig = buildBarrierTest("Barrier Store Store", "barrier-store-store", pageState, testParams, barrierSS, barrierStoreStoreHandlers);
  const barrierWorkgroupLoadStoreConfig = buildBarrierTest("Barrier Load Store (workgroup memory)", "barrier-load-store", pageState, testParams, barrierWorkgroupLS, barrierLoadStoreHandlers, true);
  const barrierWorkgroupStoreLoadConfig = buildBarrierTest("Barrier Store Load (workgroup memory)", "barrier-store-load", pageState, testParams, barrierWorkgroupSL, barrierStoreLoadHandlers, true);
  const barrierWorkgroupStoreStoreConfig = buildBarrierTest("Barrier Store Store (workgroup memory)", "barrier-store-store", pageState, testParams, barrierWorkgroupSS, barrierStoreStoreHandlers, true);

  const tests = [coRRConfig, coRRRMWConfig, coRRRMW1Config, coRRRMW2Config, coRR4Config, coRR4RMWConfig, coWWConfig, coWWRMWConfig, coWRConfig, coWRRMWConfig, coWRRMW1Config, coWRRMW2Config, coWRRMW3Config, coWRRMW4Config, coRW1Config, coRW2Config, coRW2RMWConfig, atomicityConfig, barrierLoadStoreConfig, barrierStoreLoadConfig, barrierStoreStoreConfig, barrierWorkgroupLoadStoreConfig, barrierWorkgroupStoreLoadConfig, barrierWorkgroupStoreStoreConfig];

  let initialIterations = pageState.iterations.value;
  const stressPanel = getStressPanel(testParams, pageState);
  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section">
            <h1 className="testName">Conformance Test Suite</h1>
            <h2 className="testDescription">Run all the tests.</h2>
          </div>
        </div>
        {stressPanel.jsx}
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
            {tests.map(test => test.jsx)}
          </tbody>
        </table>
      </div>
    </>
  );
}
