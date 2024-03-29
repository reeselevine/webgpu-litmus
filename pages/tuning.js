import { useState } from 'react';
import { PRNG } from '../components/prng.js';
import { buildThrottle, randomConfig, setVis } from '../components/test-page-utils.js';
import { reportTime, getCurrentIteration, runLitmusTest } from '../components/litmus-setup.js'
import { defaultTestParams } from '../components/litmus-setup.js'

import { filteredParams } from '../components/tuningTable.js';
import { conformanceTests, tuningTests } from '../components/test-setup.js';
import platform from 'platform';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));
const defaultKeys = ["seq0", "seq1", "interleaved", "weak"];
const coherenceOverrides = {
  aliasedMemory: true,
  permuteSecond: 1
};

function getPageState() {
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(parseInt(process.env.NEXT_PUBLIC_TUNING_ITERATIONS));
  const [randomSeed, setRandomSeed] = useState(process.env.NEXT_PUBLIC_TUNING_SEED);
  const [smoothedParameters, setSmoothedParameters] = useState(false);
  const [maxWorkgroups, setMaxWorkgroups] = useState(parseInt(process.env.NEXT_PUBLIC_TUNING_MAX_WG));
  const [tuningOverrides, setTuningOverrides] = useState({});
  const [tuningTimes, setTuningTimes] = useState(parseInt(process.env.NEXT_PUBLIC_TUNING_CONFIGS));
  const [rows, setRows] = useState([]);
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
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

  let testParamOverrides = {};
  if (testInfo.coherency) {
    testParamOverrides = coherenceOverrides;
  }

  return {
    testName: testName,
    shader: testInfo.shader,
    resultShader: testInfo.resultShader,
    state: {
      seq: 0,
      interleaved: 0,
      weak: 0,
      durationSeconds: 0
    },
    keys: defaultKeys,
    isChecked: isChecked,
    setIsChecked: setIsChecked,
    testParamOverrides: testParamOverrides,
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

function getRunStats(activeTests, params, iterations) {
  let stats = {};
  for (const test of activeTests) {
    stats[test.testName] = JSON.parse(JSON.stringify(test.state));
  }
  stats["params"] = JSON.parse(filteredParams(params));
  stats["params"]["iterations"] = parseInt(iterations);
  return stats;
}

function getPlatformInfoValue(outerKey, innerKey, stats) {
  if (stats.platformInfo) {
    if (outerKey in stats.platformInfo) {
      return stats.platformInfo[outerKey][innerKey];
    }
  }
  return "";
}

function getGPUInfo(stats) {
  if (stats.platformInfo) {
    if ("gpu" in stats.platformInfo) {
      if (stats.platformInfo["gpu"]["description"] != "") {
        return stats.platformInfo["gpu"]["description"];
      } else {
        return stats.platformInfo["gpu"]["vendor"] + " " + stats.platformInfo["gpu"]["architecture"];
      }
    }
  }
  return "";
}

function SubmitForm(props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gpuInfo, setGpuInfo] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");
  const [osInfo, setOsInfo] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const submit = async () => {
    props.stats["userInfo"] = {
      name: name,
      email: email,
      gpu: gpuInfo,
      browser: browserInfo,
      os: osInfo
    };
    setSubmitSuccess("");
    setSubmitErr("");
    setSubmitLoading(true);
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props.stats)
      };
      const response = await fetch(process.env.NEXT_PUBLIC_DATA_API + "/submit", requestOptions);
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      setSubmitSuccess("Submit Succeeded!");
      props.pageState.submitPossible.update(false);
    } catch (err) {
      console.log(err.message);
      setSubmitErr(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <div className={"modal " + ((props.pageState.submitFormIsActive.value) ? "is-active" : "")}>
        <div className="modal-background" onClick={() => {
          props.pageState.submitFormIsActive.update(!props.pageState.submitFormIsActive.value)
          setSubmitSuccess("");
          setSubmitErr("");
        }}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Submit Your Results</p>
            <button className="delete" aria-label="close" onClick={() => {
              props.pageState.submitFormIsActive.update(!props.pageState.submitFormIsActive.value)
              setSubmitSuccess("");
              setSubmitErr("");
            }}></button>
          </header>
          <section className="modal-card-body">
            <p>
              By submitting your results, you agree to allow us to collect information about your GPU, browser, and operating system. We do not collect data on location or other usage. Additionally, if you fill out your name and email you agree to allow us to follow up with you on your results if needed. All device information submitted will be used anonymously for research purposes, including publication of papers. We will not use or distribute your name/email for any purposes.
            </p>
            <p>
              <b>All fields are optional.</b>
            </p>
            <div className="columns">
              <div className="column" >
                <div className="control mb-2">
                  <label><b>Name:</b></label>
                  <input className="input" type="text" value={name} onInput={(e) => {
                    setName(e.target.value);
                  }} />
                </div>
              </div>
              <div className="column" >
                <div className="control mb-2">
                  <label><b>Email:</b></label>
                  <input className="input" type="email" value={email} onInput={(e) => {
                    setEmail(e.target.value);
                  }} />
                </div>
              </div>
            </div>
            <div className="columns">
              <div className="column" >
                <div className="control mb-2">
                  <label><b>GPU:</b></label>
                  <p>Detected: {getGPUInfo(props.stats)} </p>
                  <input className="input" type="text" value={gpuInfo} onInput={(e) => {
                    setGpuInfo(e.target.value);
                  }} />
                </div>
              </div>
              <div className="column" >
                <div className="control mb-2">
                  <label><b>Browser:</b></label>
                  <p>Detected: {getPlatformInfoValue("browser", "vendor", props.stats)} {getPlatformInfoValue("browser", "version", props.stats)} </p>
                  <input className="input" type="text" value={browserInfo} onInput={(e) => {
                    setBrowserInfo(e.target.value);
                  }} />
                </div>
              </div>
              <div className="column" >
                <div className="control mb-2">
                  <label><b>Operating System:</b></label>
                  <p>Detected: {getPlatformInfoValue("os", "vendor", props.stats)} {getPlatformInfoValue("os", "version", props.stats)} </p>
                  <input className="input" type="email" value={osInfo} onInput={(e) => {
                    setOsInfo(e.target.value);
                  }} />
                </div>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <button className={"button is-success " + (submitLoading ? "is-loading" : "")} onClick={submit} disabled={!props.pageState.submitPossible.value}>
              Submit
            </button>
            {submitSuccess && <p>{submitSuccess}</p>}
            {submitErr && <p>{submitErr}</p>}
          </footer>
        </div>
      </div>
    </>
  );
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
    </tr>
  )
}

