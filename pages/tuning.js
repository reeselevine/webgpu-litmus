import { useState } from 'react';
import * as seedrandom from 'seedrandom';
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
import { ParamButton } from '../components/tuningTable.js';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const keys = ["seq", "interleaved", "weak"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(1000);
  const [randomSeed, setRandomSeed] = useState("");
  const [tuningTimes, setTuningTimes] = useState(10);
  const [rows, setRows] = useState([]);
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  const [logSum, setLogSum] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [completedTests, setCompletedTests] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [allStats, setAllStats] = useState({});
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
    randomSeed: {
      value: randomSeed,
      update: setRandomSeed
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
    logSum: {
      ...buildStateValues(logSum, setLogSum)
    },
    totalTime: {
      ...buildStateValues(totalTime, setTotalTime)
    },
    completedTests: {
      ...buildStateValues(completedTests, setCompletedTests)
    },
    totalTests: {
      value: totalTests,
      update: setTotalTests
    },
    allStats: {
      ...buildStateValues(allStats, setAllStats)
    },
    activeTests: [],
    curParams: testParams
  }
}

function TuningTest(props) {
  return (
    <>
      <div>
        <input type="checkbox" checked={props.isChecked} onChange={props.handleOnChange} disabled={props.pageState.running.value} />
        {props.testVariant}
      </div>
    </>
  )
}

