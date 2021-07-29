import React, { useState } from 'react';
import _ from 'lodash'
import { Bar } from 'react-chartjs-2';
import { runLitmusTest, reportTime, getCurrentIteration } from './litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';
import StressPanel from './stressPanel.js';
import ProgressBar, { setProgressBarState } from '../components/progressBar';

export function getTwoOutputState() {
  const [bothOneVal, setBothOne] = useState(0);
  const [oneZeroVal, setOneZero] = useState(0);
  const [zeroOneVal, setZeroOne] = useState(0);
  const [bothZeroVal, setBothZero] = useState(0);
  return {
    bothOne: {
      visibleState: bothOneVal,
      internalState: 0,
      syncUpdate: setBothOne,
      throttledUpdate: buildThrottle(setBothOne),
      label: "r0=1 and r1=1"
    },
    bothZero: {
      visibleState: bothZeroVal,
      internalState: 0,
      syncUpdate: setBothZero,
      throttledUpdate: buildThrottle(setBothZero),
      label: "r0=0 and r1=0"
    },
    zeroOne: {
      visibleState: zeroOneVal,
      internalState: 0,
      syncUpdate: setZeroOne,
      throttledUpdate: buildThrottle(setZeroOne),
      label: "r0=0 and r1=1"
    },
    oneZero: {
      visibleState: oneZeroVal,
      internalState: 0,
      syncUpdate: setOneZero,
      throttledUpdate: buildThrottle(setOneZero),
      label: "r0=1 and r1=0"
    }
  }
}

function handleTwoStateResult(state) {
  return function (result) {
    if (result[0] == 1 && result[1] == 1) {
      state.bothOne.internalState = state.bothOne.internalState + 1;
      state.bothOne.throttledUpdate(state.bothOne.internalState);
    } else if (result[0] == 0 && result[1] == 0) {
      state.bothZero.internalState = state.bothZero.internalState + 1;
      state.bothZero.throttledUpdate(state.bothZero.internalState);
    } else if (result[0] == 0 && result[1] == 1) {
      state.zeroOne.internalState = state.zeroOne.internalState + 1;
      state.zeroOne.throttledUpdate(state.zeroOne.internalState);
    } else if (result[0] == 1 && result[1] == 0) {
      state.oneZero.internalState = state.oneZero.internalState + 1;
      state.oneZero.throttledUpdate(state.oneZero.internalState);
    }
  }
}

function buildThrottle(updateFunc) {
  return _.throttle((newValue) => updateFunc(newValue), 50);
}

function getPageState() {
  const [iterations, setIterations] = useState(1000);
  const [running, setRunning] = useState(false);
  const [pseudoActive, setPseudoActive] = useState(true);
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
    }
  }
}

function doTwoOutputTest(pageState, testState, testParams, shaderCode) {
  pageState.running.update(true);
  testState.bothOne.internalState = 0;
  testState.bothOne.syncUpdate(0);
  testState.bothZero.internalState = 0;
  testState.bothZero.syncUpdate(0);
  testState.zeroOne.internalState = 0;
  testState.zeroOne.syncUpdate(0);
  testState.oneZero.internalState = 0;
  testState.oneZero.syncUpdate(0);
  const p = runLitmusTest(shaderCode, testParams, pageState.iterations.value, handleTwoStateResult(testState));
  p.then(
    success => {
      pageState.running.update(false);
      console.log("success!")
    },
    error => console.log(error)
  );
}

function chartData(behaviors) {
  return {
    labels: [behaviors.sequential[0].label, behaviors.sequential[1].label, behaviors.interleaved.label, behaviors.weak.label],
    datasets: [
      {
        label: "Sequential",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [behaviors.sequential[0].visibleState, behaviors.sequential[1].visibleState, null, null]
      },
      {
        label: "Sequential Interleaving",
        backgroundColor: 'rgba(3,35,173,0.7)',
        grouped: false,
        data: [null, null, behaviors.interleaved.visibleState, null]
      },
      {
        label: "Weak Behavior",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, null, null, behaviors.weak.visibleState]
      }
    ]
  }
}

