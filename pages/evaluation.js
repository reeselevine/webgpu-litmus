import { useState } from 'react';
import { getStressPanel } from '../components/stressPanel.js';
import { buildThrottle, clearState } from '../components/test-page-utils.js';
import { reportTime, getCurrentIteration, runEvaluationLitmusTest } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import rw from '../shaders/evaluation/rw.wgsl';
import rwBuggy from '../shaders/evaluation/rw-buggy.wgsl';
import rwResults from '../shaders/evaluation/rw-results.wgsl';
import wr from '../shaders/evaluation/wr.wgsl';
import wrBuggy from '../shaders/evaluation/wr-buggy.wgsl';
import wrResults from '../shaders/evaluation/wr-results.wgsl';
import ww from '../shaders/evaluation/ww.wgsl';
import wwBuggy from '../shaders/evaluation/ww-buggy.wgsl';
import wwResults from '../shaders/evaluation/ww-results.wgsl';
import messagePassing from '../shaders/mp/message-passing.wgsl'
import messagePassingResults from '../shaders/mp/message-passing-results.wgsl';
import store from '../shaders/store/store.wgsl'
import storeResults from '../shaders/store/store-results.wgsl';
import read from '../shaders/read/read.wgsl';
import readResults from '../shaders/read/read-results.wgsl';
import loadBuffer from '../shaders/lb/load-buffer.wgsl';
import loadBufferResults from '../shaders/lb/load-buffer-results.wgsl';
import storeBuffer from '../shaders/sb/store-buffer.wgsl';
import storeBufferResults from '../shaders/sb/store-buffer-results.wgsl';
import twoPlusTwoWrite from '../shaders/2+2w/2+2-write.wgsl';
import twoPlusTwoWriteResults from '../shaders/2+2w/2+2-write-results.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
testParams.numOutputs = 4;
const weakTestKeys = ["seq0", "seq1", "interleaved", "weak"];
const defaultKeys = ["nonWeak", "weak"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(100);
  const [buggyPercentage, setBuggyPercentage] = useState(1);
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
    buggyPercentage: {
      value: buggyPercentage,
      update: setBuggyPercentage
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
          doTest(props.pageState, props.validTestParams, props.buggyTestParams, props.validShader, props.buggyShader, props.resultShader, props.state);
        }} disabled={props.pageState.running.value}>Run</button></td>
      </tr>
    </>
  );
}

function buildTest(testName, pageState, validTestParams, buggyTestParams, validShader, buggyShader, resultShader, keys) {
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
    },
    keys: keys
  };
  return {
    run: async function () {
      return doTest(pageState, validTestParams, buggyTestParams, validShader, buggyShader, resultShader, state);
    },
    jsx: <TestRow key={testName} testName={testName} state={state} pageState={pageState} validTestParams={validTestParams} buggyTestParams={buggyTestParams} validShader={validShader} buggyShader={buggyShader} resultShader={resultShader} />
  }
}

function handleEvaluationResult(testState) {
  return function (result) {
    for (let i = 0; i < testState.keys.length; i++) {
      var key;
      if (testState.keys[i] == "weak") {
        key = "weak";
      } else {
        key = "nonWeak";
      }
      testState[key].internalState = testState[key].internalState + result[i];
      testState[key].throttledUpdate(testState[key].internalState);
    }
  }
}

