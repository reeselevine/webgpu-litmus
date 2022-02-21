import { useState } from 'react';
import Link from 'next/link'
import { getStressPanel } from '../components/stressPanel.js';
import { buildThrottle, clearState } from '../components/test-page-utils.js';
import { runLitmusTest, reportTime, getCurrentIteration } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import coRR from '../shaders/corr/corr.wgsl'
import coRRRMW from '../shaders/corr/corr-rmw.wgsl'
import coRRWorkgroup from '../shaders/corr/corr-workgroup.wgsl'
import coRRStorageWorkgroup from '../shaders/corr/corr-storage-workgroup.wgsl'
import coRRResults from '../shaders/corr/corr-results.wgsl'
import coRRWorkgroupResults from '../shaders/corr/corr-workgroup-results.wgsl'
import coWW from '../shaders/coww/coww.wgsl'
import coWWRMW from '../shaders/coww/coww-rmw.wgsl'
import coWWWorkgroup from '../shaders/coww/coww-workgroup.wgsl'
import coWWStorageWorkgroup from '../shaders/coww/coww-storage-workgroup.wgsl'
import coWWResults from '../shaders/coww/coww-results.wgsl'
import coWWWorkgroupResults from '../shaders/coww/coww-workgroup-results.wgsl'
import coWR from '../shaders/cowr/cowr.wgsl'
import coWRRMW from '../shaders/cowr/cowr-rmw.wgsl'
import coWRWorkgroup from '../shaders/cowr/cowr-workgroup.wgsl'
import coWRStorageWorkgroup from '../shaders/cowr/cowr-storage-workgroup.wgsl'
import coWRResults from '../shaders/cowr/cowr-results.wgsl'
import coWRWorkgroupResults from '../shaders/cowr/cowr-workgroup-results.wgsl'
import coRW1 from '../shaders/corw1/corw1.wgsl'
import coRW1Workgroup from '../shaders/corw1/corw1-workgroup.wgsl'
import coRW1StorageWorkgroup from '../shaders/corw1/corw1-storage-workgroup.wgsl'
import coRW1Results from '../shaders/corw1/corw1-results.wgsl'
import coRW1WorkgroupResults from '../shaders/corw1/corw1-workgroup-results.wgsl'
import coRW2 from '../shaders/corw2/corw2.wgsl'
import coRW2RMW from '../shaders/corw2/corw2-rmw.wgsl'
import coRW2Workgroup from '../shaders/corw2/corw2-workgroup.wgsl'
import coRW2StorageWorkgroup from '../shaders/corw2/corw2-storage-workgroup.wgsl'
import coRW2Results from '../shaders/corw2/corw2-results.wgsl'
import coRW2WorkgroupResults from '../shaders/corw2/corw2-workgroup-results.wgsl'
import atom from '../shaders/atom/atomicity.wgsl'
import atomWorkgroup from '../shaders/atom/atomicity-workgroup.wgsl'
import atomResults from '../shaders/atom/atomicity-results.wgsl'
import atomWorkgroupResults from '../shaders/atom/atomicity-workgroup-results.wgsl'
import atomStorageWorkgroup from '../shaders/atom/atomicity-storage-workgroup.wgsl'
import barrierLSWorkgroup from '../shaders/barrier-ls/barrier-load-store-workgroup.wgsl';
import barrierLSStorageWorkgroup from '../shaders/barrier-ls/barrier-load-store-storage-workgroup.wgsl';
import barrierLSResults from '../shaders/barrier-ls/barrier-load-store-workgroup-results.wgsl';
import barrierSLWorkgroup from '../shaders/barrier-sl/barrier-store-load-workgroup.wgsl';
import barrierSLStorageWorkgroup from '../shaders/barrier-sl/barrier-store-load-storage-workgroup.wgsl';
import barrierSLResults from '../shaders/barrier-sl/barrier-store-load-workgroup-results.wgsl';
import barrierSSWorkgroup from '../shaders/barrier-ss/barrier-store-store-workgroup.wgsl';
import barrierSSStorageWorkgroup from '../shaders/barrier-ss/barrier-store-store-storage-workgroup.wgsl';
import barrierSSResults from '../shaders/barrier-ss/barrier-store-store-workgroup-results.wgsl';
import barrierWorkgroupMessagePassing from '../shaders/mp/message-passing-workgroup-barrier.wgsl';
import barrierStorageWorkgroupMessagePassing from '../shaders/mp/message-passing-storage-workgroup-barrier.wgsl';
import messagePassingResults from '../shaders/mp/message-passing-results.wgsl';
import barrierWorkgroupStore from '../shaders/store/store-workgroup-barrier.wgsl'
import barrierStorageWorkgroupStore from '../shaders/store/store-storage-workgroup-barrier.wgsl'
import storeWorkgroupResults from '../shaders/store/store-workgroup-results.wgsl';
import barrierWorkgroupLoadBuffer from '../shaders/lb/load-buffer-workgroup-barrier.wgsl';
import barrierStorageWorkgroupLoadBuffer from '../shaders/lb/load-buffer-storage-workgroup-barrier.wgsl';
import loadBufferWorkgroupResults from '../shaders/lb/load-buffer-workgroup-results.wgsl';
import readWorkgroupRMWBarrier from '../shaders/read/read-workgroup-rmw-barrier.wgsl'
import readStorageWorkgroupRMWBarrier from '../shaders/read/read-storage-workgroup-rmw-barrier.wgsl'
import readWorkgroupResults from '../shaders/read/read-workgroup-results.wgsl'
import storeBufferWorkgroupRMWBarrier from '../shaders/sb/store-buffer-workgroup-rmw-barrier.wgsl'
import storeBufferStorageWorkgroupRMWBarrier from '../shaders/sb/store-buffer-storage-workgroup-rmw-barrier.wgsl'
import storeBufferWorkgroupResults from '../shaders/sb/store-buffer-workgroup-results.wgsl'
import twoPlusTwoWriteWorkgroupRMWBarrier from '../shaders/2+2w/2+2-write-workgroup-rmw-barrier.wgsl'
import twoPlusTwoWriteStorageWorkgroupRMWBarrier from '../shaders/2+2w/2+2-write-storage-workgroup-rmw-barrier.wgsl'
import twoPlusTwoWriteWorkgroupResults from '../shaders/2+2w/2+2-write-workgroup-results.wgsl'

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const defaultKeys = ["seq0", "seq1", "interleaved", "weak"];
const oneThreadKeys = ["seq", "weak"];
const atomicityKeys = ["seq0", "seq1", "weak"];
const keys = ["seq", "interleaved", "weak"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(1000);
  const [failedTests, setFailedTests] = useState(0);
  const [passedTests, setPassedTests] = useState(0);
  return {
    running: {
      value: running,
      update: setRunning
    },
    iterations: {
      value: iterations,
      update: setIterations
    },
    failedTests: {
      value: failedTests,
      update: setFailedTests
    },
    passedTests: {
      value: passedTests,
      update: setPassedTests 
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

function TestSuiteResult(props) {
  let suiteResult;
  if (props.pageState.failedTests.value > 0) {
    suiteResult="testFailed";
  } else if (props.pageState.passedTests.value == props.totalTests) {
    suiteResult="testPassed";
  } else {
    suiteResult="";
  }
  return <div className="column"><b>Suite Result:</b>
    <p className={suiteResult}>{props.pageState.passedTests.value}/{props.totalTests} Passed</p>
  </div>;
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
  clearState(testState, keys);
  testState.progress.update(0);
  testState.rate.update(0);
  testState.time.update(0);
  testState.result.update(undefined);
  await runLitmusTest(shaderCode, resultShaderCode, newParams, pageState.iterations.value, updateStateAndHandleResult(pageState, testState));
  testState.progress.update(100);
  pageState.running.update(false);
  if (testState.weak.internalState > 0) {
    testState.result.update(false);
    return false;
  } else {
    testState.result.update(true);
    return true;
  }
}

async function doAllTests(pageState, tests) {
  var passedTests = 0;
  var failedTests = 0;
  pageState.passedTests.update(passedTests);
  pageState.failedTests.update(failedTests);
  for (let test of tests) {
    let result = await test.run();
    if (result) {
      passedTests = passedTests + 1;
      pageState.passedTests.update(passedTests);
    } else {
      failedTests = failedTests + 1;
      pageState.failedTests.update(failedTests);
    }
  }
}

export default function ConformanceTestSuite() {
  const aliasOverride = {
    aliasedMemory: true,
    permuteSecond: 1
  };
  const pageState = getPageState();
  const tests = [
    buildTest("CoRR", "corr", pageState, testParams, coRR, coRRResults, defaultKeys, aliasOverride),
    buildTest("CoRR RMW", "corr", pageState, testParams, coRRRMW, coRRResults, defaultKeys, aliasOverride),
    buildTest("CoRR Workgroup (workgroup memory)", "corr", pageState, testParams, coRRWorkgroup, coRRWorkgroupResults, defaultKeys, aliasOverride),
    buildTest("CoRR Workgroup (storage memory)", "corr", pageState, testParams, coRRStorageWorkgroup, coRRWorkgroupResults, defaultKeys, aliasOverride),
    buildTest("CoWW", "coww", pageState, testParams, coWW, coWWResults, oneThreadKeys, aliasOverride),
    buildTest("CoWW RMW", "coww", pageState, testParams, coWWRMW, coWWResults, oneThreadKeys, aliasOverride),
    buildTest("CoWW Workgroup (workgroup memory)", "coww", pageState, testParams, coWWWorkgroup, coWWWorkgroupResults, oneThreadKeys, aliasOverride),
    buildTest("CoWW Workgroup (storage memory)", "coww", pageState, testParams, coWWStorageWorkgroup, coWWWorkgroupResults, oneThreadKeys, aliasOverride),
    buildTest("CoWR", "cowr", pageState, testParams, coWR, coWRResults, defaultKeys, aliasOverride),
    buildTest("CoWR RMW", "cowr", pageState, testParams, coWRRMW, coWRResults, defaultKeys, aliasOverride),
    buildTest("CoWR Workgroup (workgroup memory)", "cowr", pageState, testParams, coWRWorkgroup, coWRWorkgroupResults, defaultKeys, aliasOverride),
    buildTest("CoWR Workgroup (storage memory)", "cowr", pageState, testParams, coWRStorageWorkgroup, coWRWorkgroupResults, defaultKeys, aliasOverride),
    buildTest("CoRW1", "corw1", pageState, testParams, coRW1, coRW1Results, oneThreadKeys, aliasOverride),
    buildTest("CoRW1 Workgroup (workgroup memory)", "corw1", pageState, testParams, coRW1Workgroup, coRW1WorkgroupResults, oneThreadKeys, aliasOverride),
    buildTest("CoRW1 Workgroup (storage memory)", "corw1", pageState, testParams, coRW1StorageWorkgroup, coRW1WorkgroupResults, oneThreadKeys, aliasOverride),
    buildTest("CoRW2", "corw2", pageState, testParams, coRW2, coRW2Results, defaultKeys, aliasOverride),
    buildTest("CoRW2 RMW", "corw2", pageState, testParams, coRW2RMW, coRW2Results, defaultKeys, aliasOverride),
    buildTest("CoRW2 Workgroup (workgroup memory)", "corw2", pageState, testParams, coRW2Workgroup, coRW2WorkgroupResults, defaultKeys, aliasOverride),
    buildTest("CoRW2 Workgroup (storage memory)", "corw2", pageState, testParams, coRW2StorageWorkgroup, coRW2WorkgroupResults, defaultKeys, aliasOverride),
    buildTest("Atomicity", "atomicity", pageState, testParams, atom, atomResults, defaultKeys),
    buildTest("Atomicity Workgroup (workgroup memory)", "atomicity", pageState, testParams, atomWorkgroup, atomWorkgroupResults, defaultKeys),
    buildTest("Atomicity Workgroup (storage memory)", "atomicity", pageState, testParams, atomStorageWorkgroup, atomWorkgroupResults, defaultKeys),
    buildTest("Barrier Store Load (workgroup memory)", "barrier-store-load", pageState, testParams, barrierSLWorkgroup, barrierSLResults, oneThreadKeys),
    buildTest("Barrier Store Load (storage memory)", "barrier-store-load", pageState, testParams, barrierSLStorageWorkgroup, barrierSLResults, oneThreadKeys),
    buildTest("Barrier Load Store (workgroup memory)", "barrier-load-store", pageState, testParams, barrierLSWorkgroup, barrierLSResults, oneThreadKeys),
    buildTest("Barrier Load Store (storage memory)", "barrier-load-store", pageState, testParams, barrierLSStorageWorkgroup, barrierLSResults, oneThreadKeys),
    buildTest("Barrier Store Store (workgroup memory)", "barrier-store-store", pageState, testParams, barrierSSWorkgroup, barrierSSResults, oneThreadKeys),
    buildTest("Barrier Store Store (storage memory)", "barrier-store-store", pageState, testParams, barrierSSStorageWorkgroup, barrierSSResults, oneThreadKeys),
    buildTest("Message Passing Workgroup (workgroup memory)", "message-passing", pageState, testParams, barrierWorkgroupMessagePassing, messagePassingResults, defaultKeys),
    buildTest("Message Passing Workgroup (storage memory)", "message-passing", pageState, testParams, barrierStorageWorkgroupMessagePassing, messagePassingResults, defaultKeys),
    buildTest("Store Workgroup (workgroup memory)", "store", pageState, testParams, barrierWorkgroupStore, storeWorkgroupResults, defaultKeys),
    buildTest("Store Workgroup (storage memory)", "store", pageState, testParams, barrierStorageWorkgroupStore, storeWorkgroupResults, defaultKeys),
    buildTest("Load Buffer Workgroup (workgroup memory)", "load-buffer", pageState, testParams, barrierWorkgroupLoadBuffer, loadBufferWorkgroupResults, defaultKeys),
    buildTest("Load Buffer Workgroup (storage memory)", "load-buffer", pageState, testParams, barrierStorageWorkgroupLoadBuffer, loadBufferWorkgroupResults, defaultKeys),
    buildTest("Read RMW Barrier Workgroup (workgroup memory)", "read", pageState, testParams, readWorkgroupRMWBarrier, readWorkgroupResults, defaultKeys),
    buildTest("Read RMW Barrier Workgroup (storage memory)", "read", pageState, testParams, readStorageWorkgroupRMWBarrier, readWorkgroupResults, defaultKeys),
    buildTest("Store Buffer RMW Barrier Workgroup (workgroup memory)", "store-buffer", pageState, testParams, storeBufferWorkgroupRMWBarrier, storeBufferWorkgroupResults, defaultKeys),
    buildTest("Store Buffer RMW Barrier Workgroup (storage memory)", "store-buffer", pageState, testParams, storeBufferStorageWorkgroupRMWBarrier, storeBufferWorkgroupResults, defaultKeys),
    buildTest("2+2 Write RMW Barrier Workgroup (workgroup memory)", "2-plus-2-write", pageState, testParams, twoPlusTwoWriteWorkgroupRMWBarrier, twoPlusTwoWriteWorkgroupResults, defaultKeys),
    buildTest("2+2 Write RMW Barrier Workgroup (storage memory)", "2-plus-2-write", pageState, testParams, twoPlusTwoWriteStorageWorkgroupRMWBarrier, twoPlusTwoWriteWorkgroupResults, defaultKeys)
  ];
  let initialIterations = pageState.iterations.value;
  const stressPanel = getStressPanel(testParams, pageState);
  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section">
            <h1 className="testName">Conformance Test Suite</h1>
            <p>
              The conformance test suite currently consists of 40 tests, split into several categories.
            </p>
            <h5>Classic Coherence Tests</h5>
            <p>
              Five classic coherence tests that verify sequential consistency per location are included: CoRR, CoWW, CoWR, CoRW1, and CoRW2. Variants that test workgroup level
              shared memory with different storage classes are also tested.
            </p>
            <h5>Atomicity Tests</h5>
            <p>
              An atomicity test is also included to confirm the correct behavior of a read-modify-write instruction. 
            </p>
            <h5>Workgroup Execution Barrier Tests</h5>
            <p>
              Basic tests for WebGPU's barriers are included. Each test consists of either a read or write along with a call to the barrier on two threads, leading to
              three test formats for each of WebGPU's two barrier types.
            </p>
            <h5>Weak Memory Litmus Tests</h5>
            <p>
              Due to the acquire/release semantics of WebGPU's barriers, we can include three classic litmus tests: message passing, load buffer, and store. We can also include
              variants of store buffer, read, and 2+2 write with read-modify-write instructions in several locations. Each of these tests should not show a weak behavior because 
              of the barrier in between the instructions in each thread.
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
            doAllTests(pageState, tests);
          }} disabled={pageState.running.value} >Run CTS</button>
        </div>
        <TestSuiteResult pageState={pageState} totalTests={tests.length}/>
      </div>
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
