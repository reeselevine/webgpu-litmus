import { useState } from 'react';
import { getStressPanel } from '../components/stressPanel.js';
import { buildThrottle, clearState, handleResult } from '../components/test-page-utils.js';
import { reportTime, getCurrentIteration, runEvaluationLitmusTest } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import rr from '../shaders/evaluation/rr.wgsl';
import rrMutation from '../shaders/evaluation/rr-mutation.wgsl';
import rrRMW from '../shaders/evaluation/rr.wgsl';
import rrRMWMutation from '../shaders/evaluation/rr-mutation.wgsl';
import rrResults from '../shaders/evaluation/rr-results.wgsl';
import rw from '../shaders/evaluation/rw.wgsl';
import rwMutation from '../shaders/evaluation/rw-mutation.wgsl';
import rwResults from '../shaders/evaluation/rw-results.wgsl';
import wr from '../shaders/evaluation/wr.wgsl';
import wrMutation from '../shaders/evaluation/wr-mutation.wgsl';
import wrResults from '../shaders/evaluation/wr-results.wgsl';
import ww from '../shaders/evaluation/ww.wgsl';
import wwMutation from '../shaders/evaluation/ww-mutation.wgsl';
import wwResults from '../shaders/evaluation/ww-results.wgsl';
import messagePassing from '../shaders/mp/message-passing.wgsl'
import messagePassingResults from '../shaders/evaluation/message-passing-results.wgsl';
import store from '../shaders/store/store.wgsl'
import storeResults from '../shaders/evaluation/store-results.wgsl';
import read from '../shaders/read/read.wgsl';
import readResults from '../shaders/evaluation/read-results.wgsl';
import loadBuffer from '../shaders/lb/load-buffer.wgsl';
import loadBufferResults from '../shaders/evaluation/load-buffer-results.wgsl';
import storeBuffer from '../shaders/sb/store-buffer.wgsl';
import storeBufferResults from '../shaders/evaluation/store-buffer-results.wgsl';
import twoPlusTwoWrite from '../shaders/2+2w/2+2-write.wgsl';
import twoPlusTwoWriteResults from '../shaders/evaluation/2+2-write-results.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
testParams.numOutputs = 2;
const defaultKeys = ["nonWeak", "weak"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(100);
  const [mutationPercentage, setMutationPercentage] = useState(1);
  const [violationsNotObserved, setViolationsNotObserved] = useState(0);
  const [violationsObserved, setViolationsObserved] = useState(0);
  return {
    running: {
      value: running,
      update: setRunning
    },
    iterations: {
      value: iterations,
      update: setIterations
    },
    violationsNotObserved: {
      value: violationsNotObserved,
      update: setViolationsNotObserved
    },
    violationsObserved: {
      value: violationsObserved,
      update: setViolationsObserved 
    },
    mutationPercentage: {
      value: mutationPercentage,
      update: setMutationPercentage
    }
  }
}

function buildStateValues(state, updateFunc) {
  return {
    visibleState: state,
    internalState: 0,
    syncUpdate: updateFunc,
    throttledUpdate: buildThrottle(updateFunc)
  }
}

function TestSuiteResult(props) {
  let suiteResult;
  if (props.pageState.violationsNotObserved.value > 0) {
    suiteResult="testFailed";
  } else if (props.pageState.violationsObserved.value == props.totalTests) {
    suiteResult="testPassed";
  } else {
    suiteResult="";
  }
  return <div className="column"><b>Suite Result:</b>
    <p className={suiteResult}>{props.pageState.violationsObserved.value}/{props.totalTests} Violations Observed</p>
  </div>;
}

function TestStatus(props) {
  if (props.violationsObserved == undefined) {
    return <td></td>;
  } else if (props.violationsObserved) {
    return <td className="testPassed">Violations Observed</td>;
  } else {
    return <td className="testFailed">Violations Not Observed</td>;
  }
}

function TestRow(props) {
  return (
    <>
      <tr>
        <th>{props.testName}</th>
        <td>{props.state.progress.value}%</td>
        <td>{props.state.rate.value}</td>
        <td>{props.state.time.value}</td>
        <TestStatus violationsObserved={props.state.result.value} />
        <td>{props.state.nonWeak.visibleState}</td>
        <td>{props.state.weak.visibleState}</td>
        <td><button className="button" onClick={() => {
          doTest(props.pageState, props.testParams, props.getTestParams, props.getMutatedTestParams, props.validShader, props.mutatedShader, props.resultShader, props.state);
        }} disabled={props.pageState.running.value}>Run</button></td>
      </tr>
    </>
  );
}

function buildTest(testName, pageState, testParams, getTestParams, getMutatedTestParams, validShader, mutatedShader, resultShader) {
  const [nonWeak, setNonWeak] = useState(0);
  const [weak, setWeak] = useState(0);
  const [result, setResult] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(0);
  const [time, setTime] = useState(0);
  const state = {
    nonWeak: {
      ...buildStateValues(nonWeak, setNonWeak)
    },
    weak: {
      ...buildStateValues(weak, setWeak)
    },
    result: {
      value: result,
      update: setResult
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
      return doTest(pageState, testParams, getTestParams, getMutatedTestParams, validShader, mutatedShader, resultShader, state);
    },
    jsx: <TestRow key={testName} testName={testName} state={state} pageState={pageState} testParams={testParams} getTestParams={getTestParams} getMutatedTestParams={getMutatedTestParams} validShader={validShader} mutatedShader={mutatedShader} resultShader={resultShader} />
  }
}