function SelectorTest(props) {
  const [testsVisible, setTestsVisible] = useState(true);
  const testRows = [];
  for (const test in props.tests) {
    testRows.push(props.tests[test].jsx);
  }
  return (
    <>
      <li>
        <a onClick={() => setTestsVisible(!testsVisible)}>{!testsVisible ? "Expand" : "Collapse"}</a>
        <ul className={testsVisible ? "is-active" : "is-hidden"}>
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
  let conformanceTestsComponent = {};
  for (const key in conformanceTests) {
    conformanceTestsComponent[key] = buildTest(key, conformanceTests[key], pageState);
  }
  const conformanceJsX = <SelectorTest key="conformance" tests={conformanceTestsComponent} />;

  let tuningTestsComponent = {};
  for (const key in tuningTests) {
    tuningTestsComponent[key] = buildTest(key, tuningTests[key], pageState);
  }
  const tuningJsX = <SelectorTest key="tuning" tests={tuningTestsComponent} />;

  let allTests = {
    ...conformanceTestsComponent,
    ...tuningTestsComponent
  };

  return {
    tests: allTests,
    jsx: (
      <>
        <div className="column is-two-fifths mr-2">
          <nav className="panel">
            <p className="panel-heading">
              Selected Tests
            </p>
            <div className="container" style={{ overflowY: 'scroll', overflowX: 'scroll', height: '250px' }}>
              <aside className="menu">
                <SelectorCategory category="Conformance Tests" tests={conformanceJsX} />
                <SelectorCategory category="Tuning Tests" tests={tuningJsX} />
              </aside>
            </div>
            <div className="panel-block p-2">
              <div className="columns is-2 ">
                <div className="column ">
                  <b> Presets </b>
                  <div className="buttons are-small">
                    <button className="button is-link is-outlined " onClick={() => {
                      setTests(allTests, false);
                      setTests(conformanceTestsComponent, true);
                      presetTuningConfig(pageState);
                    }} disabled={pageState.running.value}>
                      Conformance Tests
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      setTests(allTests, false);
                      setTests(tuningTestsComponent, true);
                      presetTuningConfig(pageState);
                    }} disabled={pageState.running.value}>
                      Tuning Tests
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      setTests(allTests, true);
                      presetTuningConfig(pageState);
                    }} disabled={pageState.running.value}>
                      All Tests
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      setTests(allTests, false);
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
  const adapterInfo = await gpuAdapter.requestAdapterInfo();
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

