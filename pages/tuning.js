import { useState } from 'react';
import * as seedrandom from 'seedrandom';
import { buildThrottle, randomConfig } from '../components/test-page-utils.js';
import { reportTime, getCurrentIteration, runLitmusTest } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'
import messagePassing from '../shaders/mp/message-passing.wgsl'
import messagePassingCoherency from '../shaders/mp/message-passing-coherency.wgsl'
import barrierMessagePassing from '../shaders/mp/message-passing-barrier.wgsl'
import workgroupMessagePassing from '../shaders/mp/message-passing-workgroup.wgsl';
import storageWorkgroupMessagePassing from '../shaders/mp/message-passing-storage-workgroup.wgsl';
import barrierWorkgroupMessagePassing from '../shaders/mp/message-passing-workgroup-barrier.wgsl';
import barrierStorageWorkgroupMessagePassing from '../shaders/mp/message-passing-storage-workgroup-barrier.wgsl';
import messagePassingResults from '../shaders/mp/message-passing-results.wgsl';
import messagePassingCoherencyResults from '../shaders/mp/message-passing-coherency-results.wgsl';
import store from '../shaders/store/store.wgsl'
import storeCoherency from '../shaders/store/store-coherency.wgsl'
import barrierStore from '../shaders/store/store-barrier.wgsl'
import workgroupStore from '../shaders/store/store-workgroup.wgsl'
import storageWorkgroupStore from '../shaders/store/store-storage-workgroup.wgsl'
import barrierWorkgroupStore from '../shaders/store/store-workgroup-barrier.wgsl'
import barrierStorageWorkgroupStore from '../shaders/store/store-storage-workgroup-barrier.wgsl'
import storeResults from '../shaders/store/store-results.wgsl';
import storeCoherencyResults from '../shaders/store/store-coherency-results.wgsl';
import storeWorkgroupResults from '../shaders/store/store-workgroup-results.wgsl';
import read from '../shaders/read/read.wgsl'
import readCoherency from '../shaders/read/read-coherency.wgsl'
import readWorkgroup from '../shaders/read/read-workgroup.wgsl'
import readStorageWorkgroup from '../shaders/read/read-storage-workgroup.wgsl'
import readRMWBarrier from '../shaders/read/read-rmw-barrier.wgsl'
import readWorkgroupRMWBarrier from '../shaders/read/read-workgroup-rmw-barrier.wgsl'
import readStorageWorkgroupRMWBarrier from '../shaders/read/read-storage-workgroup-rmw-barrier.wgsl'
import readResults from '../shaders/read/read-results.wgsl'
import readCoherencyResults from '../shaders/read/read-coherency-results.wgsl'
import readWorkgroupResults from '../shaders/read/read-workgroup-results.wgsl'
import loadBuffer from '../shaders/lb/load-buffer.wgsl'
import loadBufferCoherency from '../shaders/lb/load-buffer-coherency.wgsl'
import barrierLoadBuffer from '../shaders/lb/load-buffer-barrier.wgsl'
import workgroupLoadBuffer from '../shaders/lb/load-buffer-workgroup.wgsl';
import storageWorkgroupLoadBuffer from '../shaders/lb/load-buffer-storage-workgroup.wgsl';
import barrierWorkgroupLoadBuffer from '../shaders/lb/load-buffer-workgroup-barrier.wgsl';
import barrierStorageWorkgroupLoadBuffer from '../shaders/lb/load-buffer-storage-workgroup-barrier.wgsl';
import loadBufferResults from '../shaders/lb/load-buffer-results.wgsl';
import loadBufferCoherencyResults from '../shaders/lb/load-buffer-coherency-results.wgsl';
import loadBufferWorkgroupResults from '../shaders/lb/load-buffer-workgroup-results.wgsl';
import storeBuffer from '../shaders/sb/store-buffer.wgsl'
import storeBufferCoherency from '../shaders/sb/store-buffer-coherency.wgsl'
import storeBufferWorkgroup from '../shaders/sb/store-buffer-workgroup.wgsl'
import storeBufferStorageWorkgroup from '../shaders/sb/store-buffer-storage-workgroup.wgsl'
import storeBufferRMWBarrier from '../shaders/sb/store-buffer-rmw-barrier.wgsl'
import storeBufferWorkgroupRMWBarrier from '../shaders/sb/store-buffer-workgroup-rmw-barrier.wgsl'
import storeBufferStorageWorkgroupRMWBarrier from '../shaders/sb/store-buffer-storage-workgroup-rmw-barrier.wgsl'
import storeBufferResults from '../shaders/sb/store-buffer-results.wgsl'
import storeBufferCoherencyResults from '../shaders/sb/store-buffer-coherency-results.wgsl'
import storeBufferWorkgroupResults from '../shaders/sb/store-buffer-workgroup-results.wgsl'
import twoPlusTwoWrite from '../shaders/2+2w/2+2-write.wgsl'
import twoPlusTwoWriteCoherency from '../shaders/2+2w/2+2-write-coherency.wgsl'
import twoPlusTwoWriteWorkgroup from '../shaders/2+2w/2+2-write-workgroup.wgsl'
import twoPlusTwoWriteStorageWorkgroup from '../shaders/2+2w/2+2-write-storage-workgroup.wgsl'
import twoPlusTwoWriteRMWBarrier from '../shaders/2+2w/2+2-write-rmw-barrier.wgsl'
import twoPlusTwoWriteWorkgroupRMWBarrier from '../shaders/2+2w/2+2-write-workgroup-rmw-barrier.wgsl'
import twoPlusTwoWriteStorageWorkgroupRMWBarrier from '../shaders/2+2w/2+2-write-storage-workgroup-rmw-barrier.wgsl'
import twoPlusTwoWriteResults from '../shaders/2+2w/2+2-write-results.wgsl'
import twoPlusTwoWriteCoherencyResults from '../shaders/2+2w/2+2-write-coherency-results.wgsl'
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
import rrMutationSingle from '../shaders/evaluation/rr-mutation-single.wgsl';
import rrRMWMutation from '../shaders/evaluation/rr-rmw-mutation.wgsl';
import rrRMWMutationSingle from '../shaders/evaluation/rr-rmw-mutation-single.wgsl';
import rrRMW1Mutation from '../shaders/evaluation/rr-rmw1-mutation.wgsl';
import rrRMW2Mutation from '../shaders/evaluation/rr-rmw2-mutation.wgsl';
import rrResults from '../shaders/evaluation/rr-results.wgsl';
import rrResultsSingle from '../shaders/evaluation/rr-results-single.wgsl';
import rwMutation from '../shaders/evaluation/rw-mutation.wgsl';
import rwMutationSingle from '../shaders/evaluation/rw-mutation-single.wgsl';
import rwRMWMutation from '../shaders/evaluation/rw-rmw-mutation.wgsl';
import rwRMWMutationSingle from '../shaders/evaluation/rw-rmw-mutation-single.wgsl';
import rwResults from '../shaders/evaluation/rw-results.wgsl';
import rwResultsSingle from '../shaders/evaluation/rw-results-single.wgsl';
import wrMutation from '../shaders/evaluation/wr-mutation.wgsl';
import wrMutationSingle from '../shaders/evaluation/wr-mutation-single.wgsl';
import wrRMWMutation from '../shaders/evaluation/wr-rmw-mutation.wgsl';
import wrRMWMutationSingle from '../shaders/evaluation/wr-rmw-mutation-single.wgsl';
import wrResults from '../shaders/evaluation/wr-results.wgsl';
import wrResultsSingle from '../shaders/evaluation/wr-results-single.wgsl';
import wwMutation from '../shaders/evaluation/ww-mutation.wgsl';
import wwMutationSingle from '../shaders/evaluation/ww-mutation-single.wgsl';
import wwRMWMutation from '../shaders/evaluation/ww-rmw-mutation.wgsl';
import wwRMWMutationSingle from '../shaders/evaluation/ww-rmw-mutation-single.wgsl';
import wwRMW1Mutation from '../shaders/evaluation/ww-rmw1-mutation.wgsl';
import wwRMW2Mutation from '../shaders/evaluation/ww-rmw2-mutation.wgsl';
import wwRMW3Mutation from '../shaders/evaluation/ww-rmw3-mutation.wgsl';
import wwRMW4Mutation from '../shaders/evaluation/ww-rmw4-mutation.wgsl';
import wwRMW5Mutation from '../shaders/evaluation/ww-rmw5-mutation.wgsl';
import wwRMW6Mutation from '../shaders/evaluation/ww-rmw6-mutation.wgsl';
import wwResults from '../shaders/evaluation/ww-results.wgsl';
import wwResultsSingle from '../shaders/evaluation/ww-results-single.wgsl';
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
import messagePassingSingle from '../shaders/mp/message-passing-single.wgsl';
import messagePassingSingleBarrier1 from '../shaders/mp/message-passing-single-barrier1.wgsl';
import messagePassingSingleBarrier2 from '../shaders/mp/message-passing-single-barrier2.wgsl';
import messagePassingCoherencySingle from '../shaders/mp/message-passing-coherency-single.wgsl';
import messagePassingSingleResults from '../shaders/mp/message-passing-results-single.wgsl';
import messagePassingCoherencySingleResults from '../shaders/mp/message-passing-coherency-results-single.wgsl';
import storeSingle from '../shaders/store/store-single.wgsl';
import storeSingleBarrier1 from '../shaders/store/store-single-barrier1.wgsl';
import storeSingleBarrier2 from '../shaders/store/store-single-barrier2.wgsl';
import storeCoherencySingle from '../shaders/store/store-coherency-single.wgsl';
import storeSingleResults from '../shaders/store/store-results-single.wgsl';
import storeCoherencySingleResults from '../shaders/store/store-coherency-results-single.wgsl';
import readSingle from '../shaders/read/read-single.wgsl';
import readRMWSingle from '../shaders/read/read-rmw-single.wgsl';
import readRMWSingleBarrier1 from '../shaders/read/read-rmw-single-barrier1.wgsl';
import readRMWSingleBarrier2 from '../shaders/read/read-rmw-single-barrier2.wgsl';
import readCoherencySingle from '../shaders/read/read-coherency-single.wgsl';
import readSingleResults from '../shaders/read/read-results-single.wgsl';
import readCoherencySingleResults from '../shaders/read/read-coherency-results-single.wgsl';
import loadBufferSingle from '../shaders/lb/load-buffer-single.wgsl';
import loadBufferSingleBarrier1 from '../shaders/lb/load-buffer-single-barrier1.wgsl';
import loadBufferSingleBarrier2 from '../shaders/lb/load-buffer-single-barrier2.wgsl';
import loadBufferCoherencySingle from '../shaders/lb/load-buffer-coherency-single.wgsl';
import loadBufferSingleResults from '../shaders/lb/load-buffer-results-single.wgsl';
import loadBufferCoherencySingleResults from '../shaders/lb/load-buffer-coherency-results-single.wgsl';
import storeBufferSingle from '../shaders/sb/store-buffer-single.wgsl';
import storeBufferRMWSingle from '../shaders/sb/store-buffer-rmw-single.wgsl';
import storeBufferRMWSingleBarrier1 from '../shaders/sb/store-buffer-rmw-single-barrier1.wgsl';
import storeBufferRMWSingleBarrier2 from '../shaders/sb/store-buffer-rmw-single-barrier2.wgsl';
import storeBufferCoherencySingle from '../shaders/sb/store-buffer-coherency-single.wgsl';
import storeBufferSingleResults from '../shaders/sb/store-buffer-results-single.wgsl';
import storeBufferCoherencySingleResults from '../shaders/sb/store-buffer-coherency-results-single.wgsl';
import twoPlusTwoWriteSingle from '../shaders/2+2w/2+2-write-single.wgsl';
import twoPlusTwoWriteRMWSingle from '../shaders/2+2w/2+2-write-rmw-single.wgsl';
import twoPlusTwoWriteRMWSingleBarrier1 from '../shaders/2+2w/2+2-write-rmw-single-barrier1.wgsl';
import twoPlusTwoWriteRMWSingleBarrier2 from '../shaders/2+2w/2+2-write-rmw-single-barrier2.wgsl';
import twoPlusTwoWriteCoherencySingle from '../shaders/2+2w/2+2-write-coherency-single.wgsl';
import twoPlusTwoWriteSingleResults from '../shaders/2+2w/2+2-write-results-single.wgsl';
import twoPlusTwoWriteCoherencySingleResults from '../shaders/2+2w/2+2-write-coherency-results-single.wgsl';