function buildTest(testName, testVariant, shader, handler, pageState, testParamOverrides = {}) {
  const [isChecked, setIsChecked] = useState(false);

  const handleOnChange = () => {
    setIsChecked(!isChecked);
  };
  return {
    testName: testName,
    testVariant: testVariant,
    shader: shader,
    handler: handler,
    state: {
      seq: 0,
      interleaved: 0,
      weak: 0
    },
    isChecked: isChecked,
    setIsChecked: setIsChecked,
    testParamOverrides: testParamOverrides,
    jsx: <TuningTest key={testVariant} testVariant={testVariant} isChecked={isChecked} handleOnChange={handleOnChange} pageState={pageState} />
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

function getRunStats(activeTests) {
  let stats = {};
  for (const test of activeTests) {
    stats[test.testName + " " + test.testVariant] = JSON.parse(JSON.stringify(test.state));
  }
  return stats;
}

function RunStatistics(props) {
  const [isActive, setIsActive] = useState(false);
  let json = JSON.stringify(props.stats, null, 2);
  return (
    <>
      <button className="button is-info is-small" onClick={() => {
        setIsActive(!isActive);
      }}>
        Statistics
      </button>
      <div className={"modal " + (isActive ? "is-active" : "")}>
        <div className="modal-background" onClick={() => {
          setIsActive(!isActive)
        }}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Statistics</p>
            <button className="delete" aria-label="close" onClick={() => {
              setIsActive(!isActive)
            }}></button>
          </header>
          <section className="modal-card-body">
            <pre>
              {json}
            </pre>
          </section>
          <footer className="modal-card-foot">
            <a className="button is-success" href={`data:text/json;charset=utf-8,${encodeURIComponent(json)}`} download="stats.json">
              Download
            </a>
          </footer>
        </div>
      </div>
    </>
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
      </td>
      <td>
      </td>
      <td>
        {props.pageState.completedTests.visibleState}/{props.pageState.totalTests.value}
      </td>
      <td>
        {!props.pageState.running.value ?
          100 :
          (100 * (props.pageState.completedTests.visibleState * props.pageState.iterations.value + curIter) / (props.pageState.totalTests.value * props.pageState.iterations.value)).toFixed(0)}
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
      <td>
        {props.pageState.logSum.visibleState.toFixed(3)}
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
        <ParamButton params={props.pageState.curParams} pageState={props.pageState}></ParamButton>
      </td>
      <td>
        <RunStatistics stats={props.stats}/>
      </td>
      <td>
        {props.pageState.completedTests.internalState}/{props.pageState.activeTests.length}
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
      <td>
        {props.pageState.logSum.internalState.toFixed(3)}
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
  let mpName = "Message Passing";
  let mpTests = [
    buildTest(mpName, "Default", messagePassing, messagePassingHandlers, pageState),
    buildTest(mpName, "Barrier Variant", barrierMessagePassing, messagePassingHandlers, pageState),
    buildTest(mpName, "Barrier Variant 1", barrier1MessagePassing, messagePassingHandlers, pageState),
    buildTest(mpName, "Barrier Variant 2", barrier2MessagePassing, messagePassingHandlers, pageState),
    buildTest(mpName, "Non-atomic with barrier", barrierMessagePassingNA, messagePassingHandlers, pageState)
  ];
  const mpJsx = <SelectorTest key="mp" testName={mpName} tests={mpTests} />;
  let storeName = "Store";
  let storeTests = [
    buildTest(storeName, "Default", store, storeHandlers, pageState),
    buildTest(storeName, "Barrier Variant", barrierStore, storeHandlers, pageState),
    buildTest(storeName, "Barrier Variant 1", barrier1Store, storeHandlers, pageState),
    buildTest(storeName, "Barrier Variant 2", barrier2Store, storeHandlers, pageState),
    buildTest(storeName, "Non-atomic with barrier", barrierStoreNA, storeHandlers, pageState)
  ];
  let readName = "Read";
  const storeJsx = <SelectorTest key="store" testName={storeName} tests={storeTests} />;
  let readTests = [
    buildTest(readName, "Default", read, readHandlers, pageState),
  ];
  const readJsx = <SelectorTest key="read" testName={readName} tests={readTests} />;
  let lbName = "Load Buffer";
  let lbTests = [
    buildTest(lbName, "Default", loadBuffer, loadBufferHandlers, pageState),
    buildTest(lbName, "Barrier Variant", barrierLoadBuffer, loadBufferHandlers, pageState),
    buildTest(lbName, "Barrier Variant 1", barrier1LoadBuffer, loadBufferHandlers, pageState),
    buildTest(lbName, "Barrier Variant 2", barrier2LoadBuffer, loadBufferHandlers, pageState),
    buildTest(lbName, "Non-atomic with barrier", barrierLoadBufferNA, loadBufferHandlers, pageState)
  ];
  const lbJsx = <SelectorTest kep="lb" testName={lbName} tests={lbTests} />;
  let sbName = "Store Buffer";
  let sbTests = [
    buildTest(sbName, "Default", storeBuffer, storeBufferHandlers, pageState),
  ];
  const sbJsx = <SelectorTest kep="sb" testName={sbName} tests={sbTests} />;
  let tptName = "2+2 Write";
  let twoPlusTwoWriteTests = [
    buildTest(tptName, "Default", twoPlusTwoWrite, twoPlusTwoWriteHandlers, pageState),
  ];
  const twoPlusTwoWriteJsx = <SelectorTest kep="sb" testName={tptName} tests={twoPlusTwoWriteTests} />;
  let weakMemoryJsx = [mpJsx, storeJsx, readJsx, lbJsx, sbJsx, twoPlusTwoWriteJsx];


  // Coherence tests
  const coherenceOverrides = {
    memoryAliases: {
      1: 0
    }
  };
  let corrName = "CoRR";
  let corrTests = [
    buildTest(corrName, "Default", coRR, coRRHandlers, pageState, coherenceOverrides),
    buildTest(corrName, "RMW Variant", coRR_RMW, coRRHandlers, pageState, coherenceOverrides),
    buildTest(corrName, "Default (workgroup memory)", coRR_workgroup, coRRHandlers, pageState, coherenceOverrides),
    buildTest(corrName, "RMW Variant (workgroup memory)", coRR_RMW_workgroup, coRRHandlers, pageState, coherenceOverrides),
    buildTest(corrName, "RMW Variant 1", coRR_RMW1, coRRHandlers, pageState, coherenceOverrides),
    buildTest(corrName, "RMW Variant 2", coRR_RMW2, coRRHandlers, pageState, coherenceOverrides)
  ];
  const coRRJsx = <SelectorTest key="corr" testName={corrName} tests={corrTests} />;
  let corr4Name = "4-threaded CoRR";
  let corr4Tests = [
    buildTest(corr4Name, "Default", coRR4, coRR4Handlers, pageState, coherenceOverrides),
    buildTest(corr4Name, "RMW Variant", coRR4_RMW, coRR4Handlers, pageState, coherenceOverrides),
    buildTest(corr4Name, "Default (workgroup memory)", coRR4_workgroup, coRR4Handlers, pageState, coherenceOverrides),
    buildTest(corr4Name, "RMW Variant (workgroup memory)", coRR4_RMW_workgroup, coRR4Handlers, pageState, coherenceOverrides)
  ];
  const coRR4Jsx = <SelectorTest key="corr4" testName={corr4Name} tests={corr4Tests} />;
  let cowwName = "CoWW";
  let cowwTests = [
    buildTest(cowwName, "Default", coWW, coWWHandlers, pageState, coherenceOverrides),
    buildTest(cowwName, "RMW Variant", coWW_RMW, coWWHandlers, pageState, coherenceOverrides),
    buildTest(cowwName, "Default (workgroup memory)", coWW_workgroup, coWWHandlers, pageState, coherenceOverrides),
    buildTest(cowwName, "RMW Variant (workgroup memory)", coWW_RMW_workgroup, coWWHandlers, pageState, coherenceOverrides)
  ];
  const coWWJsx = <SelectorTest key="coww" testName={cowwName} tests={cowwTests} />;
  let cowrName = "CoWR";
  let cowrTests = [
    buildTest(cowrName, "Default", coWR, coWRHandlers, pageState, coherenceOverrides),
    buildTest(cowrName, "RMW Variant", coWR_RMW, coWRHandlers, pageState, coherenceOverrides),
    buildTest(cowrName, "Default (workgroup memory)", coWR_workgroup, coWRHandlers, pageState, coherenceOverrides),
    buildTest(cowrName, "RMW Variant (workgroup memory)", coWR_RMW_workgroup, coWRHandlers, pageState, coherenceOverrides),
    buildTest(cowrName, "RMW Variant 1", coWR_RMW1, coWRHandlers, pageState, coherenceOverrides),
    buildTest(cowrName, "RMW Variant 2", coWR_RMW2, coWRHandlers, pageState, coherenceOverrides),
    buildTest(cowrName, "RMW Variant 3", coWR_RMW3, coWRHandlers, pageState, coherenceOverrides),
    buildTest(cowrName, "RMW Variant 4", coWR_RMW4, coWRHandlers, pageState, coherenceOverrides)
  ];
  const coWRJsx = <SelectorTest key="cowr" testName={cowrName} tests={cowrTests} />;
  let corw1Name = "CoRW1";
  let corw1Tests = [
    buildTest(corw1Name, "Default", coRW1, coRW1Handlers, pageState, coherenceOverrides),
    buildTest(corw1Name, "Default (workgroup memory)", coRW1_workgroup, coRW1Handlers, pageState, coherenceOverrides),
  ];
  const coRW1Jsx = <SelectorTest key="corw1" testName={corw1Name} tests={corw1Tests} />;
  let corw2Name = "CoRW2";
  let corw2Tests = [
    buildTest(corw2Name, "Default", coRW2, coRW2Handlers, pageState, coherenceOverrides),
    buildTest(corw2Name, "RMW Variant", coRW2_RMW, coRW2Handlers, pageState, coherenceOverrides),
    buildTest(corw2Name, "Default (workgroup memory)", coRW2_workgroup, coRW2Handlers, pageState, coherenceOverrides),
    buildTest(corw2Name, "RMW Variant (workgroup memory)", coRW2_RMW_workgroup, coRW2Handlers, pageState, coherenceOverrides)
  ];
  const coRW2Jsx = <SelectorTest key="corw2" testName={corw2Name} tests={corw2Tests} />;
  let coherenceJsx = [coRRJsx, coRR4Jsx, coWWJsx, coWRJsx, coRW1Jsx, coRW2Jsx];

  // Atomicity
  let atomName = "Atomicity";
  let atomicityTests = [
    buildTest(atomName, "Default", atomicity, atomicityHandlers, pageState),
    buildTest(atomName, "Default (workgroup memory)", atomicity_workgroup, atomicityHandlers, pageState)
  ];
  const atomicityJsx = [<SelectorTest key="atom" testName={atomName} tests={atomicityTests} />];

  // Barrier
  const barrierOverrides = {
    memoryAliases: {
      1: 0
    },
    minWorkgroupSize: 256,
    maxWorkgroupSize: 256
  };
  let barrierSLName = "Barrier Store Load";
  let barrierSLTests = [
    buildTest(barrierSLName, "Default", barrierSL, barrierStoreLoadHandlers, pageState, barrierOverrides),
    buildTest(barrierSLName, "Default (workgroup memory)", barrierWorkgroupSL, barrierStoreLoadHandlers, pageState, barrierOverrides)
  ];
  const barrierSLJsx = <SelectorTest key="barriersl" testName={barrierSLName} tests={barrierSLTests} />;
  let barrierLSName = "Barrier Load Store";
  let barrierLSTests = [
    buildTest(barrierLSName, "Default", barrierLS, barrierLoadStoreHandlers, pageState, barrierOverrides),
    buildTest(barrierLSName, "Default (workgroup memory)", barrierWorkgroupLS, barrierLoadStoreHandlers, pageState, barrierOverrides)
  ];
  const barrierLSJsx = <SelectorTest key="barrierls" testName={barrierLSName} tests={barrierLSTests} />;
  let barrierSSName = "Barrier Store Store";
  let barrierSSTests = [
    buildTest(barrierSSName, "Default", barrierSS, barrierStoreStoreHandlers, pageState, barrierOverrides),
    buildTest(barrierSSName, "Default (workgroup memory)", barrierWorkgroupSS, barrierStoreStoreHandlers, pageState, barrierOverrides)
  ];
  const barrierSSJsx = <SelectorTest key="barrierss" testName={barrierSSName} tests={barrierSSTests} />;
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
                      tests.map(test => test.setIsChecked(false));
                      mpTests[0].setIsChecked(true);
                      storeTests[0].setIsChecked(true);
                      readTests[0].setIsChecked(true);
                      lbTests[0].setIsChecked(true);
                      sbTests[0].setIsChecked(true);
                      twoPlusTwoWriteTests[0].setIsChecked(true);
                    }} disabled={pageState.running.value}>
                      Weak Memory Defaults
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      mpTests[0].setIsChecked(true);
                      mpTests[2].setIsChecked(true);
                      mpTests[3].setIsChecked(true);
                      storeTests[0].setIsChecked(true);
                      storeTests[2].setIsChecked(true);
                      storeTests[3].setIsChecked(true);
                      readTests[0].setIsChecked(true);
                      lbTests[0].setIsChecked(true);
                      lbTests[2].setIsChecked(true);
                      lbTests[3].setIsChecked(true);
                      sbTests[0].setIsChecked(true);
                      twoPlusTwoWriteTests[0].setIsChecked(true);
                    }} disabled={pageState.running.value}>
                      Weak Memory Comprehensive
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      corrTests.map(test => test.setIsChecked(true));
                      corr4Tests.map(test => test.setIsChecked(true));
                      cowwTests.map(test => test.setIsChecked(true));
                      cowrTests.map(test => test.setIsChecked(true));
                      corw1Tests.map(test => test.setIsChecked(true));
                      corw2Tests.map(test => test.setIsChecked(true));
                    }} disabled={pageState.running.value}>
                      Coherence All
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      barrierSLTests.map(test => test.setIsChecked(true));
                      barrierLSTests.map(test => test.setIsChecked(true));
                      barrierSSTests.map(test => test.setIsChecked(true));
                    }} disabled={pageState.running.value}>
                      Barrier All
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
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

