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
import readRMWBarrier from '../shaders/read/read-rmw-barrier.wgsl'
import readWorkgroupRMWBarrier from '../shaders/read/read-workgroup-rmw-barrier.wgsl'
import readStorageWorkgroupRMWBarrier from '../shaders/read/read-storage-workgroup-rmw-barrier.wgsl'
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
import storeBufferRMWBarrier from '../shaders/sb/store-buffer-rmw-barrier.wgsl'
import storeBufferWorkgroupRMWBarrier from '../shaders/sb/store-buffer-workgroup-rmw-barrier.wgsl'
import storeBufferStorageWorkgroupRMWBarrier from '../shaders/sb/store-buffer-storage-workgroup-rmw-barrier.wgsl'
import storeBufferResults from '../shaders/sb/store-buffer-results.wgsl'
import storeBufferWorkgroupResults from '../shaders/sb/store-buffer-workgroup-results.wgsl'
import twoPlusTwoWrite from '../shaders/2+2w/2+2-write.wgsl'
import twoPlusTwoWriteWorkgroup from '../shaders/2+2w/2+2-write-workgroup.wgsl'
import twoPlusTwoWriteStorageWorkgroup from '../shaders/2+2w/2+2-write-storage-workgroup.wgsl'
import twoPlusTwoWriteRMWBarrier from '../shaders/2+2w/2+2-write-rmw-barrier.wgsl'
import twoPlusTwoWriteWorkgroupRMWBarrier from '../shaders/2+2w/2+2-write-workgroup-rmw-barrier.wgsl'
import twoPlusTwoWriteStorageWorkgroupRMWBarrier from '../shaders/2+2w/2+2-write-storage-workgroup-rmw-barrier.wgsl'
import twoPlusTwoWriteResults from '../shaders/2+2w/2+2-write-results.wgsl'
import twoPlusTwoWriteWorkgroupResults from '../shaders/2+2w/2+2-write-workgroup-results.wgsl'
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
import coRW2RMW from '../shaders/corw2/corw2.wgsl'
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
import rrMutation from '../shaders/evaluation/rr-mutation.wgsl';
import rrRMWMutation from '../shaders/evaluation/rr-rmw-mutation.wgsl';
import rrRMW1Mutation from '../shaders/evaluation/rr-rmw1-mutation.wgsl';
import rrRMW2Mutation from '../shaders/evaluation/rr-rmw2-mutation.wgsl';
import rrResults from '../shaders/evaluation/rr-results.wgsl';
import rwMutation from '../shaders/evaluation/rw-mutation.wgsl';
import rwRMWMutation from '../shaders/evaluation/rw-rmw-mutation.wgsl';
import rwResults from '../shaders/evaluation/rw-results.wgsl';
import wrMutation from '../shaders/evaluation/wr-mutation.wgsl';
import wrRMWMutation from '../shaders/evaluation/wr-rmw-mutation.wgsl';
import wrResults from '../shaders/evaluation/wr-results.wgsl';
import wwMutation from '../shaders/evaluation/ww-mutation.wgsl';
import wwRMWMutation from '../shaders/evaluation/ww-rmw-mutation.wgsl';
import wwRMW1Mutation from '../shaders/evaluation/ww-rmw1-mutation.wgsl';
import wwRMW2Mutation from '../shaders/evaluation/ww-rmw2-mutation.wgsl';
import wwRMW3Mutation from '../shaders/evaluation/ww-rmw3-mutation.wgsl';
import wwRMW4Mutation from '../shaders/evaluation/ww-rmw4-mutation.wgsl';
import wwRMW5Mutation from '../shaders/evaluation/ww-rmw5-mutation.wgsl';
import wwRMW6Mutation from '../shaders/evaluation/ww-rmw6-mutation.wgsl';
import wwResults from '../shaders/evaluation/ww-results.wgsl';
import messagePassingBarrier1 from '../shaders/mp/message-passing-barrier1.wgsl'
import messagePassingBarrier2 from '../shaders/mp/message-passing-barrier2.wgsl'
import storeBarrier1 from '../shaders/store/store-barrier1.wgsl'
import storeBarrier2 from '../shaders/store/store-barrier2.wgsl'
import readRMW from '../shaders/read/read-rmw.wgsl';
import readRMWBarrier1 from '../shaders/read/read-rmw-barrier1.wgsl';
import readRMWBarrier2 from '../shaders/read/read-rmw-barrier2.wgsl';
import loadBufferBarrier1 from '../shaders/lb/load-buffer-barrier1.wgsl';
import loadBufferBarrier2 from '../shaders/lb/load-buffer-barrier2.wgsl';
import storeBufferRMW from '../shaders/sb/store-buffer-rmw.wgsl';
import storeBufferRMWBarrier1 from '../shaders/sb/store-buffer-rmw-barrier1.wgsl';
import storeBufferRMWBarrier2 from '../shaders/sb/store-buffer-rmw-barrier2.wgsl';
import twoPlusTwoWriteRMW from '../shaders/2+2w/2+2-write-rmw.wgsl';
import twoPlusTwoWriteRMWBarrier1 from '../shaders/2+2w/2+2-write-rmw-barrier1.wgsl';
import twoPlusTwoWriteRMWBarrier2 from '../shaders/2+2w/2+2-write-rmw-barrier2.wgsl';


