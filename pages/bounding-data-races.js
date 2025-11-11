import { useState } from 'react';
import { PRNG } from '../components/prng.js';
import { buildThrottle, randomConfig, setVis } from '../components/test-page-utils.js';
import { reportTime, getCurrentIteration, runTimeBoundingLitmusTest } from '../components/litmus-setup.js'

import { filteredParams } from '../components/tuningTable.js';
import platform from 'platform';

import rrMemDeviceScopeWg from '../shaders/time-bounds/rr/rr-mem-device-scope-wg.wgsl'
import rrMemWgScopeWg from '../shaders/time-bounds/rr/rr-mem-wg-scope-wg.wgsl'
import rrResults from '../shaders/time-bounds/rr/rr-results.wgsl'
import rwMemDeviceScopeWg from '../shaders/time-bounds/rw/rw-mem-device-scope-wg.wgsl'
import rwMemWgScopeWg from '../shaders/time-bounds/rw/rw-mem-wg-scope-wg.wgsl'
import rwResults from '../shaders/time-bounds/rw/rw-results.wgsl'
import wrMemDeviceScopeWg from '../shaders/time-bounds/wr/wr-mem-device-scope-wg.wgsl'
import wrMemWgScopeWg from '../shaders/time-bounds/wr/wr-mem-wg-scope-wg.wgsl'
import wrResults from '../shaders/time-bounds/wr/wr-results.wgsl'

const testParams = {
  testingWorkgroups: 2,
  maxWorkgroups: 4,
  workgroupSize: 256,
  shufflePct: 0,
  barrierPct: 0,
  numOutputs: 2,
  scratchMemorySize: 2048,
  memStride: 1,
  memStressPct: 0,
  memStressIterations: 1024,
  memStressStoreFirstPct: 0,
  memStressStoreSecondPct: 100,
  preStressPct: 0,
  preStressIterations: 128,
  preStressStoreFirstPct: 0,
  preStressStoreSecondPct: 100,
  stressLineSize: 64,
  stressTargetLines: 2,
  stressStrategyBalancePct: 100,
  permuteFirst: 419,
  permuteSecond: 1,
  aliasedMemory: true
}

export const tests = {
  rrMemDeviceScopeWg: {
    shader: rrMemDeviceScopeWg,
    resultShader: rrResults,
    overrides: {
      numOutputs: 3
    },
    workgroupMem: false,
    needsMem: false
  },
  rrMemWgScopeWg: {
    shader: rrMemWgScopeWg,
    resultShader: rrResults,
    overrides: {
      numOutputs: 3
    },
    workgroupMem: true,
    needsMem: false
  },
  rwMemDeviceScopeWg: {
    shader: rwMemDeviceScopeWg,
    resultShader: rwResults,
    overrides: {},
    workgroupMem: false,
    needsMem: true
  },
  rwMemWgScopeWg: {
    shader: rwMemWgScopeWg,
    resultShader: rwResults,
    overrides: {},
    workgroupMem: true,
    needsMem: true
  },
  wrMemDeviceScopeWg: {
    shader: wrMemDeviceScopeWg,
    resultShader: wrResults,
    overrides: {},
    workgroupMem: false,
    needsMem: true
  },
  wrMemWgScopeWg: {
    shader: wrMemWgScopeWg,
    resultShader: wrResults,
    overrides: {},
    workgroupMem: true,
    needsMem: true
  }
};


