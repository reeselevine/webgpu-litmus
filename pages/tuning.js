import { useState } from 'react';
import { atomicityHandlers, barrierLoadStoreHandlers, barrierStoreLoadHandlers, barrierStoreStoreHandlers, buildThrottle, coRR4Handlers, coRRHandlers, coRW1Handlers, coRW2Handlers, coWRHandlers, coWWHandlers, loadBufferHandlers, messagePassingHandlers, randomConfig, readHandlers, storeBufferHandlers, storeHandlers, twoPlusTwoWriteHandlers } from '../components/test-page-utils.js';
import { reportTime, getCurrentIteration, runLitmusTest } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import messagePassing from '../shaders/message-passing.wgsl';
import barrierMessagePassing from '../shaders/barrier-message-passing.wgsl'
import barrier1MessagePassing from '../shaders/barrier1-message-passing.wgsl'
import barrier2MessagePassing from '../shaders/barrier2-message-passing.wgsl'
import barrierMessagePassingNA from '../shaders/barrier-message-passing-na.wgsl';
import store from '../shaders/store.wgsl';
import barrierStore from '../shaders/barrier-store.wgsl'
import barrier1Store from '../shaders/barrier1-store.wgsl'
import barrier2Store from '../shaders/barrier2-store.wgsl'
import barrierStoreNA from '../shaders/barrier-store-na.wgsl';
import loadBuffer from '../shaders/load-buffer.wgsl';
import barrierLoadBuffer from '../shaders/barrier-load-buffer.wgsl';
import barrier1LoadBuffer from '../shaders/barrier1-load-buffer.wgsl';
import barrier2LoadBuffer from '../shaders/barrier2-load-buffer.wgsl';
import barrierLoadBufferNA from '../shaders/barrier-load-buffer-na.wgsl';
import coRR from '../shaders/corr.wgsl';
import coRR_RMW from '../shaders/corr-rmw.wgsl';
import coRR_RMW1 from '../shaders/corr-rmw1.wgsl';
import coRR_RMW2 from '../shaders/corr-rmw2.wgsl';
import coRR_workgroup from '../shaders/corr-workgroup.wgsl';
import coRR_RMW_workgroup from '../shaders/corr-rmw-workgroup.wgsl';
import coRR4 from '../shaders/corr4.wgsl';
import coRR4_RMW from '../shaders/corr4-rmw.wgsl';
import coRR4_workgroup from '../shaders/corr4-workgroup.wgsl';
import coRR4_RMW_workgroup from '../shaders/corr4-rmw-workgroup.wgsl';
import coWW from '../shaders/coww.wgsl';
import coWW_RMW from '../shaders/coww-rmw.wgsl';
import coWW_workgroup from '../shaders/coww-workgroup.wgsl';
import coWW_RMW_workgroup from '../shaders/coww-rmw-workgroup.wgsl';
import coWR from '../shaders/cowr.wgsl';
import coWR_RMW from '../shaders/cowr-rmw.wgsl';
import coWR_workgroup from '../shaders/cowr-workgroup.wgsl';
import coWR_RMW_workgroup from '../shaders/cowr-rmw-workgroup.wgsl';
import coWR_RMW1 from '../shaders/cowr-rmw1.wgsl';
import coWR_RMW2 from '../shaders/cowr-rmw2.wgsl';
import coWR_RMW3 from '../shaders/cowr-rmw3.wgsl';
import coWR_RMW4 from '../shaders/cowr-rmw4.wgsl';
import coRW1 from '../shaders/corw1.wgsl';
import coRW1_workgroup from '../shaders/corw1-workgroup.wgsl';
import coRW2 from '../shaders/corw2.wgsl';
import coRW2_RMW from '../shaders/corw2-rmw.wgsl';
import coRW2_workgroup from '../shaders/corw2-workgroup.wgsl';
import coRW2_RMW_workgroup from '../shaders/corw2-rmw-workgroup.wgsl';
import atomicity from '../shaders/atomicity.wgsl';
import atomicity_workgroup from '../shaders/atomicity-workgroup.wgsl';
import barrierLS from '../shaders/barrier-load-store.wgsl';
import barrierSL from '../shaders/barrier-store-load.wgsl';
import barrierSS from '../shaders/barrier-store-store.wgsl';
import barrierWorkgroupLS from '../shaders/barrier-load-store-workgroup.wgsl';
import barrierWorkgroupSL from '../shaders/barrier-store-load-workgroup.wgsl';
import barrierWorkgroupSS from '../shaders/barrier-store-store-workgroup.wgsl';

import read from '../shaders/read.wgsl';
import storeBuffer from '../shaders/store-buffer.wgsl';
import twoPlusTwoWrite from '../shaders/2+2-write.wgsl';

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

