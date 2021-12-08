import { useState } from 'react';
import * as seedrandom from 'seedrandom';
import { buildThrottle, randomConfig } from '../components/test-page-utils.js';
import { reportTime, getCurrentIteration, runLitmusTest } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import messagePassing from '../shaders/mp/message-passing.wgsl'
import barrierMessagePassing from '../shaders/mp/message-passing-barrier.wgsl'
import workgroupMessagePassing from '../shaders/mp/message-passing-workgroup.wgsl';
import storageWorkgroupMessagePassing from '../shaders/mp/message-passing-storage-workgroup.wgsl';
import barrierWorkgroupMessagePassing from '../shaders/mp/message-passing-workgroup-barrier.wgsl';
import barrierStorageWorkgroupMessagePassing from '../shaders/mp/message-passing-storage-workgroup-barrier.wgsl';
import messagePassingResults from '../shaders/mp/message-passing-results.wgsl';
import store from '../shaders/store/store.wgsl'
import barrierStore from '../shaders/store/store-barrier.wgsl'
import workgroupStore from '../shaders/store/store-workgroup.wgsl'
import storageWorkgroupStore from '../shaders/store/store-storage-workgroup.wgsl'
import barrierWorkgroupStore from '../shaders/store/store-workgroup-barrier.wgsl'
import barrierStorageWorkgroupStore from '../shaders/store/store-storage-workgroup-barrier.wgsl'
import storeResults from '../shaders/store/store-results.wgsl';
import storeWorkgroupResults from '../shaders/store/store-workgroup-results.wgsl';
import read from '../shaders/read/read.wgsl'
import readWorkgroup from '../shaders/read/read-workgroup.wgsl'
import readStorageWorkgroup from '../shaders/read/read-storage-workgroup.wgsl'
import readResults from '../shaders/read/read-results.wgsl'
import readWorkgroupResults from '../shaders/read/read-workgroup-results.wgsl'
import loadBuffer from '../shaders/lb/load-buffer.wgsl'
import barrierLoadBuffer from '../shaders/lb/load-buffer-barrier.wgsl'
import workgroupLoadBuffer from '../shaders/lb/load-buffer-workgroup.wgsl';
import storageWorkgroupLoadBuffer from '../shaders/lb/load-buffer-storage-workgroup.wgsl';
import barrierWorkgroupLoadBuffer from '../shaders/lb/load-buffer-workgroup-barrier.wgsl';
import barrierStorageWorkgroupLoadBuffer from '../shaders/lb/load-buffer-storage-workgroup-barrier.wgsl';
import loadBufferResults from '../shaders/lb/load-buffer-results.wgsl';
import loadBufferWorkgroupResults from '../shaders/lb/load-buffer-workgroup-results.wgsl';
import storeBuffer from '../shaders/sb/store-buffer.wgsl'
import storeBufferWorkgroup from '../shaders/sb/store-buffer-workgroup.wgsl'
import storeBufferStorageWorkgroup from '../shaders/sb/store-buffer-storage-workgroup.wgsl'
import storeBufferResults from '../shaders/sb/store-buffer-results.wgsl'
import storeBufferWorkgroupResults from '../shaders/sb/store-buffer-workgroup-results.wgsl'
import twoPlusTwoWrite from '../shaders/2+2w/2+2-write.wgsl'
import twoPlusTwoWriteWorkgroup from '../shaders/2+2w/2+2-write-workgroup.wgsl'
import twoPlusTwoWriteStorageWorkgroup from '../shaders/2+2w/2+2-write-storage-workgroup.wgsl'
import twoPlusTwoWriteResults from '../shaders/2+2w/2+2-write-results.wgsl'
import twoPlusTwoWriteWorkgroupResults from '../shaders/2+2w/2+2-write-workgroup-results.wgsl'
import coRR from '../shaders/corr/corr.wgsl'
import coRRWorkgroup from '../shaders/corr/corr-workgroup.wgsl'
import coRRStorageWorkgroup from '../shaders/corr/corr-storage-workgroup.wgsl'
import coRRResults from '../shaders/corr/corr-results.wgsl'
import coRRWorkgroupResults from '../shaders/corr/corr-workgroup-results.wgsl'
import coWW from '../shaders/coww/coww.wgsl'
import coWWWorkgroup from '../shaders/coww/coww-workgroup.wgsl'
import coWWStorageWorkgroup from '../shaders/coww/coww-storage-workgroup.wgsl'
import coWWResults from '../shaders/coww/coww-results.wgsl'
import coWWWorkgroupResults from '../shaders/coww/coww-workgroup-results.wgsl'
import coWR from '../shaders/cowr/cowr.wgsl'
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
import { ParamButton } from '../components/tuningTable.js';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const defaultKeys = ["seq0", "seq1", "interleaved", "weak"];
const oneThreadKeys = ["seq", "weak"];

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