const defaultKeys = ["sequential", "interleaved", "racy", "unbound", "other"];

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(parseInt(process.env.NEXT_PUBLIC_TUNING_ITERATIONS));
  const [randomSeed, setRandomSeed] = useState(process.env.NEXT_PUBLIC_TUNING_SEED);
  const [smoothedParameters, setSmoothedParameters] = useState(false);
  const [maxWorkgroups, setMaxWorkgroups] = useState(parseInt(process.env.NEXT_PUBLIC_TUNING_MAX_WG));
  const [tuningOverrides, setTuningOverrides] = useState({});
  const [tuningTimes, setTuningTimes] = useState(parseInt(process.env.NEXT_PUBLIC_TUNING_CONFIGS));
  const [rows, setRows] = useState([]);
  const [sequential, setSequential] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [racy, setRacy] = useState(0);
  const [unbound, setUnbound] = useState(0);
  const [other, setOther] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [overallTime, setOverallTime] = useState(0);
  const [completedTests, setCompletedTests] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [allStats, setAllStats] = useState({});
  const [tuneAndConform, setTuneAndConform] = useState(true);
  const [submitFormIsActive, setSubmitFormIsActive] = useState(false);
  const [submitPossible, setSubmitPossible] = useState(false);
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
    tuneAndConform: {
      value: tuneAndConform,
      update: setTuneAndConform
    },
    submitFormIsActive: {
      value: submitFormIsActive,
      update: setSubmitFormIsActive
    },
    submitPossible: {
      value: submitPossible,
      update: setSubmitPossible
    },
    sequential: {
      ...buildStateValues(sequential, setSequential)
    },
    interleaved: {
      ...buildStateValues(interleaved, setInterleaved)
    },
    racy: {
      ...buildStateValues(racy, setRacy)
    },
    unbound: {
      ...buildStateValues(unbound, setUnbound)
    },
    other: {
      ...buildStateValues(other, setOther)
    },
    totalTime: {
      ...buildStateValues(totalTime, setTotalTime)
    },
    overallTime: {
      ...buildStateValues(overallTime, setOverallTime)
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

function TestCode(props) {
  const [isActive, setIsActive] = useState(false);
  let json = JSON.stringify(props.stats, null, 2);
  return (
    <>
      <a onClick={() => {
        setIsActive(!isActive);
      }}>
        {props.testName}
      </a>
      <div className={"modal " + (isActive ? "is-active" : "")}>
        <div className="modal-background" onClick={() => {
          setIsActive(!isActive)
        }}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Shaders</p>
            <button className="delete" aria-label="close" onClick={() => {
              setIsActive(!isActive)
            }}></button>
          </header>
          <section className="modal-card-body">
            Shader
            <pre>
              {props.shader}
            </pre>
            Result Shader
            <pre>
              {props.resultShader}
            </pre>
          </section>
        </div>
      </div>
    </>
  )
}

function TuningTest(props) {
  return (
    <>
      <div>
        <input type="checkbox" name={props.testName} checked={props.isChecked} onChange={props.handleOnChange} disabled={props.pageState.running.value} />
        <label>
          <TestCode testName={props.testName} shader={props.shader} resultShader={props.resultShader} />
        </label>
      </div>
    </>
  )
}

function buildTest(testName, testInfo, pageState) {
  const [isChecked, setIsChecked] = useState(false);

  const handleOnChange = () => {
    setIsChecked(!isChecked);
  };

  return {
    testName: testName,
    shader: testInfo.shader,
    resultShader: testInfo.resultShader,
    workgroupMem: testInfo.workgroupMem,
    needsMem: testInfo.needsMem,
    state: {
      sequential: 0,
      interleaved: 0,
      racy: 0,
      unbound: 0,
      other: 0,
      durationSeconds: 0
    },
    keys: defaultKeys,
    isChecked: isChecked,
    setIsChecked: setIsChecked,
    testParamOverrides: testInfo.overrides,
    jsx: <TuningTest key={testName} testName={testName} shader={testInfo.shader} resultShader={testInfo.resultShader} isChecked={isChecked} handleOnChange={handleOnChange} pageState={pageState} />
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
      let key = test.keys[i];
      test.state[key] = test.state[key] + result[i];
      pageState[key].internalState = pageState[key].internalState + result[i];
      pageState[key].update(pageState[key].internalState);
    }
  }
}

