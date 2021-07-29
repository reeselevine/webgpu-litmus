import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { runLitmusTest, reportTime, getCurrentIteration } from './litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';
import StressPanel from './stressPanel.js';
import ProgressBar, { setProgressBarState } from '../components/progressBar';

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

function doTest(pageState, testParams, shaderCode, clearState, handleResult) {
  pageState.running.update(true);
  clearState();
  const p = runLitmusTest(shaderCode, testParams, pageState.iterations.value, handleResult);
  p.then(
    success => {
      pageState.running.update(false);
      console.log("success!")
    },
    error => console.log(error)
  );

}

function chartConfig(pageState, tooltipFilter) {
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

let totalIteration = 0;

export function makeTestPage(
  props,
  testParams,
  pseudoCode) {
  const pageState = getPageState();
  let initialIterations = pageState.iterations.value;
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
                    <div id="pseudoCode" className={setVis(!pageState.pseudoActive.value, "is-hidden")}>
                      {pseudoCode.setup}
                      <div className="columns">
                        {pseudoCode.code}
                      </div>
                    </div>
                    <div id="sourceCode" className={setVis(pageState.pseudoActive.value, "is-hidden")} >
                      <pre className="shaderCode"><code>
                        {props.shaderCode}
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
                data={props.chartData}
                options={chartConfig(pageState, props.chartFilter)}
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
        <StressPanel params={testParams} pageState={pageState}></StressPanel>
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
              doTest(pageState, testParams, props.shaderCode, props.clearState, props.handleResult);
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