function buildTest(testName, testVariant, shader, resultShader, pageState, testKeys, testParamOverrides = {}) {
  const [isChecked, setIsChecked] = useState(false);

  const handleOnChange = () => {
    setIsChecked(!isChecked);
  };
  return {
    testName: testName,
    testVariant: testVariant,
    shader: shader,
    resultShader: resultShader,
    state: {
      seq: 0,
      interleaved: 0,
      weak: 0
    },
    keys: testKeys,
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
  return function (result) {
    for (let i = 0; i < test.keys.length; i++) {
      var key;
      if (test.keys[i].includes("seq")) {
        key = "seq";
      } else {
        key = test.keys[i];
      }
      test.state[key] = test.state[key] + result[i];
      pageState[key].internalState = pageState[key].internalState + result[i];
      pageState[key].update(pageState[key].internalState);
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
          (100 * (props.pageState.completedTests.visibleState * props.pageState.iterations.value + curIter) / (props.pageState.totalTests.value * props.pageState.iterations.value)).toFixed(0)}%
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
        100%
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
    buildTest(mpName, "Default", messagePassing, messagePassingResults, pageState, defaultKeys),
    buildTest(mpName, "Barrier Variant", barrierMessagePassing, messagePassingResults, pageState, defaultKeys),
    buildTest(mpName, "Workgroup (workgroup memory)", workgroupMessagePassing, messagePassingResults, pageState, defaultKeys),
    buildTest(mpName, "Barrier Workgroup (workgroup memory)", barrierWorkgroupMessagePassing, messagePassingResults, pageState, defaultKeys),
    buildTest(mpName, "Workgroup (storage memory)", storageWorkgroupMessagePassing, messagePassingResults, pageState, defaultKeys),
    buildTest(mpName, "Barrier Workgroup (storage memory)", barrierStorageWorkgroupMessagePassing, messagePassingResults, pageState, defaultKeys)
  ];
  const mpJsx = <SelectorTest key="mp" testName={mpName} tests={mpTests} />;
  let storeName = "Store";
  let storeTests = [
    buildTest(storeName, "Default", store, storeResults, pageState, defaultKeys),
    buildTest(storeName, "Barrier Variant", barrierStore, storeResults, pageState, defaultKeys),
    buildTest(storeName, "Workgroup (workgroup memory)", workgroupStore, storeWorkgroupResults, pageState, defaultKeys),
    buildTest(storeName, "Barrier Workgroup (workgroup memory)", barrierWorkgroupStore, storeWorkgroupResults, pageState, defaultKeys),
    buildTest(storeName, "Workgroup (storage memory)", storageWorkgroupStore, storeWorkgroupResults, pageState, defaultKeys),
    buildTest(storeName, "Barrier Workgroup (storage memory)", barrierStorageWorkgroupStore, storeWorkgroupResults, pageState, defaultKeys)
  ];
  let readName = "Read";
  const storeJsx = <SelectorTest key="store" testName={storeName} tests={storeTests} />;
  let readTests = [
    buildTest(readName, "Default", read, readResults, pageState, defaultKeys),
    buildTest(readName, "Workgroup (workgroup memory)", readWorkgroup, readWorkgroupResults, pageState, defaultKeys),
    buildTest(readName, "Workgroup (storage memory)", readStorageWorkgroup, readWorkgroupResults, pageState, defaultKeys),
  ];
  const readJsx = <SelectorTest key="read" testName={readName} tests={readTests} />;
  let lbName = "Load Buffer";
  let lbTests = [
    buildTest(lbName, "Default", loadBuffer, loadBufferResults, pageState, defaultKeys),
    buildTest(lbName, "Barrier Variant", barrierLoadBuffer, loadBufferResults, pageState, defaultKeys),
    buildTest(lbName, "Workgroup (workgroup memory)", workgroupLoadBuffer, loadBufferWorkgroupResults, pageState, defaultKeys),
    buildTest(lbName, "Barrier Workgroup (workgroup memory)", barrierWorkgroupLoadBuffer, loadBufferWorkgroupResults, pageState, defaultKeys),
    buildTest(lbName, "Workgroup (storage memory)", storageWorkgroupLoadBuffer, loadBufferWorkgroupResults, pageState, defaultKeys),
    buildTest(lbName, "Barrier Workgroup (storage memory)", barrierStorageWorkgroupLoadBuffer, loadBufferWorkgroupResults, pageState, defaultKeys)
  ];
  const lbJsx = <SelectorTest key="lb" testName={lbName} tests={lbTests} />;
  let sbName = "Store Buffer";
  let sbTests = [
    buildTest(sbName, "Default", storeBuffer, storeBufferResults, pageState, defaultKeys),
    buildTest(sbName, "Workgroup (workgroup memory)", storeBufferWorkgroup, storeBufferWorkgroupResults, pageState, defaultKeys),
    buildTest(sbName, "Workgroup (storage memory)", storeBufferStorageWorkgroup, storeBufferWorkgroupResults, pageState, defaultKeys)
  ];
  const sbJsx = <SelectorTest key="sb" testName={sbName} tests={sbTests} />;
  let tptName = "2+2 Write";
  let twoPlusTwoWriteTests = [
    buildTest(tptName, "Default", twoPlusTwoWrite, twoPlusTwoWriteResults, pageState, defaultKeys),
    buildTest(tptName, "Workgroup (workgroup memory)", twoPlusTwoWriteWorkgroup, twoPlusTwoWriteWorkgroupResults, pageState, defaultKeys),
    buildTest(tptName, "Workgroup (storage memory)", twoPlusTwoWriteStorageWorkgroup, twoPlusTwoWriteWorkgroupResults, pageState, defaultKeys)
  ];
  const twoPlusTwoWriteJsx = <SelectorTest key="tpt" testName={tptName} tests={twoPlusTwoWriteTests} />;
  let weakMemoryJsx = [mpJsx, storeJsx, readJsx, lbJsx, sbJsx, twoPlusTwoWriteJsx];

  // Coherence tests
  const coherenceOverrides = {
    aliasedMemory: true,
    permuteSecond: 1
  };

  let corrName = "CoRR";
  let corrTests = [
    buildTest(corrName, "Default", coRR, coRRResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(corrName, "Workgroup (workgroup memory)", coRRWorkgroup, coRRWorkgroupResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(corrName, "Workgroup (storage memory)", coRRStorageWorkgroup, coRRWorkgroupResults, pageState, defaultKeys, coherenceOverrides)
  ];
  const coRRJsx = <SelectorTest key="corr" testName={corrName} tests={corrTests} />;
  let cowwName = "CoWW";
  let cowwTests = [
    buildTest(cowwName, "Default", coWW, coWWResults, pageState, oneThreadKeys, coherenceOverrides),
    buildTest(cowwName, "Workgroup (workgroup memory)", coWWWorkgroup, coWWWorkgroupResults, pageState, oneThreadKeys, coherenceOverrides),
    buildTest(cowwName, "Workgroup (storage memory)", coWWStorageWorkgroup, coWWWorkgroupResults, pageState, oneThreadKeys, coherenceOverrides)
  ];
  const coWWJsx = <SelectorTest key="coww" testName={cowwName} tests={cowwTests} />;
  let cowrName = "CoWR";
  let cowrTests = [
    buildTest(cowrName, "Default", coWR, coWRResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(cowrName, "Workgroup (workgroup memory)", coWRWorkgroup, coWRWorkgroupResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(cowrName, "Workgroup (storage memory)", coWRStorageWorkgroup, coWRWorkgroupResults, pageState, defaultKeys, coherenceOverrides)
  ];
  const coWRJsx = <SelectorTest key="cowr" testName={cowrName} tests={cowrTests} />;
  let corw1Name = "CoRW1";
  let corw1Tests = [
    buildTest(corw1Name, "Default", coRW1, coRW1Results, pageState, oneThreadKeys, coherenceOverrides),
    buildTest(corw1Name, "Workgroup (workgroup memory)", coRW1Workgroup, coRW1WorkgroupResults, pageState, oneThreadKeys, coherenceOverrides),
    buildTest(corw1Name, "Workgroup (storage memory)", coRW1StorageWorkgroup, coRW1WorkgroupResults, pageState, oneThreadKeys, coherenceOverrides)
  ];
  const coRW1Jsx = <SelectorTest key="corw1" testName={corw1Name} tests={corw1Tests} />;
  let corw2Name = "CoRW2";
  let corw2Tests = [
    buildTest(corw2Name, "Default", coRW2, coRW2Results, pageState, defaultKeys, coherenceOverrides),
    buildTest(corw2Name, "Workgroup (workgroup memory)", coRW2, coRW2WorkgroupResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(corw2Name, "Workgroup (storage memory)", coRW2, coRW2WorkgroupResults, pageState, defaultKeys, coherenceOverrides)
  ];
  const coRW2Jsx = <SelectorTest key="corw2" testName={corw2Name} tests={corw2Tests} />;
  let coherenceJsx = [coRRJsx, coWWJsx, coWRJsx, coRW1Jsx, coRW2Jsx];

  // Atomicity
  let atomName = "Atomicity";
  let atomKeys = ["seq0", "seq1", "weak"];
  let atomicityTests = [
    buildTest(atomName, "Default", atom, atomResults, pageState, atomKeys),
    buildTest(atomName, "Workgroup (workgroup memory)", atomWorkgroup, atomWorkgroupResults, pageState, atomKeys),
    buildTest(atomName, "Workgroup (storage memory)", atomStorageWorkgroup, atomWorkgroupResults, pageState, atomKeys)
  ];
  const atomicityJsx = [<SelectorTest key="atom" testName={atomName} tests={atomicityTests} />];

  // Barrier
  let barrierSLName = "Barrier Store Load";
  let barrierSLTests = [
    buildTest(barrierSLName, "Workgroup memory", barrierSLWorkgroup, barrierSLResults, pageState, oneThreadKeys),
    buildTest(barrierSLName, "Storage memory", barrierSLStorageWorkgroup, barrierSLResults, pageState, oneThreadKeys)
  ];
  const barrierSLJsx = <SelectorTest key="barriersl" testName={barrierSLName} tests={barrierSLTests} />;
  let barrierLSName = "Barrier Load Store";
  let barrierLSTests = [
    buildTest(barrierLSName, "Workgroup memory", barrierLSWorkgroup, barrierLSResults, pageState, oneThreadKeys),
    buildTest(barrierLSName, "Storage memory", barrierLSStorageWorkgroup, barrierLSResults, pageState, oneThreadKeys)
  ];
  const barrierLSJsx = <SelectorTest key="barrierls" testName={barrierLSName} tests={barrierLSTests} />;
  let barrierSSName = "Barrier Store Store";
  let barrierSSTests = [
    buildTest(barrierSSName, "Workgroup memory", barrierSSWorkgroup, barrierSSResults, pageState, oneThreadKeys),
    buildTest(barrierSSName, "Storage memory", barrierSSStorageWorkgroup, barrierSSResults, pageState, oneThreadKeys)
  ];
  const barrierSSJsx = <SelectorTest key="barrierss" testName={barrierSSName} tests={barrierSSTests} />;
  const barrierJsx = [barrierSLJsx, barrierLSJsx, barrierSSJsx];

  let tests = [...mpTests, ...storeTests, ...readTests, ...lbTests, ...sbTests, ...twoPlusTwoWriteTests,
  ...corrTests, ...cowwTests, ...cowrTests, ...corw1Tests, ...corw2Tests, ...atomicityTests,
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
                      mpTests[4].setIsChecked(true);
                      storeTests[0].setIsChecked(true);
                      storeTests[2].setIsChecked(true);
                      storeTests[4].setIsChecked(true);
                      readTests[0].setIsChecked(true);
                      readTests[1].setIsChecked(true);
                      readTests[2].setIsChecked(true);
                      lbTests[0].setIsChecked(true);
                      lbTests[2].setIsChecked(true);
                      lbTests[4].setIsChecked(true);
                      sbTests[0].setIsChecked(true);
                      sbTests[1].setIsChecked(true);
                      sbTests[2].setIsChecked(true);
                      twoPlusTwoWriteTests[0].setIsChecked(true);
                      twoPlusTwoWriteTests[1].setIsChecked(true);
                      twoPlusTwoWriteTests[2].setIsChecked(true);
                    }} disabled={pageState.running.value}>
                      Weak Memory Comprehensive
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      corrTests.map(test => test.setIsChecked(true));
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
      permuteFirst: testParams.permuteFirst,
      permuteSecond: testParams.permuteSecond,
      aliasedMemory: testParams.aliasedMemory
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
      await runLitmusTest(curTest.shader, curTest.resultShader, newParams, pageState.iterations.value, handleResult(curTest, pageState));
      pageState.totalTime.internalState = pageState.totalTime.internalState + reportTime();
      pageState.totalTime.update(pageState.totalTime.internalState);
      pageState.completedTests.internalState = pageState.completedTests.internalState + 1;
      pageState.completedTests.update(pageState.completedTests.internalState);
      if (curTest.state.weak != 0) {
        pageState.logSum.internalState += Math.log(curTest.state.weak + 1);
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