function getRunStats(activeTests, params, iterations) {
  let stats = {};
  for (const test of activeTests) {
    stats[test.testName] = JSON.parse(JSON.stringify(test.state));
  }
  stats["params"] = JSON.parse(filteredParams(params));
  stats["params"]["iterations"] = parseInt(iterations);
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
        {props.pageState.sequential.visibleState}
      </td>
      <td>
        {props.pageState.interleaved.visibleState}
      </td>
      <td>
        {props.pageState.racy.visibleState}
      </td>
      <td>
        {props.pageState.unbound.visibleState}
      </td>
      <td>
        {props.pageState.other.visibleState}
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
        {props.pageState.sequential.internalState}
      </td>
      <td>
        {props.pageState.interleaved.internalState}
      </td>
      <td>
        {props.pageState.racy.internalState}
      </td>
      <td>
        {props.pageState.unbound.internalState}
      </td>
      <td>
        {props.pageState.other.internalState}
      </td>
    </tr>
  )
}

function SelectorTest(props) {
  const testRows = [];
  for (const test in props.tests) {
    testRows.push(props.tests[test].jsx);
  }
  return (
    <>
      <li>
        <ul>
          {testRows}
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

function setTests(tests, val) {
  for (const test in tests) {
    tests[test].setIsChecked(val);
  }
}

function presetTuningConfig(pageState) {
  pageState.tuningTimes.update(parseInt(process.env.NEXT_PUBLIC_TUNING_CONFIGS));
  pageState.iterations.update(parseInt(process.env.NEXT_PUBLIC_TUNING_ITERATIONS));
  pageState.maxWorkgroups.update(parseInt(process.env.NEXT_PUBLIC_TUNING_MAX_WG));
  pageState.randomSeed.update(process.env.NEXT_PUBLIC_TUNING_SEED);
}

function getTestSelector(pageState) {
  let testsComponent = {};
  for (const key in tests) {
    testsComponent[key] = buildTest(key, tests[key], pageState);
  }
  const testsJsx = <SelectorTest key="Tests" tests={testsComponent} />;

  return {
    tests: testsComponent,
    jsx: (
      <>
        <div className="column is-two-fifths mr-2">
          <nav className="panel">
            <p className="panel-heading">
              Selected Tests
            </p>
            <div className="container" style={{ overflowY: 'scroll', overflowX: 'scroll', height: '250px' }}>
              <aside className="menu">
                <SelectorCategory category="All Tests" tests={testsJsx} />
              </aside>
            </div>
            <div className="panel-block p-2">
              <div className="columns is-2 ">
                <div className="column ">
                  <b> Presets </b>
                  <div className="buttons are-small">
                    <button className="button is-link is-outlined " onClick={() => {
                      setTests(testsComponent, true);
                      presetTuningConfig(pageState);
                    }} disabled={pageState.running.value}>
                      All Tests
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      setTests(testsComponent, false);
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

async function initializeRun(tests, pageState) {
  pageState.tuningRows.update([]);
  pageState.allStats.internalState = {};
  pageState.overallTime.internalState = 0;
  pageState.overallTime.update(0);
  pageState.activeTests = tests;
  pageState.running.update(true);
  pageState.totalTests.update(pageState.activeTests.length);
  // get platform info
  let osVendor = "";
  let osVersion = "";
  let isMobile = "";
  if (navigator.userAgentData) {
    const highEntropyHints = ["platformVersion"]
    const userAgentData = await navigator.userAgentData.getHighEntropyValues(highEntropyHints);
    osVendor = userAgentData.platform;
    osVersion = userAgentData.platformVersion;
    isMobile = userAgentData.mobile;
  }
  const gpuAdapter = await navigator.gpu.requestAdapter();
  const adapterInfo = gpuAdapter.adapterInfo;
  pageState.allStats.internalState["platformInfo"] = {
    gpu: {
      vendor: adapterInfo.vendor,
      architecture: adapterInfo.architecture,
      device: adapterInfo.device,
      description: adapterInfo.description
    },
    browser: {
      vendor: platform.name,
      version: platform.version
    },
    os: {
      vendor: osVendor,
      version: osVersion,
      mobile: isMobile
    },
    framework: "webgpu"
  };
  let generator;
  if (pageState.randomSeed.value.length === 0) {
    generator = PRNG(Math.floor(Math.random() * 2147483647), false);
  } else {
    generator = PRNG(pageState.randomSeed.value);
    pageState.allStats.internalState["randomSeed"] = pageState.randomSeed.value;
  }
  return generator;
}

function randomizeParams(testParams, i, generator, pageState, maxWorkgroups) {
  let params = {
    ...randomConfig(generator, pageState.smoothedParameters.value, maxWorkgroups, pageState.tuningOverrides.value),
    id: i,
    numMemLocations: testParams.numMemLocations,
    numOutputs: testParams.numOutputs,
    permuteFirst: testParams.permuteFirst,
    permuteSecond: testParams.permuteSecond,
    aliasedMemory: testParams.aliasedMemory
  };
  return params;
}

async function doTuningIteration(i, testParams, pageState) {
  clearState(pageState, ["totalTime", "completedTests", "sequential", "interleaved", "racy", "unbound", "other"]);
  pageState.curParams = testParams;
  for (let j = 0; j < pageState.activeTests.length; j++) {
    let curTest = pageState.activeTests[j];
    curTest.state.sequential = 0;
    curTest.state.interleaved = 0;
    curTest.state.racy = 0;
    curTest.state.unbound = 0;
    curTest.state.other = 0;
    curTest.state.durationSeconds = 0;
    let newParams = JSON.parse(JSON.stringify(testParams));
    for (const key in curTest.testParamOverrides) {
      newParams[key] = curTest.testParamOverrides[key];
    }
    await runTimeBoundingLitmusTest(curTest.shader, curTest.resultShader, newParams, pageState.iterations.value, handleResult(curTest, pageState), curTest.workgroupMem, curTest.needsMem);
    pageState.totalTime.internalState = pageState.totalTime.internalState + reportTime();
    pageState.overallTime.internalState = pageState.overallTime.internalState + reportTime();

    curTest.state.durationSeconds = reportTime();
    pageState.totalTime.update(pageState.totalTime.internalState);
    pageState.overallTime.update(pageState.overallTime.internalState);

    pageState.completedTests.internalState = pageState.completedTests.internalState + 1;
    pageState.completedTests.update(pageState.completedTests.internalState);
  }
  let stats = getRunStats(pageState.activeTests, testParams, pageState.iterations.value);
  let row = <StaticRow pageState={pageState} key={testParams.id} stats={stats} />;
  pageState.allStats.internalState[i] = stats;
  pageState.tuningRows.update(oldRows => [...oldRows, row]);
}

async function tune(tests, pageState) {
  let testsToRun = [];
  for (let test in tests) {
    if (tests[test].isChecked) {
      testsToRun.push(tests[test]);
    }
  }
  const generator = await initializeRun(testsToRun, pageState);
  for (let i = 0; i < pageState.tuningTimes.value; i++) {
    let params = randomizeParams(testParams, i, generator, pageState, pageState.maxWorkgroups.value, pageState.curParams.workgroupSize);
    await doTuningIteration(i, params, pageState);
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
            <h1 className="testName">Bounding Data Races in Time</h1>
            To see if they are.
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
              tune(testSelector.tests, pageState);
            }} disabled={pageState.running.value}>
              Tune
            </button>
          </div>
          <div className="column" >
            <div className="control mb-2">
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
              <label className="checkbox"><b>Overrides:</b></label>
              <TuningOverrides pageState={pageState} />
            </div>
          </div>
        </div>
      <div>
        <label><b>All Runs:</b></label>
        <RunStatistics stats={pageState.allStats.visibleState} />
      </div>
      <div>
        <b>Overall Time:</b> {pageState.overallTime.visibleState.toFixed(3)}s
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
              <th>Total Racy Behaviors</th>
              <th>Total Unbound Behaviors</th>
              <th>Total Other Behaviors</th>
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