import { filteredParams } from '../components/tuningTable.js';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const defaultKeys = ["seq0", "seq1", "interleaved", "weak"];
const oneThreadKeys = ["seq", "weak"];
const mutationTestKeys = ["nonWeak", "weak"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(100);
  const [randomSeed, setRandomSeed] = useState("");
  const [smoothedParameters, setSmoothedParameters] = useState(false);
  const [maxWorkgroups, setMaxWorkgroups] = useState(1024);
  const [tuningOverrides, setTuningOverrides] = useState({});
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
    maxWorkgroups: {
      value: maxWorkgroups,
      update: setMaxWorkgroups
    },
    tuningOverrides: {
      value: tuningOverrides,
      update: setTuningOverrides
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

function paramsInputOnChange(pageState) {
  return function onChange(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function (event) {
      let config = JSON.parse(event.target.result);
      pageState.tuningOverrides.update(config);
    };
    reader.readAsText(file);
    e.target.value = null;
  }
}

function TuningOverrides(props) {
  return (
    <>
      <div className="file is-primary">
        <label className="file-label" data-tip="A JSON file with the same structure and parameters as the 'params' field when downloading tuning results.">
          <input className="file-input" type="file" name="params" onChange={paramsInputOnChange(props.pageState)} />
          <span className="file-cta">
            <span className="file-label">
              Upload
            </span>
          </span>
        </label>
      </div>
    </>
  )
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
// Coherence tests
const coherenceOverrides = {
  aliasedMemory: true,
  permuteSecond: 1
};

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
    buildTest(mpName, "Barrier Workgroup (storage memory)", barrierStorageWorkgroupMessagePassing, messagePassingResults, pageState, defaultKeys),
    buildTest(mpName, "Coherency", messagePassingCoherency, messagePassingCoherencyResults, pageState, defaultKeys),
    buildTest(mpName, "Single Instance", messagePassingSingle, messagePassingSingleResults, pageState, defaultKeys),
    buildTest(mpName, "Single Instance Barrier 1", messagePassingSingleBarrier1, messagePassingSingleResults, pageState, defaultKeys),
    buildTest(mpName, "Single Instance Barrier 2", messagePassingSingleBarrier2, messagePassingSingleResults, pageState, defaultKeys),
    buildTest(mpName, "Single Instance Coherency", messagePassingCoherencySingle, messagePassingCoherencySingleResults, pageState, defaultKeys),
    buildTest(mpName, "Coherency One-Loc", messagePassingCoherency, messagePassingCoherencyResults, pageState, defaultKeys, coherenceOverrides),
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
    buildTest(storeName, "Barrier Workgroup (storage memory)", barrierStorageWorkgroupStore, storeWorkgroupResults, pageState, defaultKeys),
    buildTest(storeName, "Coherency", storeCoherency, storeCoherencyResults, pageState, defaultKeys),
    buildTest(storeName, "Single Instance", storeSingle, storeSingleResults, pageState, defaultKeys),
    buildTest(storeName, "Single Instance Barrier 1", storeSingleBarrier1, storeSingleResults, pageState, defaultKeys),
    buildTest(storeName, "Single Instance Barrier 2", storeSingleBarrier2, storeSingleResults, pageState, defaultKeys),
    buildTest(storeName, "Single Instance Coherency", storeCoherencySingle, storeCoherencySingleResults, pageState, defaultKeys)
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
    buildTest(readName, "RMW Barrier Workgroup (storage memory)", readStorageWorkgroupRMWBarrier, readWorkgroupResults, pageState, defaultKeys),
    buildTest(readName, "Coherency", readCoherency, readCoherencyResults, pageState, defaultKeys),
    buildTest(readName, "Single Instance", readSingle, readSingleResults, pageState, defaultKeys),
    buildTest(readName, "Single Instance RMW", readRMWSingle, readSingleResults, pageState, defaultKeys),
    buildTest(readName, "Single Instance RMW Barrier 1", readRMWSingleBarrier1, readSingleResults, pageState, defaultKeys),
    buildTest(readName, "Single Instance RMW Barrier 2", readRMWSingleBarrier2, readSingleResults, pageState, defaultKeys),
    buildTest(readName, "Single Instance Coherency", readCoherencySingle, readCoherencySingleResults, pageState, defaultKeys)
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
    buildTest(lbName, "Barrier Workgroup (storage memory)", barrierStorageWorkgroupLoadBuffer, loadBufferWorkgroupResults, pageState, defaultKeys),
    buildTest(lbName, "Coherency", loadBufferCoherency, loadBufferCoherencyResults, pageState, defaultKeys),
    buildTest(lbName, "Single Instance", loadBufferSingle, loadBufferSingleResults, pageState, defaultKeys),
    buildTest(lbName, "Single Instance Barrier 1", loadBufferSingleBarrier1, loadBufferSingleResults, pageState, defaultKeys),
    buildTest(lbName, "Single Instance Barrier 2", loadBufferSingleBarrier2, loadBufferSingleResults, pageState, defaultKeys),
    buildTest(lbName, "Single Instance Coherency", loadBufferCoherencySingle, loadBufferCoherencySingleResults, pageState, defaultKeys)
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
    buildTest(sbName, "RMW Barrier Workgroup (storage memory)", storeBufferStorageWorkgroupRMWBarrier, storeBufferWorkgroupResults, pageState, defaultKeys),
    buildTest(sbName, "Coherency", storeBufferCoherency, storeBufferCoherencyResults, pageState, defaultKeys),
    buildTest(sbName, "Single Instance", storeBufferSingle, storeBufferSingleResults, pageState, defaultKeys),
    buildTest(sbName, "Single Instance RMW", storeBufferRMWSingle, storeBufferSingleResults, pageState, defaultKeys),
    buildTest(sbName, "Single Instance RMW Barrier 1", storeBufferRMWSingleBarrier1, storeBufferSingleResults, pageState, defaultKeys),
    buildTest(sbName, "Single Instance RMW Barrier 2", storeBufferRMWSingleBarrier2, storeBufferSingleResults, pageState, defaultKeys),
    buildTest(sbName, "Single Instance Coherency", storeBufferCoherencySingle, storeBufferCoherencySingleResults, pageState, defaultKeys)
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
    buildTest(tptName, "RMW Barrier Workgroup (storage memory)", twoPlusTwoWriteStorageWorkgroupRMWBarrier, twoPlusTwoWriteWorkgroupResults, pageState, defaultKeys),
    buildTest(tptName, "Coherency", twoPlusTwoWriteCoherency, twoPlusTwoWriteCoherencyResults, pageState, defaultKeys),
    buildTest(tptName, "Single Instance", twoPlusTwoWriteSingle, twoPlusTwoWriteSingleResults, pageState, defaultKeys),
    buildTest(tptName, "Single Instance RMW", twoPlusTwoWriteRMWSingle, twoPlusTwoWriteSingleResults, pageState, defaultKeys),
    buildTest(tptName, "Single Instance RMW Barrier 1", twoPlusTwoWriteRMWSingleBarrier1, twoPlusTwoWriteSingleResults, pageState, defaultKeys),
    buildTest(tptName, "Single Instance RMW Barrier 2", twoPlusTwoWriteRMWSingleBarrier2, twoPlusTwoWriteSingleResults, pageState, defaultKeys),
    buildTest(tptName, "Single Instance Coherency", twoPlusTwoWriteCoherencySingle, twoPlusTwoWriteCoherencySingleResults, pageState, defaultKeys)
  ];
  const twoPlusTwoWriteJsx = <SelectorTest key="tpt" testName={tptName} tests={twoPlusTwoWriteTests} />;
  let weakMemoryJsx = [mpJsx, storeJsx, readJsx, lbJsx, sbJsx, twoPlusTwoWriteJsx];


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
    buildTest(rrName, "RMW2", rrRMW2Mutation, rrResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rrName, "Single Instance", rrMutationSingle, rrResultsSingle, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rrName, "Single Instance RMW", rrRMWMutationSingle, rrResultsSingle, pageState, mutationTestKeys, coherenceOverrides)
  ];
  const rrJsx = <SelectorTest key="rr" testName={rrName} tests={rrTests} />;
  let rwName = "RW Mutations";
  let rwTests = [
    buildTest(rwName, "Default", rwMutation, rwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rwName, "RMW", rwRMWMutation, rwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rwName, "Single Instance", rwMutationSingle, rwResultsSingle, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(rwName, "Single Instance RMW", rwRMWMutationSingle, rwResultsSingle, pageState, mutationTestKeys, coherenceOverrides)
  ];
  const rwJsx = <SelectorTest key="rw" testName={rwName} tests={rwTests} />;
  let wrName = "WR Mutations";
  let wrTests = [
    buildTest(wrName, "Default", wrMutation, wrResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wrName, "RMW", wrRMWMutation, wrResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wrName, "Single Instance", wrMutationSingle, wrResultsSingle, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wrName, "Single Instance RMW", wrRMWMutationSingle, wrResultsSingle, pageState, mutationTestKeys, coherenceOverrides)
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
    buildTest(wwName, "RMW 6", wwRMW6Mutation, wwResults, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "Single Instance", wwMutationSingle, wwResultsSingle, pageState, mutationTestKeys, coherenceOverrides),
    buildTest(wwName, "Single Instance RMW", wwRMWMutationSingle, wwResultsSingle, pageState, mutationTestKeys, coherenceOverrides)
  ];
  const wwJsx = <SelectorTest key="ww" testName={wwName} tests={wwTests} />;
  const mutationJsx = [rrJsx, rwJsx, wrJsx, wwJsx];

  function selectPTETests() {
    mpTests[0].setIsChecked(true);
    mpTests[2].setIsChecked(true);
    mpTests[3].setIsChecked(true);
    mpTests[8].setIsChecked(true);
    storeTests[0].setIsChecked(true);
    storeTests[2].setIsChecked(true);
    storeTests[3].setIsChecked(true);
    storeTests[8].setIsChecked(true);
    readTests[3].setIsChecked(true);
    readTests[5].setIsChecked(true);
    readTests[6].setIsChecked(true);
    readTests[9].setIsChecked(true);
    lbTests[0].setIsChecked(true);
    lbTests[2].setIsChecked(true);
    lbTests[3].setIsChecked(true);
    lbTests[8].setIsChecked(true);
    sbTests[3].setIsChecked(true);
    sbTests[5].setIsChecked(true);
    sbTests[6].setIsChecked(true);
    sbTests[9].setIsChecked(true);
    twoPlusTwoWriteTests[3].setIsChecked(true);
    twoPlusTwoWriteTests[5].setIsChecked(true);
    twoPlusTwoWriteTests[6].setIsChecked(true);
    twoPlusTwoWriteTests[9].setIsChecked(true);
    rrTests[0].setIsChecked(true);
    rrTests[1].setIsChecked(true);
    rwTests[0].setIsChecked(true);
    rwTests[1].setIsChecked(true);
    wrTests[0].setIsChecked(true);
    wrTests[1].setIsChecked(true);
    wwTests[0].setIsChecked(true);
    wwTests[1].setIsChecked(true);
  }

  function selectSITETests() {
    mpTests[9].setIsChecked(true);
    mpTests[10].setIsChecked(true);
    mpTests[11].setIsChecked(true);
    mpTests[12].setIsChecked(true);
    storeTests[9].setIsChecked(true);
    storeTests[10].setIsChecked(true);
    storeTests[11].setIsChecked(true);
    storeTests[12].setIsChecked(true);
    readTests[11].setIsChecked(true);
    readTests[12].setIsChecked(true);
    readTests[13].setIsChecked(true);
    readTests[14].setIsChecked(true);
    lbTests[9].setIsChecked(true);
    lbTests[10].setIsChecked(true);
    lbTests[11].setIsChecked(true);
    lbTests[12].setIsChecked(true);
    sbTests[11].setIsChecked(true);
    sbTests[12].setIsChecked(true);
    sbTests[13].setIsChecked(true);
    sbTests[14].setIsChecked(true);
    twoPlusTwoWriteTests[11].setIsChecked(true);
    twoPlusTwoWriteTests[12].setIsChecked(true);
    twoPlusTwoWriteTests[13].setIsChecked(true);
    twoPlusTwoWriteTests[14].setIsChecked(true);
    rrTests[4].setIsChecked(true);
    rrTests[5].setIsChecked(true);
    rwTests[2].setIsChecked(true);
    rwTests[3].setIsChecked(true);
    wrTests[2].setIsChecked(true);
    wrTests[3].setIsChecked(true);
    wwTests[8].setIsChecked(true);
    wwTests[9].setIsChecked(true);
  }

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
                      selectPTETests();
                      pageState.tuningTimes.update(150);
                      pageState.iterations.update(100);
                      pageState.maxWorkgroups.update(1024);
                      pageState.randomSeed.update("webgpu");
                    }} disabled={pageState.running.value}>
                      PTE Mutants
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      selectSITETests();
                      pageState.tuningTimes.update(150);
                      pageState.iterations.update(300);
                      pageState.maxWorkgroups.update(1024);
                      pageState.randomSeed.update("webgpu");
                    }} disabled={pageState.running.value}>
                      SITE Mutants
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      selectSITETests();
                      pageState.tuningTimes.update(150);
                      pageState.iterations.update(300);
                      pageState.maxWorkgroups.update(32);
                      pageState.randomSeed.update("webgpu");
                      pageState.tuningOverrides.update(
                        {
                          "testingWorkgroups": 32,
                          "minTestingWorkgroups": 32,
                          "maxWorkgroups": 32,
                          "shufflePct": 0,
                          "barrierPct": 0,
                          "memStressPct": 0,
                          "preStressPct": 0
                        }
                      );
                    }} disabled={pageState.running.value}>
                      SITE Baseline Mutants
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      selectPTETests();
                      pageState.tuningTimes.update(150);
                      pageState.iterations.update(100);
                      pageState.maxWorkgroups.update(1024);
                      pageState.randomSeed.update("webgpu");
                      pageState.tuningOverrides.update(
                        {
                          "testingWorkgroups": 1024,
                          "minTestingWorkgroups": 1024,
                          "maxWorkgroups": 1024,
                          "shufflePct": 0,
                          "barrierPct": 0,
                          "memStressPct": 0,
                          "preStressPct": 0
                        }
                      );
                    }} disabled={pageState.running.value}>
                      PTE Baseline Mutants
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
            <div className="panel-block p-2">
              <div className="columns is-2 ">
                <div className="column ">
                  <b> Correlation Tests </b>
                  <div className="buttons are-small">
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      corrTests[0].setIsChecked(true);
                      rrTests[0].setIsChecked(true);
                      pageState.tuningTimes.update(150);
                      pageState.iterations.update(100);
                      pageState.maxWorkgroups.update(1024);
                      pageState.randomSeed.update("webgpu");
                    }} disabled={pageState.running.value}>
                      Intel CoRR
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      mpTests[0].setIsChecked(true);
                      mpTests[1].setIsChecked(true);
                      mpTests[2].setIsChecked(true);
                      mpTests[3].setIsChecked(true);
                      pageState.tuningTimes.update(150);
                      pageState.iterations.update(100);
                      pageState.maxWorkgroups.update(1024);
                      pageState.randomSeed.update("webgpu");
                    }} disabled={pageState.running.value}>
                      AMD MP-relacq 
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      tests.map(test => test.setIsChecked(false));
                      mpTests[8].setIsChecked(true);
                      mpTests[13].setIsChecked(true);
                      pageState.tuningTimes.update(150);
                      pageState.iterations.update(100);
                      pageState.maxWorkgroups.update(1024);
                      pageState.randomSeed.update("webgpu");
                    }} disabled={pageState.running.value}>
                      Nvidia MP-CO
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
      ...randomConfig(generator, pageState.smoothedParameters.value, pageState.maxWorkgroups.value, pageState.tuningOverrides.value),
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
            <label><b>Configurations:</b></label>
            <input className="input" type="text" value={pageState.tuningTimes.value} onInput={(e) => {
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
            <input className="input" type="text" value={pageState.iterations.value} onInput={(e) => {
              pageState.iterations.update(e.target.value);
            }} disabled={pageState.running.value} />
          </div>
        </div>
        <div className="column" >
          <div className="control">
            <label><b>Random Seed:</b></label>
            <input className="input" type="text" value={pageState.randomSeed.value} onInput={(e) => {
              pageState.randomSeed.update(e.target.value);
            }} disabled={pageState.running.value} />
          </div>
        </div>
        <div className="column" >
          <div className="control">
            <label><b>Max Workgroups:</b></label>
            <input className="input" type="text" value={pageState.maxWorkgroups.value} onInput={(e) => {
              pageState.maxWorkgroups.update(e.target.value);
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
        <div className="column">
          <div className='control'>
            <label className="checkbox"><b>Overrides:</b></label>
            <TuningOverrides pageState={pageState} />
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
