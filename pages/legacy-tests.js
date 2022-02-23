import { useState } from 'react';
import Link from 'next/link'
import { getStressPanel } from '../components/stressPanel.js';
import { buildThrottle, clearState } from '../components/test-page-utils.js';
import { runLitmusTest, reportTime, getCurrentIteration } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import messagePassing from '../shaders/mp/message-passing-single.wgsl';
import messagePassingResults from '../shaders/mp/message-passing-results-single.wgsl';
import store from '../shaders/store/store-single.wgsl';
import storeResults from '../shaders/store/store-results-single.wgsl';
import read from '../shaders/read/read-single.wgsl';
import readResults from '../shaders/read/read-results-single.wgsl';
import loadBuffer from '../shaders/lb/load-buffer-single.wgsl';
import loadBufferResults from '../shaders/lb/load-buffer-results-single.wgsl';
import storeBuffer from '../shaders/sb/store-buffer-single.wgsl';
import storeBufferResults from '../shaders/sb/store-buffer-results-single.wgsl';
import twoPlusTwoWrite from '../shaders/2+2w/2+2-write-single.wgsl';
import twoPlusTwoWriteResults from '../shaders/2+2w/2+2-write-results-single.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const defaultKeys = ["seq0", "seq1", "interleaved", "weak"];
const oneThreadKeys = ["seq", "weak"];
const uiKeys = ["seq", "interleaved", "weak"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(100);
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

function buildStateValues(state, updateFunc) {
  return {
    visibleState: state,
    internalState: 0,
    syncUpdate: updateFunc,
    throttledUpdate: buildThrottle(updateFunc),
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
        <td>{props.state.seq.visibleState}</td>
        <td>{props.state.interleaved.visibleState}</td>
        <td>{props.state.weak.visibleState}</td>
        <td><button className="button" onClick={() => {
          doTest(props.pageState, props.testParams, props.shaderCode, props.resultShaderCode, props.state, props.testParamOverrides);
        }} disabled={props.pageState.running.value}>Run</button></td>
      </tr>
    </>
  );
}

function buildTest(testName, testUrl, pageState, testParams, shaderCode, resultShaderCode, testKeys, testParamOverrides = {}) {
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  const [pass, setPass] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(0);
  const [time, setTime] = useState(0);
  const state = {
    seq: {
      ...buildStateValues(seq, setSeq)
    },
    interleaved: {
      ...buildStateValues(interleaved, setInterleaved)
    },
    weak: {
      ...buildStateValues(weak, setWeak)
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
    },
    keys: testKeys
  };
  return {
    run: async function () {
      return doTest(pageState, testParams, shaderCode, resultShaderCode, state, testParamOverrides);
    },
    jsx: <TestRow key={testName} testName={testName} testUrl={testUrl} state={state} pageState={pageState} testParams={testParams} shaderCode={shaderCode} resultShaderCode={resultShaderCode} testParamOverrides={testParamOverrides} />
  }
}

function handleConformanceResult(testState) {
  return function (result) {
    for (let i = 0; i < testState.keys.length; i++) {
      var key;
      if (testState.keys[i].includes("seq")) {
        key = "seq";
      } else {
        key = testState.keys[i];
      }
      testState[key].internalState = testState[key].internalState + result[i];
      testState[key].throttledUpdate(testState[key].internalState);
    }
  }
}

function updateStateAndHandleResult(pageState, testState) {
  const fn = handleConformanceResult(testState);
  return function (result) {
    console.log(result);
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
    fn(result);
  }
}

async function doTest(pageState, testParams, shaderCode, resultShaderCode, testState, testParamOverrides) {
  let newParams = JSON.parse(JSON.stringify(testParams));
  for (const key in testParamOverrides) {
    newParams[key] = testParamOverrides[key];
  }
  pageState.running.update(true);
  clearState(testState, uiKeys);
  testState.progress.update(0);
  testState.rate.update(0);
  testState.time.update(0);
  await runLitmusTest(shaderCode, resultShaderCode, newParams, pageState.iterations.value, updateStateAndHandleResult(pageState, testState));
  testState.progress.update(100);
  pageState.running.update(false);
}

async function doAllTests(tests) {
  for (let test of tests) {
    await test.run();
  }
}

export default function ConformanceTestSuite() {
  const aliasOverride = {
    aliasedMemory: true,
    permuteSecond: 1
  };
  const pageState = getPageState();
  const tests = [
    buildTest("Message Passing", "message-passing", pageState, testParams, messagePassing, messagePassingResults, defaultKeys),
    buildTest("Store", "store", pageState, testParams, store, storeResults, defaultKeys),
    buildTest("Read", "read", pageState, testParams, read, readResults, defaultKeys),
    buildTest("Load Buffer", "load-buffer", pageState, testParams, loadBuffer, loadBufferResults, defaultKeys),
    buildTest("Store Buffer", "store-buffer", pageState, testParams, storeBuffer, storeBufferResults, defaultKeys),
    buildTest("2+2 Write", "2-plus-2-write", pageState, testParams, twoPlusTwoWrite, twoPlusTwoWriteResults, defaultKeys)
  ];
  let initialIterations = pageState.iterations.value;
  const stressPanel = getStressPanel(testParams, pageState);
  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section">
            <h1 className="testName">Legacy Test Suite</h1>
            <p>
              This page contains tests that run one instance at a time, as opposed to the parallel strategy where many instances are run at once.
            </p>
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
      <div className="columns">
        <div className="column">
          <button className="button" onClick={() => {
            doAllTests(tests);
          }} disabled={pageState.running.value} >Run All</button>
        </div>
      </div>
      <div className="table-container">
        <table className="table is-hoverable">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Progress</th>
              <th>Iterations per second</th>
              <th>Time (seconds)</th>
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