function clearState(pageState, keys) {
  for (const key of keys) {
    pageState[key].internalState = 0;
    pageState[key].update(pageState[key].internalState);
  }
}

async function tune(tests, testParams, pageState) {
  pageState.tuningRows.update([]);
  pageState.allStats.internalState = {};
  pageState.activeTests = [];
  for (let i = 0; i < tests.length; i++) {
    if (tests[i].isChecked) {
      pageState.activeTests.push(tests[i]);
    }
  }
  pageState.running.update(true);
  pageState.totalTests.update(pageState.activeTests.length);
  let generator;
  if (pageState.randomSeed.value.length === 0) {
    generator = seedrandom();
  } else {
    generator = seedrandom(pageState.randomSeed.value);
    pageState.allStats.internalState["randomSeed"] = pageState.randomSeed.value;
  }
  for (let i = 0; i < pageState.tuningTimes.value; i++) {
    clearState(pageState, ["totalTime", "completedTests", "seq", "interleaved", "weak", "logSum"]);
    let params = {
      ...randomConfig(generator),
      id: i,
      minWorkgroupSize: testParams.minWorkgroupSize,
      maxWorkgroupSize: testParams.maxWorkgroupSize,
      numMemLocations: testParams.numMemLocations,
      numOutputs: testParams.numOutputs,
      memoryAliases: testParams.memoryAliases
    };
    pageState.curParams = params;
    for (let j = 0; j < pageState.activeTests.length; j++) {
      let curTest = pageState.activeTests[j];
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
      if (curTest.state.weak != 0) {
        pageState.logSum.internalState += Math.log(curTest.state.weak);
        pageState.logSum.update(pageState.logSum.internalState);
      }
    }
    let stats = getRunStats(pageState.activeTests);
    let row = <StaticRow pageState={pageState} key={params.id} stats={stats}/>;
    pageState.allStats.internalState[i] = stats;
    pageState.tuningRows.update(oldRows => [...oldRows, row]);
  }
  pageState.allStats.update(pageState.allStats.internalState);
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
        <div className="column" >
          <div className="control">
            <label><b>Random Seed:</b></label>
            <input className="input" type="text" defaultValue={""} onInput={(e) => {
              pageState.randomSeed.update(e.target.value);
            }} disabled={pageState.running.value} />
          </div>
        </div>
      </div>
      <div>
        <label><b>All Runs:</b></label>
        <RunStatistics stats={pageState.allStats.visibleState}/>
      </div>
      <div className="table-container">
        <table className="table is-hoverable">
          <thead>
            <tr>
              <th>Run number</th>
              <th>Parameters</th>
              <th>Run Statistics</th>
              <th>Tests Completed</th>
              <th>Overall Progress</th>
              <th>Time (seconds)</th>
              <th>Total Sequential Behaviors</th>
              <th>Total Interleaved Behaviors</th>
              <th>Total Weak Behaviors</th>
              <th>Log Sum of Weak Behaviors</th>
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