function updateStateAndHandleResult(pageState, testState) {
  const fn = handleResult(testState, defaultKeys);
  return function (result) {
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

async function doTest(pageState, testParams, getTestParams, getMutatedTestParams, validShader, mutatedShader, resultShader, testState) {
  pageState.running.update(true);
  clearState(testState, defaultKeys);
  testState.progress.update(0);
  testState.rate.update(0);
  testState.time.update(0);
  testState.result.update(undefined);
  await runEvaluationLitmusTest(validShader, mutatedShader, resultShader, getTestParams(testParams), getMutatedTestParams(testParams), pageState.iterations.value, pageState.mutationPercentage.value, updateStateAndHandleResult(pageState, testState));
  testState.progress.update(100);
  pageState.running.update(false);
  if (testState.weak.internalState > 0) {
    testState.result.update(true);
    return true;
  } else {
    testState.result.update(false);
    return false;
  }
}

async function doAllTests(pageState, tests) {
  var violationsObserved = 0;
  var violationsNotObserved = 0;
  pageState.violationsObserved.update(violationsObserved);
  pageState.violationsNotObserved.update(violationsNotObserved);
  for (let test of tests) {
    let result = await test.run();
    if (result) {
      violationsObserved = violationsObserved + 1;
      pageState.violationsObserved.update(violationsObserved);
    } else {
      violationsNotObserved = violationsNotObserved + 1;
      pageState.violationsNotObserved.update(violationsNotObserved);
    }
  }
}

function getAliasedParams(testParams) {
  const aliasedParams = JSON.parse(JSON.stringify(testParams));
  aliasedParams.aliasedMemory = true;
  aliasedParams.permuteSecond = 1;
  return aliasedParams;
}

function paramsIdentity(testParams) {
  return testParams;
}

export default function EvaluationTestSuite() {
  const pageState = getPageState();
  let rrConfig = buildTest("RR", pageState, testParams, getAliasedParams, getAliasedParams, rr, rrMutation, rrResults);
  let rrRMWConfig = buildTest("RR RMW", pageState, testParams, getAliasedParams, getAliasedParams, rrRMW, rrRMWMutation, rrResults);
  let rwConfig = buildTest("RW", pageState, testParams, getAliasedParams, getAliasedParams, rw, rwMutation, rwResults);
  let wrConfig = buildTest("WR", pageState, testParams, getAliasedParams, getAliasedParams, wr, wrMutation, wrResults);
  let wwConfig = buildTest("WW", pageState, testParams, getAliasedParams, getAliasedParams, ww, wwMutation, wwResults);
  let messagePassingConfig = buildTest("Message Passing", pageState, testParams, getAliasedParams, paramsIdentity, messagePassing, messagePassing, messagePassingResults);
  let storeConfig = buildTest("Store", pageState, testParams, getAliasedParams, paramsIdentity, store, store, storeResults);
  let readConfig = buildTest("Read", pageState, testParams, getAliasedParams, paramsIdentity, read, read, readResults);
  let loadBufferConfig = buildTest("Load Buffer", pageState, testParams, getAliasedParams, paramsIdentity, loadBuffer, loadBuffer, loadBufferResults);
  let storeBufferConfig = buildTest("Store Buffer", pageState, testParams, getAliasedParams, paramsIdentity, storeBuffer, storeBuffer, storeBufferResults);
  let twoPlusTwoWriteConfig = buildTest("2+2 Write", pageState, testParams, getAliasedParams, paramsIdentity, twoPlusTwoWrite, twoPlusTwoWrite, twoPlusTwoWriteResults);

  const tests = [rrConfig, rrRMWConfig, rwConfig, wrConfig, wwConfig, messagePassingConfig, storeConfig, readConfig, loadBufferConfig, storeBufferConfig, twoPlusTwoWriteConfig];

  let initialIterations = pageState.iterations.value;
  let initialMutationPercentage = pageState.mutationPercentage.value;
  const stressPanel = getStressPanel(testParams, pageState);
  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section content">
            <h1 className="testName">Evaluation Test Suite</h1>
            <p>
              The evaluation test suite is used to evaluate the performance of a set of tuned parameters on uncovering potential violations of WebGPU's memory consistency model.
              A test used for evaluation consists of two shaders: a valid shader with a post condition that is impossible under a correct implementation, and a mutated shader that is a
              transformed version of the valid shader where the impossible behavior is possible, but unlikely. During a test run, the transformed shader is substituted for the valid one
              some percentage of the time, and the parameter set is evaluated on whether the behavior is observed. There are two categories of evaluation tests.
            </p>
            <h5>Interleaved Tests</h5>
            <p>
              These tests consist of two thread, three instruction programs, where at least two of the instructions are a write. Extra "observer" threads may be added to force certain coherence
              orders. In the valid shader, the behavior is impossible due to coherence. However, in the mutated shader, a reordering of instructions in one of the test threads may lead to the behavior
              being observed if a precise interleaving of instructions happens across all threads.
            </p>
            <h5>Weak Memory Tests</h5>
            <p>
              These tests consist of two thread, four instruction programs, where at least two of the instructions are a write. In the valid shaders, all writes and reads are to one memory location.
              In a mutated shader, a cross thread coherence or reads-from relation is used to transform two writes or a write and a read to use a different memory location, in effect turning the test
              into one of the six weak memory tests. Since weak behaviors are possible under these mutated shaders, the weak behavior may be observed if thet test parameter set is effective.
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
        <div className="column is-one-fifth">
          <div className="control">
            <label><b>Mutation Percentage:</b></label>
            <input className="input" type="text" defaultValue={initialMutationPercentage} onInput={(e) => {
              pageState.mutationPercentage.update(e.target.value);
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
              <th>Non-Weak Behaviors</th>
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
