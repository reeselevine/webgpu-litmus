import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { runLitmusTest, reportTime, getCurrentIteration } from './litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';
import { getStressPanel } from './stressPanel.js';
import ProgressBar, { setProgressBarState } from '../components/progressBar';
import { clearState, handleResult, randomConfig, setVis } from './test-page-utils.js';
import TuningTable, { StaticRow } from "../components/tuningTable"

function getPageState(props) {
  const [iterations, setIterations] = useState(100);
  const [running, setRunning] = useState(false);
  const [pseudoActive, setPseudoActive] = useState(true);
  const [mode, setMode] = useState(false);
  const [tuning, setTuning] = useState(false);
  const [activePseudoCode, setActivePseudoCode] = useState(props.pseudoCode.code);
  const [activeShader, setActiveShader] = useState(props.shaderCode);
  const [workgroupVariant, setWorkgroupVariant] = useState(props.variants.default.workgroup);
  const [tuningTimes, setTuningTimes] = useState(10);
  const [resetTable, setResetTable] = useState(false);
  const [progress, setProgress] = useState(0);
  //do next test if true, stop otherwise; change by tuningTable component
  const [renderTable, setRender] = useState(false);
  const [rows, setRows] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [tuningStats, setTuningStats] = useState({
    maxWeak: 0,
    maxWeakRows: [],
    averageWeak: 0
  })
  return {
    iterations: {
      value: iterations,
      update: setIterations
    },
    running: {
      value: running,
      update: setRunning
    },
    pseudoActive: {
      value: pseudoActive,
      update: setPseudoActive
    },
    activePseudoCode: {
      value: activePseudoCode,
      update: setActivePseudoCode
    },
    activeShader: {
      value: activeShader,
      update: setActiveShader
    },
    workgroupVariant: {
      value: workgroupVariant,
      update: setWorkgroupVariant
    },
    modeActive: {
      value: mode,
      update: setMode
    },
    tuningActive: {
      value: tuning,
      update: setTuning
    },
    tuningTimes: {
      value: tuningTimes,
      update: setTuningTimes
    },
    resetTable: {
      value: resetTable,
      update: setResetTable
    },
    progress: {
      value: progress,
      update: setProgress
    },
    renderTable: {
      value: renderTable,
      update: setRender
    },
    tuningRows: {
      value: rows,
      update: setRows
    },
    tuningStats: {
      value: tuningStats,
      update: setTuningStats
    },
    paramActive:{
      value: isActive,
      update: setIsActive
    }
  }
}

async function doTest(pageState, testParams, shaderCode, resultShaderCode, testState, keys) {
  pageState.running.update(true);
  clearState(testState, keys);
  var resultShader;
  if (pageState.workgroupVariant.value) {
    resultShader = resultShaderCode.workgroup;
  } else {
    resultShader = resultShaderCode.default;
  }
  await runLitmusTest(shaderCode, resultShader, testParams, pageState.iterations.value, handleResult(testState, keys)).then(
    success => {
      pageState.running.update(false);
      console.log("success!")

    },
    error => console.log(error)
  );
}

function chartConfig(pageState, testParams, uiParams, tooltipFilter) {
  return {
    plugins: {
      title: {
        display: true,
        position: "top",
        text: ['Histogram of Observed Behaviors', 'Log Scale'],
        fontSize: 20
      },
      tooltip: {
        filter: tooltipFilter
      }
    },
    scales: {
      yAxis: {
        axis: 'y',
        type: 'logarithmic',
        min: 0.1,
        max: pageState.iterations.value * testParams.workgroupSize * testParams.testingWorkgroups,
        ticks: {
          callback: function (value, index, values) {
            var val = value;
            while (val >= 10 && val % 10 == 0) {
              val = val / 10;
            }
            if (val == 1) {
              return value;
            }
          }
        }
      }
    },
    animation: {
      duration: 0
    }
  }
}

function DropdownOption(props) {
  return (<option value={props.value}>{props.value}</option>)
}

let totalIteration = 0;

