import React,{ useState } from 'react';
import _ from 'lodash'
import { Bar } from 'react-chartjs-2';
import { runLitmusTest } from './litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';
import StressPanel from './stressPanel.js';

function getTwoOutputState() {
    const [bothOneVal, setBothOne] = useState(0);
    const [oneZeroVal, setOneZero] = useState(0);
    const [zeroOneVal, setZeroOne] = useState(0);
    const [bothZeroVal, setBothZero] = useState(0);
    return {
        bothOne: {
            visibleState: bothOneVal,
            internalState: 0,
            syncUpdate: setBothOne,
            throttledUpdate: buildThrottle(setBothOne)
        },
        bothZero: {
            visibleState: bothZeroVal,
            internalState: 0,
            syncUpdate: setBothZero,
            throttledUpdate: buildThrottle(setBothZero)
        },
        zeroOne: {
            visibleState: zeroOneVal,
            internalState: 0,
            syncUpdate: setZeroOne,
            throttledUpdate: buildThrottle(setZeroOne)
        },
        oneZero: {
            visibleState: oneZeroVal,
            internalState: 0,
            syncUpdate: setOneZero,
            throttledUpdate: buildThrottle(setOneZero)
        }
    }
}

function handleTwoStateResult(state) {
    return function(result) {
        if (result[0] == 1 && result[1] == 1) {
            state.bothOne.internalState = state.bothOne.internalState + 1;
            state.bothOne.throttledUpdate(state.bothOne.internalState);
        } else if (result[0] == 0 && result[1] == 0) {
            state.bothZero.internalState = state.bothZero.internalState + 1;
            state.bothZero.throttledUpdate(state.bothZero.internalState);
        } else if (result[0] == 0 && result[1] == 1) {
            state.zeroOne.internalState = state.zeroOne.internalState + 1;
            state.zeroOne.throttledUpdate(state.zeroOne.internalState);
        } else if (result[0] == 0 && result[1] == 0) {
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
    const [loading, setLoading] = useState(false);
    const [pseudoActive, setPseudoActive] = useState(true);
    return {
        iterations: {
            value: iterations,
            updateFunc: setIterations
        },
        loading: {
            value: loading,
            updateFunc: setLoading
        },
        pseudoActive: {
            value: pseudoActive,
            updateFunc: setPseudoActive
        }
    }
}

function doTwoOutputTest(pageState, testState, testParams, shaderCode) {
    pageState.loading.updateFunc(true);
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
        pageState.loading.updateFunc(false);
        console.log("success!")
      },
      error => console.log(error)
    );
}

function chartData(testState) {
    return {
        labels: ["r0=1 and r1=1", "r0=0 and r1=0", "r0=0 and r1=1", "r0=1 and r1=0"],
        datasets: [
            {
                label: "Sequential Interleaving",
                backgroundColor: 'rgba(3,35,173,0.7)',
                data: []
            },
            {
                label: "Sequential",
                backgroundColor: ['rgba(21,161,42,0.7)', 'rgba(21,161,42,0.7)', 'rgba(3,35,173,0.7)', 'rgba(212,8,8,0.7)'],
                data: [testState.bothOne.visibleState, testState.bothZero.visibleState, testState.zeroOne.visibleState, testState.oneZero.visibleState]
            },
            {
                label: "Weak Behavior",
                backgroundColor: 'rgba(212,8,8,0.7)',
                data: []
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

export function makeTwoOutputTest(testParams, testName, testDescription, shaderCode) {
    const testState = getTwoOutputState();
    const pageState = getPageState();
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
                <div className="columns">
                  <div className="column">
                    <div className="tabs is-medium is-centered">
                      <ul>
                        <li className={setVis(pageState.pseudoActive.value, "is-active")} onClick={()=>{pageState.pseudoActive.updateFunc(true);}}><a>Pseudo-Code</a></li>
                        <li className={setVis(!pageState.pseudoActive.value, "is-active")} onClick={()=>{pageState.pseudoActive.updateFunc(false);}}><a>Source Code</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="columns">
                  <div className="column">
                    <div className="px-2" id="tab-content">
                        <div id="pseudoCode" className={setVis(!pageState.pseudoActive.value, "is-hidden")}>
                            <p>Pseudocode goes here</p>
                        </div>
                        <div id="sourceCode" className={setVis(pageState.pseudoActive.value, "is-hidden")}>
                            <p>Source code goes here</p>
                        </div>
                    </div>
                  </div>          
                </div>
              </div>
            </div>
            <div className="columns is-one-fifth">
              <div className="column">
                    <Bar
                      data={chartData(testState)}
                      options={chartConfig(pageState)}
                    />
              </div>
            </div>
          </div>
          <StressPanel params={testParams}></StressPanel>
        </div>
        <div className="columns">
          <div className="column is-one-fifth">
          <div className="control">
            <input className="input" type="text" placeholder="Iterations" onInput={(e) => {
                    pageState.iterations.updateFunc(e.target.value);
            }}/>
          </div>
          <div className="buttons mt-2">
            <button className="button is-primary" onClick={()=>{
                    doTwoOutputTest(pageState, testState, testParams, shaderCode);
                  }} disabled={pageState.iterations.value < 0}>Start Test</button>
          </div>
          </div>
          <div className="column">
                {pageState.loading.value ? (<ReactBootStrap.Spinner animation="border" />) : (<><p></p></>)}
          </div>
        </div>
      </>
    );
}