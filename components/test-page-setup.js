import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { runLitmusTest, reportTime, getCurrentIteration } from './litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';
import StressPanel from './stressPanel.js';
import ProgressBar, { setProgressBarState } from '../components/progressBar';

function getPageState(props) {
  const [iterations, setIterations] = useState(1000);
  const [running, setRunning] = useState(false);
  const [pseudoActive, setPseudoActive] = useState(true);
  const [activePseudoCode, setActivePseudoCode] = useState(props.pseudoCode.code);
  const [activeShader, setActiveShader] = useState(props.shaderCode);
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
    }
  }
}

function doTest(pageState, testParams, shaderCode, testState) {
  var handler;
  pageState.running.update(true);
  if (testState.numOutputs == 1) {
    clearOneOutputState(testState);
    handler = handleOneOutputResult(testState);
  } else if (testState.numOutputs == 2) {
    clearTwoOutputState(testState);
    handler = handleTwoOutputResult(testState);
  }
  const p = runLitmusTest(shaderCode, testParams, pageState.iterations.value, handler);
  p.then(
    success => {
      pageState.running.update(false);
      console.log("success!")
    },
    error => console.log(error)
  );
}

function clearOneOutputState(state) {
  state.seq.internalState = 0;
  state.seq.syncUpdate(0);
  state.weak.internalState = 0;
  state.weak.syncUpdate(0);
}

export function clearTwoOutputState(state) {
  state.seq0.internalState = 0;
  state.seq0.syncUpdate(0);
  state.seq1.internalState = 0;
  state.seq1.syncUpdate(0);
  state.interleaved.internalState = 0;
  state.interleaved.syncUpdate(0);
  state.weak.internalState = 0;
  state.weak.syncUpdate(0);
}

export function handleOneOutputResult(state) {
  return function (result, memResult) {
    if (state.seq.resultHandler(result, memResult)) {
      state.seq.internalState = state.seq.internalState + 1;
      state.seq.throttledUpdate(state.seq.internalState);
    } else if (state.weak.resultHandler(result, memResult)) {
      state.weak.internalState = state.weak.internalState + 1;
      state.weak.throttledUpdate(state.weak.internalState);
    }
  }
}

export function handleTwoOutputResult(state) {
  return function (result, memResult) {
    if (state.seq0.resultHandler(result, memResult)) {
      state.seq0.internalState = state.seq0.internalState + 1;
      state.seq0.throttledUpdate(state.seq0.internalState);
    } else if (state.seq1.resultHandler(result, memResult)) {
      state.seq1.internalState = state.seq1.internalState + 1;
      state.seq1.throttledUpdate(state.seq1.internalState);
    } else if (state.interleaved.resultHandler(result, memResult)) {
      state.interleaved.internalState = state.interleaved.internalState + 1;
      state.interleaved.throttledUpdate(state.interleaved.internalState);
    } else if (state.weak.resultHandler(result, memResult)) {
      state.weak.internalState = state.weak.internalState + 1;
      state.weak.throttledUpdate(state.weak.internalState);
    }
  }
}

function chartData(testState) {
  if (testState.numOutputs == 1) {
    return oneOutputChartData(testState);
  } else if (testState.numOutputs == 2) {
    return twoOutputChartData(testState);
  }
}

function oneOutputChartData(testState) {
  return {
    labels: [testState.seq.label, testState.weak.label],
    datasets: [
      {
        label: "Sequential",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [testState.seq.visibleState, null]
      },
      {
        label: "Weak Behavior",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, testState.weak.visibleState]
      }
    ]
  }
}

function twoOutputChartData(testState) {
  return {
    labels: [testState.seq0.label, testState.seq1.label, testState.interleaved.label, testState.weak.label],
    datasets: [
      {
        label: "Sequential",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [testState.seq0.visibleState, testState.seq1.visibleState, null, null]
      },
      {
        label: "Sequential Interleaving",
        backgroundColor: 'rgba(3,35,173,0.7)',
        grouped: false,
        data: [null, null, testState.interleaved.visibleState, null]
      },
      {
        label: "Weak Behavior",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, null, null, testState.weak.visibleState]
      }
    ]
  }
}

function oneOutputTooltipFilter(tooltipItem, data) {
    if (tooltipItem.datasetIndex == 0 && tooltipItem.dataIndex == 0) {
        return true;
    } else if (tooltipItem.datasetIndex == 1 && tooltipItem.dataIndex == 1) {
        return true;
    } else {
        return false;
    }
}


function twoOutputTooltipFilter(tooltipItem, data) {
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

function chartConfig(pageState, testState) {
  var tooltipFilter;
  if (testState.numOutputs == 1) {
    tooltipFilter = oneOutputTooltipFilter;
  } else if (testState.numOutputs == 2) {
    tooltipFilter = twoOutputTooltipFilter;
  }
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

function DropdownOption(props) {
  return (<option value={props.value}>{props.value}</option>)
}

let totalIteration = 0;

function VariantOptions(props) {
  const variantOptions = Object.keys(props.variants).map(key => <DropdownOption value={key} key={key}/>)
  return (
    <>
      <label>Choose variant:</label>
      <select name="variant" onChange={(e) => {
        props.pageState.activePseudoCode.update(props.variants[e.target.value].pseudo);
        props.pageState.activeShader.update(props.variants[e.target.value].shader);
      }}>
        {variantOptions}
      </select>
    </>)

}

export function makeTestPage(props) {
  const pageState = getPageState(props);
  let initialIterations = pageState.iterations.value;
  let variantOptions;
  if ('variants' in props) {
    variantOptions = <VariantOptions variants={props.variants} pageState={pageState}/>;
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
                      <div className="columns">
                        {pageState.activePseudoCode.value}
                      </div>
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
          <div className="columns">
            <div className="column">
              <Bar
                data={chartData(props.testState)}
                options={chartConfig(pageState, props.testState)}
              />
            </div>
          </div>
          <div className="columns" >
            <div className="column" style={{ width: '300px', paddingLeft: '0px' }}>
              <div className="column " style={{ width: "200px" }}>
                <ProgressBar></ProgressBar>
              </div>
            </div>
          </div>
        </div>
        <StressPanel params={props.testParams} pageState={pageState}></StressPanel>
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
              doTest(pageState, props.testParams, pageState.activeShader.value, props.testState);
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