function chartConfig(pageState) {
  return {
    plugins: {
      title: {
        display: true,
        position: "top",
        text: ['Histogram of Observed Behaviors', 'Log Scale'],
        fontSize: 20
      },
      tooltip: {
        filter: function (tooltipItem, data) {
          if (tooltipItem.datasetIndex == 0 && tooltipItem.dataIndex < 2) {
            return true;
          } else if (tooltipItem.datasetIndex == 1 && tooltipItem.dataIndex == 2) {
            return true;
          } else if (tooltipItem.datasetIndex == 2 && tooltipItem.dataIndex == 3) {
            return true;
          } else {
            return false;
          }
        }
      }

    },
    scales: {
      yAxis: {
        axis: 'y',
        type: 'logarithmic',
        min: 0.1,
        max: pageState.iterations.value,
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

function setVis(stateVar, str) {
  if (stateVar) {
    return str
  } else {
    return ""
  }
}
let totalIteration = 0;

export function makeTwoOutputTest(
  testParams,
  testName,
  testDescription,
  shaderCode,
  pseudoCode,
  testState,
  behaviors) {
  const pageState = getPageState();
  let initialIterations = pageState.iterations.value;
  return (
    <>
      <div className="columns">
        <div className="column">
          <h1 className="testName">{testName}</h1>
          <h2 className="testDescription">{testDescription}</h2>
        </div>
      </div>
      <div className=" columns">
        <div className=" column">
          <div className=" columns">
            <div className="column">
              <div className="columns mr-2">
                <div className="column">
                  <div className="tabs is-medium is-centered">
                    <ul>
                      <li className={setVis(pageState.pseudoActive.value, "is-active")} onClick={() => { pageState.pseudoActive.update(true); }}><a>Pseudo-Code</a></li>
                      <li className={setVis(!pageState.pseudoActive.value, "is-active")} onClick={() => { pageState.pseudoActive.update(false); }}><a>Source Code</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="columns mr-2">
                <div className="column">
                  <div className="px-2" id="tab-content">
                    <div id="pseudoCode" className={setVis(!pageState.pseudoActive.value, "is-hidden")}>
                      {pseudoCode.setup}
                      <div className="columns">
                        {pseudoCode.code}
                      </div>
                    </div>
                    <div id="sourceCode" className={setVis(pageState.pseudoActive.value, "is-hidden")} >
                      <pre className="shaderCode"><code>
                        {shaderCode}
                      </code></pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* here is the mode */}
          <div className="section " style={{width:"700px", margin:"auto"}}>
            <div className="columns is-6 ">
              <div className="column is-half ">
                <div className="button is-info ">
                    Explorer Mode
                </div>
              </div>
              <div className="column is-half pl-6">
                <div className="button is-info ">
                    Tuning Mode 
                </div>
              </div>
            </div>
          </div>
          <div className="columns mr-2">
            <div className="column is-two-thirds">
              <div className="section">
                <div className="columns">
                  <Bar
                    data={chartData(behaviors)}
                    options={chartConfig(pageState)}
                  />
                </div>
              </div>
            </div>
            <StressPanel params={testParams} pageState={pageState}></StressPanel>
          </div>
          <div className="columns" >
            <div className="column" style={{ width: '300px', paddingLeft: '0px' }}>
              <div className="column " style={{ width: "200px" }}>
                <ProgressBar></ProgressBar>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column is-one-fifth">
          <div className="control">
            <label><b>Iterations:</b></label>
            <input className="input" type="text" defaultValue={initialIterations} onInput={(e) => {
              pageState.iterations.update(e.target.value);
            }} disabled={pageState.running.value}/>
          </div>
          <div className="buttons mt-2">
            <button className="button is-primary" onClick={() => {
              doTwoOutputTest(pageState, testState, testParams, shaderCode);
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
    </>
  );
}

export function getIterationNum() {
  return totalIteration;
}