function TuningTest(props) {
  return (
    <>
      <div>
        <input type="checkbox" checked={props.isChecked} onChange={props.handleOnChange} disabled={props.pageState.running.value}/>
        {props.testName}
      </div>
    </>
  )
}

function buildTest(testName, shader, handler, pageState, testParamOverrides = {}) {
  const [isChecked, setIsChecked] = useState(false);

  const handleOnChange = () => {
    setIsChecked(!isChecked);
  };
  return {
    shader: shader,
    handler: handler,
    state: {
      seq: 0,
      interleaved: 0,
      weak: 0,
      isChecked: isChecked,
      setIsChecked: setIsChecked
    },
    testParamOverrides: testParamOverrides,
    jsx: <TuningTest key={testName} testName={testName} isChecked={isChecked} handleOnChange={handleOnChange} pageState={pageState}/>
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
        <ParamButton testParams={props.pageState.curParams} />
      </td>
      <td>
        {props.pageState.completedTests.visibleState}/{props.pageState.totalTests.visibleState}
      </td>
      <td>
        {!props.pageState.running.value ?
          100 :
          (100 * (props.pageState.completedTests.visibleState * props.pageState.iterations.value + curIter) / (props.pageState.totalTests.visibleState * props.pageState.iterations.value)).toFixed(0)}
      </td>
      <td>
        {(props.pageState.running.value ? (props.pageState.totalTime.visibleState + time) : props.pageState.totalTime.visibleState).toFixed(3)}
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
        <ParamButton testParams={props.pageState.curParams}></ParamButton>
      </td>
      <td>
        {props.pageState.completedTests.internalState}/{props.pageState.totalTests.internalState}
      </td>
      <td>
        100
      </td>
      <td>
        {props.pageState.totalTime.internalState.toFixed(3)}
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

function SelectorTest(props) {
  const [testsVisible, setTestsVisible] = useState(false);
  return (
    <>
      <li>
        <a onClick={() => setTestsVisible(!testsVisible)}>{props.testName}</a>
        <ul className={testsVisible ? "is-active" : "is-hidden"}>
          {props.tests.map(test => test.jsx)}
        </ul>
      </li>

    </>
  )
}

function SelectorCategory(props) {
  return (
    <>
      <p className="menu-label">
        {props.category}
      </p>
      <ul className="menu-list">
        {props.tests}
      </ul>
    </>
  )
}

function getTestSelector(pageState) {
  // Weak memory tests
  let mpTests = [
    buildTest("Default", messagePassing, messagePassingHandlers, pageState),
    buildTest("Barrier Variant", barrierMessagePassing, messagePassingHandlers, pageState),
    buildTest("Barrier Variant 1", barrier1MessagePassing, messagePassingHandlers, pageState),
    buildTest("Barrier Variant 2", barrier2MessagePassing, messagePassingHandlers, pageState),
    buildTest("Non-atomic with barrier", barrierMessagePassingNA, messagePassingHandlers, pageState)
  ];
  const mpJsx = <SelectorTest key="mp" testName="Message Passing" tests={mpTests} />;
  let storeTests = [
    buildTest("Default", store, storeHandlers, pageState),
    buildTest("Barrier Variant", barrierStore, storeHandlers, pageState),
    buildTest("Barrier Variant 1", barrier1Store, storeHandlers, pageState),
    buildTest("Barrier Variant 2", barrier2Store, storeHandlers, pageState),
    buildTest("Non-atomic with barrier", barrierStoreNA, storeHandlers, pageState)
  ];
  const storeJsx = <SelectorTest key="store" testName="Store" tests={storeTests} />;
  let readTests = [
    buildTest("Default", read, readHandlers, pageState),
  ];
  const readJsx = <SelectorTest key="read" testName="Read" tests={readTests} />;
  let lbTests = [
    buildTest("Default", loadBuffer, loadBufferHandlers, pageState),
    buildTest("Barrier Variant", barrierLoadBuffer, loadBufferHandlers, pageState),
    buildTest("Barrier Variant 1", barrier1LoadBuffer, loadBufferHandlers, pageState),
    buildTest("Barrier Variant 2", barrier2LoadBuffer, loadBufferHandlers, pageState),
    buildTest("Non-atomic with barrier", barrierLoadBufferNA, loadBufferHandlers, pageState)
  ];
  const lbJsx = <SelectorTest kep="lb" testName="Load Buffer" tests={lbTests} />;
  let sbTests = [
    buildTest("Default", storeBuffer, storeBufferHandlers, pageState),
  ];
  const sbJsx = <SelectorTest kep="sb" testName="Store Buffer" tests={sbTests} />;
  let twoPlusTwoWriteTests = [
    buildTest("Default", twoPlusTwoWrite, twoPlusTwoWriteHandlers, pageState),
  ];
  const twoPlusTwoWriteJsx = <SelectorTest kep="sb" testName="2+2 Write" tests={twoPlusTwoWriteTests} />;
  let weakMemoryJsx = [mpJsx, storeJsx, readJsx, lbJsx, sbJsx, twoPlusTwoWriteJsx];


  // Coherence tests
  const coherenceOverrides = {
    memoryAliases : {
      1 : 0
    }
  };
  let corrTests = [
    buildTest("Default", coRR, coRRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant", coRR_RMW, coRRHandlers, pageState, coherenceOverrides),
    buildTest("Default (workgroup memory)", coRR_workgroup, coRRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant (workgroup memory)", coRR_RMW_workgroup, coRRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant 1", coRR_RMW1, coRRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant 2", coRR_RMW2, coRRHandlers, pageState, coherenceOverrides)
  ];
  const coRRJsx = <SelectorTest key="corr" testName="CoRR" tests={corrTests}/>;
  let corr4Tests = [
    buildTest("Default", coRR4, coRR4Handlers, pageState, coherenceOverrides),
    buildTest("RMW Variant", coRR4_RMW, coRR4Handlers, pageState, coherenceOverrides),
    buildTest("Default (workgroup memory)", coRR4_workgroup, coRR4Handlers, pageState, coherenceOverrides),
    buildTest("RMW Variant (workgroup memory)", coRR4_RMW_workgroup, coRR4Handlers, pageState, coherenceOverrides)
  ];
  const coRR4Jsx = <SelectorTest key="corr4" testName="4-threaded CoRR" tests={corr4Tests}/>;
  let cowwTests = [
    buildTest("Default", coWW, coWWHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant", coWW_RMW, coWWHandlers, pageState, coherenceOverrides),
    buildTest("Default (workgroup memory)", coWW_workgroup, coWWHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant (workgroup memory)", coWW_RMW_workgroup, coWWHandlers, pageState, coherenceOverrides)
  ];
  const coWWJsx = <SelectorTest key="coww" testName="CoWW" tests={cowwTests}/>;
  let cowrTests = [
    buildTest("Default", coWR, coWRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant", coWR_RMW, coWRHandlers, pageState, coherenceOverrides),
    buildTest("Default (workgroup memory)", coWR_workgroup, coWRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant (workgroup memory)", coWR_RMW_workgroup, coWRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant 1", coWR_RMW1, coWRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant 2", coWR_RMW2, coWRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant 3", coWR_RMW3, coWRHandlers, pageState, coherenceOverrides),
    buildTest("RMW Variant 4", coWR_RMW4, coWRHandlers, pageState, coherenceOverrides)
  ];
  const coWRJsx = <SelectorTest key="cowr" testName="CoWR" tests={cowrTests}/>;
  let corw1Tests = [
    buildTest("Default", coRW1, coRW1Handlers, pageState, coherenceOverrides),
    buildTest("Default (workgroup memory)", coRW1_workgroup, coRW1Handlers, pageState, coherenceOverrides),
  ];
  const coRW1Jsx = <SelectorTest key="corw1" testName="CoRW1" tests={corw1Tests}/>;
  let corw2Tests = [
    buildTest("Default", coRW2, coRW2Handlers, pageState, coherenceOverrides),
    buildTest("RMW Variant", coRW2_RMW, coRW2Handlers, pageState, coherenceOverrides),
    buildTest("Default (workgroup memory)", coRW2_workgroup, coRW2Handlers, pageState, coherenceOverrides),
    buildTest("RMW Variant (workgroup memory)", coRW2_RMW_workgroup, coRW2Handlers, pageState, coherenceOverrides)
  ];
  const coRW2Jsx = <SelectorTest key="corw2" testName="CoRW2" tests={corw2Tests}/>;
  let coherenceJsx = [coRRJsx, coRR4Jsx, coWWJsx, coWRJsx, coRW1Jsx, coRW2Jsx];

  // Atomicity
  let atomicityTests = [
    buildTest("Default", atomicity, atomicityHandlers, pageState),
    buildTest("Default (workgroup memory)", atomicity_workgroup, atomicityHandlers, pageState)
  ];
  const atomicityJsx = [<SelectorTest key="atom" testName="Atomicity" tests={atomicityTests}/>];

  // Barrier
  const barrierOverrides = {
    memoryAliases : {
      1 : 0
    },
    minWorkgroupSize: 256,
    maxWorkgroupSize: 256
  };
  let barrierSLTests = [
    buildTest("Default", barrierSL, barrierStoreLoadHandlers, pageState, barrierOverrides),
    buildTest("Default (workgroup memory)", barrierWorkgroupSL, barrierStoreLoadHandlers, pageState, barrierOverrides)
  ];
  const barrierSLJsx = <SelectorTest key="barriersl" testName="Barrier Store Load" tests={barrierSLTests}/>;

  let barrierLSTests = [
    buildTest("Default", barrierLS, barrierLoadStoreHandlers, pageState, barrierOverrides),
    buildTest("Default (workgroup memory)", barrierWorkgroupLS, barrierLoadStoreHandlers, pageState, barrierOverrides)
  ];
  const barrierLSJsx = <SelectorTest key="barrierls" testName="Barrier Load Store" tests={barrierLSTests}/>;

  let barrierSSTests = [
    buildTest("Default", barrierSS, barrierStoreStoreHandlers, pageState, barrierOverrides),
    buildTest("Default (workgroup memory)", barrierWorkgroupSS, barrierStoreStoreHandlers, pageState, barrierOverrides)
  ];
  const barrierSSJsx = <SelectorTest key="barrierss" testName="Barrier Store Store" tests={barrierSSTests}/>;
  const barrierJsx = [barrierSLJsx, barrierLSJsx, barrierSSJsx];

  let tests = [...mpTests, ...storeTests, ...readTests, ...lbTests, ...sbTests, ...twoPlusTwoWriteTests,
    ...corrTests, ...corr4Tests, ...cowwTests, ...cowrTests, ...corw1Tests, ...corw2Tests, ...atomicityTests,
    ...barrierSLTests, ...barrierLSTests, ...barrierSSTests];
  return {
    tests: tests,
    jsx: (
      <>
        <div className="column is-one-third mr-2">
          <nav className="panel">
            <p className="panel-heading">
              Selected Tests
            </p>
            <div className="container" style={{ overflowY: 'scroll', overflowX: 'hidden', height: '350px' }}>
              <aside className="menu">
                <SelectorCategory category="Weak Memory Tests" tests={weakMemoryJsx} />
                <SelectorCategory category="Coherence Tests" tests={coherenceJsx} />
                <SelectorCategory category="Atomicity Tests" tests={atomicityJsx} />
                <SelectorCategory category="Barrier Tests" tests={barrierJsx} />
              </aside>
            </div>
            <div className="panel-block p-2">
              <div className="columns is-2 ">
                <div className="column ">
                  <b> Presets </b>
                  <div className="buttons are-small">
                    <button className="button is-link is-outlined " onClick={() => {
                      mpTests[0].state.setIsChecked(true);
                      storeTests[0].state.setIsChecked(true);
                      readTests[0].state.setIsChecked(true);
                      lbTests[0].state.setIsChecked(true);
                      sbTests[0].state.setIsChecked(true);
                      twoPlusTwoWriteTests[0].state.setIsChecked(true);
                    }} disabled={pageState.running.value}>
                      Weak Memory Defaults
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      corrTests[0].state.setIsChecked(true);
                      corr4Tests[0].state.setIsChecked(true);
                      cowwTests[0].state.setIsChecked(true);
                      cowrTests[0].state.setIsChecked(true);
                      corw1Tests[0].state.setIsChecked(true);
                      corw2Tests[0].state.setIsChecked(true);
                    }} disabled={pageState.running.value}>
                      Coherence Defaults
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      barrierSLTests[0].state.setIsChecked(true);
                      barrierLSTests[0].state.setIsChecked(true);
                      barrierSSTests[0].state.setIsChecked(true);
                    }} disabled={pageState.running.value}>
                      Barrier Defaults
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.state.setIsChecked(false));
                    }} disabled={pageState.running.value}>
                      Clear all
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </>
    )
  }
}