function updateStateAndHandleResult(pageState, testState) {
  const fn = handleEvaluationResult(testState);
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

async function doTest(pageState, validTestParams, buggyTestParams, validShader, buggyShader, resultShader, testState) {
  pageState.running.update(true);
  clearState(testState, defaultKeys);
  testState.progress.update(0);
  testState.rate.update(0);
  testState.time.update(0);
  testState.result.update(undefined);
  await runEvaluationLitmusTest(validShader, buggyShader, resultShader, validTestParams, buggyTestParams, pageState.iterations.value, pageState.buggyPercentage.value, updateStateAndHandleResult(pageState, testState));
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

const rwHandlers = {
  nonWeak: function(result, memResult) {
    return result[0] != 2 || result[1] != 1 || result[2] != 2;
  },
  weak: function(result, memResult) {
    return result[0] == 2 && result[1] == 1 && result[2] == 2;
  }
};

const wrHandlers = {
  nonWeak: function(result, memResult) {
    return result[0] != 2 || result[1] != 2 || result[2] != 1;
  },
  weak: function(result, memResult) {
    return result[0] == 2 && result[1] == 2 && result[2] == 1;
  }
};

const wwHandlers = {
  nonWeak: function(result, memResult) {
    return result[0] != 2 || result[1] != 3 || result[2] != 3 || result[3] != 1;
  },
  weak: function(result, memResult) {
    return result[0] == 2 && result[1] == 3 && result[2] == 3 && result[3] == 1;
  }
};

const readHandlers = {
  nonWeak: function(result, memResult) {
    return result[0] != 0 || memResult[1] != 3;
  },
  weak: function(result, memResult) {
    return result[0] == 0 && memResult[1] == 3;
  }
};

const messagePassingHandlers = {
  nonWeak: function(result, memResult) {
    return result[0] != 2 || result[1] != 0;
  },
  weak: function(result, memResult) {
    return result[0] == 2 && result[1] == 0;
  }
};

const loadBufferHandlers = {
  nonWeak: function(result, memResult) {
    return result[0] != 2 || result[1] != 1;
  },
  weak: function(result, memResult) {
    return result[0] == 2 && result[1] == 1;
  }
};

const storeHandlers = {
  nonWeak: function(result, memResult) {
    return result[0] != 2 || memResult[0] != 1;
  },
  weak: function(result, memResult) {
    return result[0] == 2 && memResult[0] == 1;
  }
};

const storeBufferHandlers = {
  nonWeak: function(result, memResult) {
    return result[0] != 0 || result[1] != 0;
  },
  weak: function(result, memResult) {
    return result[0] == 0 && result[1] == 0;
  }
};

const twoPlusTwoWriteHandlers = {
  nonWeak: function(result, memResult) {
    return memResult[0] != 1 || memResult[1] != 3;
  },
  weak: function(result, memResult) {
    return memResult[0] == 1 && memResult[1] == 3;
  }
};

function getOneReadOneWriteParams(testParams) {
  const oneReadOneWriteParams = JSON.parse(JSON.stringify(testParams));
  oneReadOneWriteParams.numOutputs = 3;
  oneReadOneWriteParams.memoryAliases[1] = 0;
  return oneReadOneWriteParams;
}

function getWWParams(testParams) {
  const wwParams = JSON.parse(JSON.stringify(testParams));
  wwParams.numOutputs = 4;
  wwParams.memoryAliases[1] = 0;
  return wwParams;
}

function getAliasedParams(testParams) {
  const weakParams = JSON.parse(JSON.stringify(testParams));
  weakParams.aliasedMemory = true;
  weakParams.permuteSecond = 1;
  return weakParams;
}

export default function EvaluationTestSuite() {
  const pageState = getPageState();
  const aliasedParams = getAliasedParams(testParams);
  let rwConfig = buildTest("RW", pageState, aliasedParams, aliasedParams, rw, rwBuggy, rwResults, defaultKeys);
  let wrConfig = buildTest("WR", pageState, aliasedParams, aliasedParams, wr, wrBuggy, wrResults, defaultKeys);
  let wwConfig = buildTest("WW", pageState, aliasedParams, aliasedParams, ww, wwBuggy, wwResults, defaultKeys);
  let messagePassingConfig = buildTest("Message Passing", pageState, aliasedParams, testParams, messagePassing, messagePassing, messagePassingResults, weakTestKeys);
  let storeConfig = buildTest("Store", pageState, aliasedParams, testParams, store, store, storeResults, weakTestKeys);
  let readConfig = buildTest("Read", pageState, aliasedParams, testParams, read, read, readResults, weakTestKeys);
  let loadBufferConfig = buildTest("Load Buffer", pageState, aliasedParams, testParams, loadBuffer, loadBuffer, loadBufferResults, weakTestKeys);
  let storeBufferConfig = buildTest("Store Buffer", pageState, aliasedParams, testParams, storeBuffer, storeBuffer, storeBufferResults, weakTestKeys);
  let twoPlusTwoWriteConfig = buildTest("2+2 Write", pageState, aliasedParams, testParams, twoPlusTwoWrite, twoPlusTwoWrite, twoPlusTwoWriteResults, weakTestKeys);

  const tests = [rwConfig, wrConfig, wwConfig, messagePassingConfig, storeConfig, readConfig, loadBufferConfig, storeBufferConfig, twoPlusTwoWriteConfig];
  let initialIterations = pageState.iterations.value;
  let initialBuggyPercentage = pageState.buggyPercentage.value;
  const stressPanel = getStressPanel(testParams, pageState);
  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section content">
            <h1 className="testName">Evaluation Test Suite</h1>
            <p>
              The evaluation test suite is used to evaluate the performance of a set of tuned parameters on uncovering potential violations of WebGPU's memory consistency model.
              A test used for evaluation consists of two shaders: a valid shader with a post condition that is impossible under a correct implementation, and a buggy shader that is a
              transformed version of the valid shader where the impossible behavior is possible, but unlikely. During a test run, the transformed shader is substituted for the valid one
              some percentage of the time, and the parameter set is evaluated on whether the behavior is observed. There are two categories of evaluation tests.
            </p>
            <h5>Interleaved Tests</h5>
            <p>
              These tests consist of two thread, three instruction programs, where at least two of the instructions are a write. Extra "observer" threads may be added to force certain coherence
              orders. In the valid shader, the behavior is impossible due to coherence. However, in the buggy shader, a reordering of instructions in one of the test threads may lead to the behavior
              being observed if a precise interleaving of instructions happens across all threads.
            </p>
            <h5>Weak Memory Tests</h5>
            <p>
              These tests consist of two thread, four instruction programs, where at least two of the instructions are a write. In the valid shaders, all writes and reads are to one memory location.
              In a buggy shader, a cross thread coherence or reads-from relation is used to transform two writes or a write and a read to use a different memory location, in effect turning the test
              into one of the six weak memory tests. Since weak behaviors are possible under these buggy shaders, the weak behavior may be observed if thet test parameter set is effective.
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
            <label><b>Buggy Percentage:</b></label>
            <input className="input" type="text" defaultValue={initialBuggyPercentage} onInput={(e) => {
              pageState.buggyPercentage.update(e.target.value);
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