function VariantOptions(props) {
  const variantOptions = Object.keys(props.variants).map(key => <DropdownOption value={key} key={key} />)
  return (
    <>
      <label><b>Choose variant:</b></label>
      <select className="dropdown" name="variant" onChange={(e) => {
        props.pageState.activePseudoCode.update(props.variants[e.target.value].pseudo);
        props.pageState.activeShader.update(props.variants[e.target.value].shader);
        props.pageState.workgroupVariant.update(props.variants[e.target.value].workgroup);
      }} disabled={props.pageState.running.value}>
        {variantOptions}
      </select>
    </>)
}

//run litmus test for each random config and store config for displaying 
async function random(pageState, testState, testParams, keys, buildStaticRowOutputs, resultShaderCode) {
  pageState.tuningRows.update([]);
  pageState.running.update(true);
  pageState.tuningStats.update({
    maxWeak: 0,
    maxWeakRows: [],
    averageWeak: 0
  });
  for (let i = 0; i < pageState.tuningTimes.value; i++) {
    let params = {
      ...randomConfig(Math.random),
      id: i,
      numMemLocations: testParams.numMemLocations,
      numOutputs: testParams.numOutputs,
      permuteFirst: testParams.permuteFirst,
      permuteSecond: testParams.permuteSecond,
      aliasedMemory: testParams.aliasedMemory
    };
    await doTest(pageState, params, pageState.activeShader.value, resultShaderCode, testState, keys);
    let config = {
      progress: 100,
      rate: Math.round((getCurrentIteration() / (reportTime()))),
      time: reportTime(),
      testState: testState,
      outputs: buildStaticRowOutputs(testState),
    }
    let row = <StaticRow pageState={pageState} key={params.id} params={params} config={config} />
    pageState.tuningRows.update(oldRows => [...oldRows, row]);
    pageState.tuningStats.update(curStats => {
      let newMax;
      let maxRows = curStats.maxWeakRows;
      if (testState.weak.internalState > curStats.maxWeak) {
        newMax = testState.weak.internalState;
        maxRows = [i + 1];
      } else if (testState.weak.internalState == curStats.maxWeak) {
        maxRows.push(i + 1);
        newMax = testState.weak.internalState;
      } else {
        newMax = curStats.maxWeak;
      }
      let newAverage = (curStats.averageWeak * i + testState.weak.internalState) / (i + 1);
      return {
        maxWeak: newMax,
        maxWeakRows: maxRows,
        averageWeak: newAverage
      }
    });
  }
}