async function tune(tests, testParams, pageState) {
  pageState.tuningRows.update([]);
  pageState.totalTests.internalState = 0;
  let activeTests = [];
  for (let i = 0; i < tests.length; i++) {
    if (tests[i].state.isChecked) {
      activeTests.push(tests[i]);
    }
  }
  pageState.totalTests.internalState = activeTests.length;
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
    for (let j = 0; j < activeTests.length; j++) {
      let curTest = activeTests[j];
      curTest.state.seq = 0;
      curTest.state.interleaved = 0;
      curTest.state.weak = 0;
      let newParams = JSON.parse(JSON.stringify(params));
      for (const key in curTest.testParamOverrides) {
        newParams[key] = curTest.testParamOverrides[key];
      }
      await runLitmusTest(curTest.shader, newParams, pageState.iterations.value, handleResult(curTest, pageState));
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
  const testSelector = getTestSelector(pageState);
  let initialIterations = pageState.iterations.value;
  let initialTuningTimes = pageState.tuningTimes.value;
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
        {testSelector.jsx}
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
            tune(testSelector.tests, testParams, pageState);
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
            <DynamicRow pageState={pageState} testParams={testParams} />
            {pageState.tuningRows.value}
          </tbody>
        </table>
      </div>
    </>
  );
}