import { filteredParams } from '../components/tuningTable.js';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const defaultKeys = ["seq0", "seq1", "interleaved", "weak"];
const oneThreadKeys = ["seq", "weak"];
const mutationTestKeys = ["nonWeak", "weak"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(100);
  const [randomSeed, setRandomSeed] = useState("");
  const [smoothedParameters, setSmoothedParameters] = useState(true);
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
    smoothedParameters: {
      value: smoothedParameters,
      update: setSmoothedParameters
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
      weak: 0,
      durationSeconds: 0
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
      if (test.keys[i].includes("seq") || test.keys[i] == "nonWeak") {
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

function getRunStats(activeTests, params) {
  let stats = {};
  for (const test of activeTests) {
    stats[test.testName + " " + test.testVariant] = JSON.parse(JSON.stringify(test.state));
  }
  stats["params"] = JSON.parse(filteredParams(params));
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
        <RunStatistics stats={props.stats} />
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
    buildTest(mpName, "Barrier Variant 1", messagePassingBarrier1, messagePassingResults, pageState, defaultKeys),
    buildTest(mpName, "Barrier Variant 2", messagePassingBarrier2, messagePassingResults, pageState, defaultKeys),
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
    buildTest(storeName, "Barrier Variant 1", storeBarrier1, storeResults, pageState, defaultKeys),
    buildTest(storeName, "Barrier Variant 2", storeBarrier2, storeResults, pageState, defaultKeys),
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
    buildTest(readName, "RMW", readRMW, readResults, pageState, defaultKeys),
    buildTest(readName, "RMW Barrier", readRMWBarrier, readResults, pageState, defaultKeys),
    buildTest(readName, "RMW Barrier 1", readRMWBarrier1, readResults, pageState, defaultKeys),
    buildTest(readName, "RMW Barrier 2", readRMWBarrier2, readResults, pageState, defaultKeys),
    buildTest(readName, "RMW Barrier Workgroup (workgroup memory)", readWorkgroupRMWBarrier, readWorkgroupResults, pageState, defaultKeys),
    buildTest(readName, "RMW Barrier Workgroup (storage memory)", readStorageWorkgroupRMWBarrier, readWorkgroupResults, pageState, defaultKeys)
  ];
  const readJsx = <SelectorTest key="read" testName={readName} tests={readTests} />;
  let lbName = "Load Buffer";
  let lbTests = [
    buildTest(lbName, "Default", loadBuffer, loadBufferResults, pageState, defaultKeys),
    buildTest(lbName, "Barrier Variant", barrierLoadBuffer, loadBufferResults, pageState, defaultKeys),
    buildTest(lbName, "Barrier Variant 1", loadBufferBarrier1, loadBufferResults, pageState, defaultKeys),
    buildTest(lbName, "Barrier Variant 2", loadBufferBarrier2, loadBufferResults, pageState, defaultKeys),
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
    buildTest(sbName, "Workgroup (storage memory)", storeBufferStorageWorkgroup, storeBufferWorkgroupResults, pageState, defaultKeys),
    buildTest(sbName, "RMW", storeBufferRMW, storeBufferResults, pageState, defaultKeys),
    buildTest(sbName, "RMW Barrier", storeBufferRMWBarrier, storeBufferResults, pageState, defaultKeys),
    buildTest(sbName, "RMW Barrier 1", storeBufferRMWBarrier1, storeBufferResults, pageState, defaultKeys),
    buildTest(sbName, "RMW Barrier 2", storeBufferRMWBarrier2, storeBufferResults, pageState, defaultKeys),
    buildTest(sbName, "RMW Barrier Workgroup (workgroup memory)", storeBufferWorkgroupRMWBarrier, storeBufferWorkgroupResults, pageState, defaultKeys),
    buildTest(sbName, "RMW Barrier Workgroup (storage memory)", storeBufferStorageWorkgroupRMWBarrier, storeBufferWorkgroupResults, pageState, defaultKeys)
  ];
  const sbJsx = <SelectorTest key="sb" testName={sbName} tests={sbTests} />;
  let tptName = "2+2 Write";
  let twoPlusTwoWriteTests = [
    buildTest(tptName, "Default", twoPlusTwoWrite, twoPlusTwoWriteResults, pageState, defaultKeys),
    buildTest(tptName, "Workgroup (workgroup memory)", twoPlusTwoWriteWorkgroup, twoPlusTwoWriteWorkgroupResults, pageState, defaultKeys),
    buildTest(tptName, "Workgroup (storage memory)", twoPlusTwoWriteStorageWorkgroup, twoPlusTwoWriteWorkgroupResults, pageState, defaultKeys),
    buildTest(tptName, "RMW", twoPlusTwoWriteRMW, twoPlusTwoWriteResults, pageState, defaultKeys),
    buildTest(tptName, "RMW Barrier", twoPlusTwoWriteRMWBarrier, twoPlusTwoWriteResults, pageState, defaultKeys),
    buildTest(tptName, "RMW Barrier 1", twoPlusTwoWriteRMWBarrier1, twoPlusTwoWriteResults, pageState, defaultKeys),
    buildTest(tptName, "RMW Barrier 2", twoPlusTwoWriteRMWBarrier2, twoPlusTwoWriteResults, pageState, defaultKeys),
    buildTest(tptName, "RMW Barrier Workgroup (workgroup memory)", twoPlusTwoWriteWorkgroupRMWBarrier, twoPlusTwoWriteWorkgroupResults, pageState, defaultKeys),
    buildTest(tptName, "RMW Barrier Workgroup (storage memory)", twoPlusTwoWriteStorageWorkgroupRMWBarrier, twoPlusTwoWriteWorkgroupResults, pageState, defaultKeys)
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
    buildTest(corrName, "RMW", coRRRMW, coRRResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(corrName, "Workgroup (workgroup memory)", coRRWorkgroup, coRRWorkgroupResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(corrName, "Workgroup (storage memory)", coRRStorageWorkgroup, coRRWorkgroupResults, pageState, defaultKeys, coherenceOverrides)
  ];
  const coRRJsx = <SelectorTest key="corr" testName={corrName} tests={corrTests} />;
  let cowwName = "CoWW";
  let cowwTests = [
    buildTest(cowwName, "Default", coWW, coWWResults, pageState, oneThreadKeys, coherenceOverrides),
    buildTest(cowwName, "RMW", coWWRMW, coWWResults, pageState, oneThreadKeys, coherenceOverrides),
    buildTest(cowwName, "Workgroup (workgroup memory)", coWWWorkgroup, coWWWorkgroupResults, pageState, oneThreadKeys, coherenceOverrides),
    buildTest(cowwName, "Workgroup (storage memory)", coWWStorageWorkgroup, coWWWorkgroupResults, pageState, oneThreadKeys, coherenceOverrides)
  ];
  const coWWJsx = <SelectorTest key="coww" testName={cowwName} tests={cowwTests} />;
  let cowrName = "CoWR";
  let cowrTests = [
    buildTest(cowrName, "Default", coWR, coWRResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(cowrName, "RMW", coWRRMW, coWRResults, pageState, defaultKeys, coherenceOverrides),
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
    buildTest(corw2Name, "RMW", coRW2RMW, coRW2Results, pageState, defaultKeys, coherenceOverrides),
    buildTest(corw2Name, "Workgroup (workgroup memory)", coRW2Workgroup, coRW2WorkgroupResults, pageState, defaultKeys, coherenceOverrides),
    buildTest(corw2Name, "Workgroup (storage memory)", coRW2StorageWorkgroup, coRW2WorkgroupResults, pageState, defaultKeys, coherenceOverrides)
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

  // Mutation Tests
  let rrName = "RR Mutations";
  let rrTests = [
    buildTest(rrName, "Default", rrMutation, rrResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rrName, "RMW", rrRMWMutation, rrResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rrName, "RMW1", rrRMW1Mutation, rrResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rrName, "RMW2", rrRMW2Mutation, rrResults, pageState, mutationTestKeys, coherenceOverrides)
  ];
  const rrJsx = <SelectorTest key="rr" testName={rrName} tests={rrTests} />;
  let rwName = "RW Mutations";
  let rwTests = [
    buildTest(rwName, "Default", rwMutation, rwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rwName, "RMW", rwRMWMutation, rwResults, pageState, mutationTestKeys, coherenceOverrides)
  ];
  const rwJsx = <SelectorTest key="rw" testName={rwName} tests={rwTests} />;
  let wrName = "WR Mutations";
  let wrTests = [
    buildTest(wrName, "Default", wrMutation, wrResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wrName, "RMW", wrRMWMutation, wrResults, pageState, mutationTestKeys, coherenceOverrides)
  ];
  const wrJsx = <SelectorTest key="wr" testName={wrName} tests={wrTests} />;
  let wwName = "WW Mutations";
  let wwTests = [
    buildTest(wwName, "Default", wwMutation, wwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "RMW", wwRMWMutation, wwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "RMW 1", wwRMW1Mutation, wwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "RMW 2", wwRMW2Mutation, wwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "RMW 3", wwRMW3Mutation, wwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "RMW 4", wwRMW4Mutation, wwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "RMW 5", wwRMW5Mutation, wwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "RMW 6", wwRMW6Mutation, wwResults, pageState, mutationTestKeys, coherenceOverrides)
  ];
  const wwJsx = <SelectorTest key="ww" testName={wwName} tests={wwTests} />;
  const mutationJsx = [rrJsx, rwJsx, wrJsx, wwJsx];


  let tests = [...mpTests, ...storeTests, ...readTests, ...lbTests, ...sbTests, ...twoPlusTwoWriteTests,
  ...corrTests, ...cowwTests, ...cowrTests, ...corw1Tests, ...corw2Tests, ...atomicityTests,
  ...barrierSLTests, ...barrierLSTests, ...barrierSSTests, ...rrTests, ...rwTests, ...wrTests, ...wwTests];
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
                <SelectorCategory category="Mutation Tests" tests={mutationJsx} />
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
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      mpTests[0].setIsChecked(true);
                      storeTests[0].setIsChecked(true);
                      readTests[0].setIsChecked(true);
                      readTests[3].setIsChecked(true);
                      lbTests[0].setIsChecked(true);
                      sbTests[0].setIsChecked(true);
                      sbTests[3].setIsChecked(true);
                      twoPlusTwoWriteTests[0].setIsChecked(true);
                      twoPlusTwoWriteTests[3].setIsChecked(true);
                      rrTests[0].setIsChecked(true);
                      rrTests[1].setIsChecked(true);
                      rwTests[0].setIsChecked(true);
                      rwTests[1].setIsChecked(true);
                      wrTests[0].setIsChecked(true);
                      wrTests[1].setIsChecked(true);
                      wwTests[0].setIsChecked(true);
                      wwTests[1].setIsChecked(true);
                    }} disabled={pageState.running.value}>
                      Evaluation Minimal
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
                      readTests[3].setIsChecked(true);
                      readTests[5].setIsChecked(true);
                      readTests[6].setIsChecked(true);
                      lbTests[0].setIsChecked(true);
                      lbTests[2].setIsChecked(true);
                      lbTests[3].setIsChecked(true);
                      sbTests[0].setIsChecked(true);
                      sbTests[3].setIsChecked(true);
                      sbTests[5].setIsChecked(true);
                      sbTests[6].setIsChecked(true);
                      twoPlusTwoWriteTests[0].setIsChecked(true);
                      twoPlusTwoWriteTests[3].setIsChecked(true);
                      twoPlusTwoWriteTests[5].setIsChecked(true);
                      twoPlusTwoWriteTests[6].setIsChecked(true);
                      rrTests.map(test => test.setIsChecked(true));
                      rwTests.map(test => test.setIsChecked(true));
                      wrTests.map(test => test.setIsChecked(true));
                      wwTests.map(test => test.setIsChecked(true));
                    }} disabled={pageState.running.value}>
                      Evaluation All
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
      ...randomConfig(generator, pageState.smoothedParameters.value),
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
      curTest.state.durationSeconds = 0;
      let newParams = JSON.parse(JSON.stringify(params));
      for (const key in curTest.testParamOverrides) {
        newParams[key] = curTest.testParamOverrides[key];
      }
      await runLitmusTest(curTest.shader, curTest.resultShader, newParams, pageState.iterations.value, handleResult(curTest, pageState));
      pageState.totalTime.internalState = pageState.totalTime.internalState + reportTime();
      curTest.state.durationSeconds = reportTime();
      pageState.totalTime.update(pageState.totalTime.internalState);
      pageState.completedTests.internalState = pageState.completedTests.internalState + 1;
      pageState.completedTests.update(pageState.completedTests.internalState);
      if (curTest.state.weak != 0) {
        pageState.logSum.internalState += Math.log(curTest.state.weak + 1);
        pageState.logSum.update(pageState.logSum.internalState);
      }
    }
    let stats = getRunStats(pageState.activeTests, params);
    let row = <StaticRow pageState={pageState} key={params.id} stats={stats} />;
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
  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section">
            <h1 className="testName">Tuning Suite</h1>
            <p>
              The tuning suite is used to tune over user selected tests. Several test presets are included, allowing users to quickly tune over different categories of tests. By default, a new random seed is generated for each tuning run, but by inputting a chosen random seed, parameter combinations can be kept constant across different runs. A random seed can be any string. For example, "webgpu" (without quotation marks) is a valid random seed.
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
        <div className="column">
          <div className='control'>
            <label className="checkbox"><b>Smoothed Parameters:</b></label>
            <div>
              <input type="checkbox" checked={pageState.smoothedParameters.value} onChange={(e) => {
                pageState.smoothedParameters.update(!pageState.smoothedParameters.value);
              }} disabled={pageState.running.value} />
                <b>Enabled</b>
            </div>
          </div>
        </div>
      </div>
      <div>
        <label><b>All Runs:</b></label>
        <RunStatistics stats={pageState.allStats.visibleState} />
      </div>
      <div className="table-container">
        <table className="table is-hoverable">
          <thead>
            <tr>
              <th>Run number</th>
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