function randomizeParams(testParams, i, generator, pageState, maxWorkgroups, maxWorkgroupSize) {
  let params = {
    ...randomConfig(generator, pageState.smoothedParameters.value, maxWorkgroups, pageState.tuningOverrides.value, maxWorkgroupSize),
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
  clearState(pageState, ["totalTime", "completedTests", "seq", "interleaved", "weak"]);
  pageState.curParams = testParams;
  for (let j = 0; j < pageState.activeTests.length; j++) {
    let curTest = pageState.activeTests[j];
    curTest.state.seq = 0;
    curTest.state.interleaved = 0;
    curTest.state.weak = 0;
    curTest.state.durationSeconds = 0;
    let newParams = JSON.parse(JSON.stringify(testParams));
    for (const key in curTest.testParamOverrides) {
      newParams[key] = curTest.testParamOverrides[key];
    }
    await runLitmusTest(curTest.shader, curTest.resultShader, newParams, pageState.iterations.value, handleResult(curTest, pageState));
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

async function tuneAndConform(tests, pageState) {
  let bestConfigs = {};
  setTests(tests, false);
  let testsToRun = [];
  for (let test in tuningTests) {
    tests[test].setIsChecked(true);
    testsToRun.push(tests[test]);
  }
  let maxWorkgroups;
  let workgroupSize;
  if (navigator.userAgentData && await navigator.userAgentData.mobile) {
    maxWorkgroups = parseInt(process.env.NEXT_PUBLIC_MOBILE_TUNING_MAX_WG);
    workgroupSize = parseInt(process.env.NEXT_PUBLIC_MOBILE_TUNING_MAX_WG_SIZE);
  } else {
    maxWorkgroups = parseInt(process.env.NEXT_PUBLIC_TUNING_MAX_WG);
    workgroupSize = parseInt(process.env.NEXT_PUBLIC_TUNING_MAX_WG_SIZE);
  }
  const generator = await initializeRun(testsToRun, pageState);
  for (let i = 0; i < pageState.tuningTimes.value; i++) {
    let params = randomizeParams(testParams, i, generator, pageState, maxWorkgroups, workgroupSize);
    await doTuningIteration(i, params, pageState);
    for (let j = 0; j < pageState.activeTests.length; j++) {
      let curTest = pageState.activeTests[j];
      let curRate = curTest.state.weak / curTest.state.durationSeconds;
      if (!(curTest.testName in bestConfigs) || bestConfigs[curTest.testName].maxRate < curRate) {
        bestConfigs[curTest.testName] = {
          maxRate: curRate,
          params: JSON.parse(JSON.stringify(pageState.curParams))
        };
      }
    }
  }
  let i = parseInt(pageState.tuningTimes.value);
  pageState.totalTests.update(1);
  for (let test in bestConfigs) {
    pageState.activeTests = [tests[tuningTests[test].conformanceTest]];
    bestConfigs[test].params.id = i;
    await doTuningIteration(i, bestConfigs[test].params, pageState);
    i++;
  }
  pageState.allStats.update(pageState.allStats.internalState);
  pageState.submitPossible.update(true);
  pageState.running.update(false);
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
            <h1 className="testName">Tuning Suite</h1>
            <p>
              <b>Note:</b> This page is currently only guaranteed to work when running the Chrome web browser on desktops/laptops, or in Chrome Canary on Android devices with special flags enabled. WebGPU is still in development and other browsers may not have stable implementations of WebGPU released publicly yet.
            </p>
            <p>
              The tuning suite is used to tune over user selected tests. Users can either tune over conformance tests, looking for bugs, or tuning tests, to characterize weak behaviors. The "Tune/Conform" action first runs the tuning tests for the set number of configurations/iterations, and then for each tuning test, runs the associated conformance test in the environment that maximizes the rate of weak behaviors.
            </p>

            <p>
              Testing should take 10-20 minutes to run. Try to ensure your computer does not go to sleep during the tests, as this might affect their ability to complete. You can change your sleep settings in your system preferences. After running the "Tune/Conform" action, the results can be submitted using the "Submit Results" button, which will bring up a form where more information can be submitted. 
            </p>

            <p>
              <b>Please read before tuning:</b> By default, the website only has limited access to information about your GPU. To allow more information in Chrome, paste "chrome://flags#enable-webgpu-developer-features" into your url bar, press enter, and enable the flag. Please make sure to do this before running your tests, as you will need to relaunch Chrome for it to take effect.
            </p>
          </div>
        </div>
        {!pageState.tuneAndConform.value ? testSelector.jsx : <div></div> }
      </div>
      <div className="tabs is-medium is-centered">
        <ul>
          <li className={setVis(pageState.tuneAndConform.value, "is-active")} onClick={() => { 
            pageState.tuneAndConform.update(true); 
            presetTuningConfig(pageState);
            }}><a>Tune/Conform</a></li>
          <li className={setVis(!pageState.tuneAndConform.value, "is-active")} onClick={() => { 
            pageState.tuneAndConform.update(false); 
            presetTuningConfig(pageState);
            }}><a>Tune</a></li>
        </ul>
      </div>
      {pageState.tuneAndConform.value ?
        <>
          <div className='m-1'>
            <button className="button is-primary" onClick={() => {
              pageState.tuningRows.value.splice(0, pageState.tuningRows.length);
              tuneAndConform(testSelector.tests, pageState);
            }} disabled={pageState.running.value}>
              Tune/Conform
            </button>
          </div>
          <div className="m-1">
            <button className="button is-light" onClick={() => {
              pageState.submitFormIsActive.update(!pageState.submitFormIsActive.value);
            }} disabled={pageState.running.value}>
              Submit Results
            </button>
            <SubmitForm stats={pageState.allStats.visibleState} pageState={pageState} />
          </div>
        </>
        :
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
      }
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