export function makeTestPage(props) {
  const pageState = getPageState(props);
  const stressPanel = getStressPanel(props.testParams, pageState);
  let initialIterations = pageState.iterations.value;
  let initialTuningTimes = pageState.tuningTimes.value;
  let variantOptions;
  if ('variants' in props) {
    variantOptions = <VariantOptions variants={props.variants} pageState={pageState} uiParams={stressPanel.uiParams} testParams={props.testParams} />;
  } else {
    variantOptions = <></>;
  }
  return (
    <>
      <div className="columns">
        <div className="column">
          <h1 className="testName">{props.testName}</h1>
          <h2 className="testDescription">{props.testDescription}</h2>
        </div>
      </div>
      <div className=" columns">
        <div className=" column">
          <div className=" columns">
            <div className="column">
              <div className="columns">
                <div className="column">
                  <div className="tabs is-medium is-centered">
                    <ul>
                      <li className={setVis(pageState.pseudoActive.value, "is-active")} onClick={() => { pageState.pseudoActive.update(true); }}><a>Pseudo-Code</a></li>
                      <li className={setVis(!pageState.pseudoActive.value, "is-active")} onClick={() => { pageState.pseudoActive.update(false); }}><a>Source Code</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="columns">
                <div className="column">
                  <div className="px-2" id="tab-content">
                    {variantOptions}
                    <div id="pseudoCode" className={setVis(!pageState.pseudoActive.value, "is-hidden")}>
                      {props.pseudoCode.setup}
                      {pageState.activePseudoCode.value}
                    </div>
                    <div id="sourceCode" className={setVis(pageState.pseudoActive.value, "is-hidden")} >
                      <pre className="shaderCode"><code>
                        {pageState.activeShader.value}
                      </code></pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* here is the mode */}
          <div className="section " style={{ width: "700px" }}>
            <div className="columns is-6 ">
              <div className="column is-half ">
                <div className="button is-info " onClick={() => {
                  pageState.modeActive.update(false);
                }}>
                  Explorer Mode
                </div>
              </div>
              <div className="column is-half pl-6">
                <div className="button is-info " onClick={() => {
                  pageState.modeActive.update(true);
                }}>
                  Tuning Mode
                </div>
              </div>
            </div>
          </div>
          {pageState.modeActive.value
            ?
            <div className="container">

              <div className="columns">
                <div className="column">
                  <div className="control mb-2">
                    <label><b>Tuning Config Num:</b></label>
                    <input className="input" type="text" defaultValue={initialTuningTimes} onInput={(e) => {
                      pageState.tuningTimes.update(e.target.value);
                    }} disabled={pageState.running.value} />
                  </div>
                  <button className="button is-primary" onClick={() => {
                    pageState.resetTable.update(false);
                    pageState.tuningRows.value.splice(0, pageState.tuningRows.length);
                    random(pageState, props.testState, props.testParams, props.keys, props.buildStaticRowOutputs, props.resultShaderCode);
                    pageState.tuningActive.update(true);

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
              <div>
                <b>Max Weak Behaviors:</b> {pageState.tuningStats.value.maxWeak} <b>Rows:</b> {pageState.tuningStats.value.maxWeakRows.join(", ")}
              </div>
              <div>
                <b>Average Weak Behaviors:</b> {pageState.tuningStats.value.averageWeak}
              </div>
              {
                (pageState.tuningActive.value && !pageState.resetTable.value)
                  ? <TuningTable pageState={pageState} header={props.tuningHeader} dynamicRowOutputs={props.dynamicRowOutputs} />
                  : <></>
              }
            </div>
            : <div className="columns mr-2">
              <div className="column is-two-thirds">
                <div className="section">
                  <div className="columns">
                    <Bar
                      data={props.chartData}
                      options={chartConfig(pageState, props.testParams, stressPanel.uiParams, props.tooltipFilter)}
                    />
                  </div>
                </div>
                <div className="columns" >
                  <div className="column is-half">
                    <ProgressBar/>
                  </div>
                </div>
              </div>
              {stressPanel.jsx}
            </div>
          }
        </div>
      </div>
      {pageState.modeActive.value
        ?
        <div className="section"></div>
        :
        <div className="columns">
          <div className="column is-one-fifth">
            <div className="control">
              <label><b>Iterations:</b></label>
              <input className="input" type="text" defaultValue={initialIterations} onInput={(e) => {
                pageState.iterations.update(e.target.value);
              }} disabled={pageState.running.value} />
            </div>
            <div className="buttons mt-2">
              <button className="button is-primary" onClick={() => {
                doTest(pageState, props.testParams, pageState.activeShader.value, props.resultShaderCode, props.testState, props.keys);
                setProgressBarState();
                totalIteration = pageState.iterations.value;
              }} disabled={pageState.iterations.value < 0 || pageState.running.value}>Start Test</button>
            </div>
          </div>
          <div className="column">
            <div className="columns">
              <div className="column is-one-fifth">
                {pageState.running.value ? (<ReactBootStrap.Spinner animation="border" />) : (<><p></p></>)}
              </div>
              <div className="column">
                <p>Run time : {reportTime()} seconds</p>
                <p>Rate : {Math.round((getCurrentIteration() / (reportTime())))} iterations per second</p>
                <p>Time Remaining : {Math.floor((totalIteration - getCurrentIteration()) / (Math.round(getCurrentIteration() / (reportTime()))))} seconds </p>
              </div>
            </div>
          </div>
        </div>
      }
    </>

  );
}
export function getIterationNum() {
  return totalIteration;
}