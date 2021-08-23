import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { runLitmusTest, reportTime, getCurrentIteration } from './litmus-setup.js'
import { clearState, handleResult,buildThrottle } from './test-page-utils.js';
import * as ReactBootStrap from 'react-bootstrap';
import StressPanel,{randomGenerator}from './stressPanel.js';
import ProgressBar, { setProgressBarState } from '../components/progressBar';
import TuningTable, { BuildStaticRows } from "../components/tuningTable"

const keys = ["seq", "interleaved", "weak"];

function getPageState(props) {
  const [iterations, setIterations] = useState(1000);
  const [running, setRunning] = useState(false);
  const [pseudoActive, setPseudoActive] = useState(true);
  const [mode, setMode] = useState(false);
  const [tuning, setTuning] = useState(false);
  const [activePseudoCode, setActivePseudoCode] = useState(props.pseudoCode.code);
  const [activeShader, setActiveShader] = useState(props.shaderCode);
  const [tuningTimes, setTuningTimes] = useState(10);
  const [resetTable, setResetTable] = useState(false);
  const [progress, setProgress] = useState(0);
  //do next test if ture, stop otherwise; change by tuningTable component
  const [renderTable, setRender] = useState(false);
  const [rows, setRows] = useState([]);
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
    modeActive:{
      value: mode,
      update: setMode
    },
    tuningActive:{
      value: tuning,
      update: setTuning
    },
    tuningTimes:{
      value: tuningTimes,
      update: setTuningTimes
    },
    resetTable:{
      value: resetTable,
      update: setResetTable
    },
    progress:{
      value: progress,
      update: setProgress
    },
    renderTable:{
      value: renderTable,
      update: setRender
    },
    rows:{
      value: rows,
      update: setRows
    }
  
  }
}

function updateStateAndHandleResult(pageState, testState,keys) {
  const fn = handleResult(testState, keys);
  return function (result, memResult) {
    let time = reportTime();
    let curIter = getCurrentIteration();
    var rate;
    if (time == 0) {
      rate == 0;
    } else {
      rate = Math.round(curIter / time);
    }
    //console.log(Math.floor(curIter * 100 / pageState.iterations.value))
    pageState.progress.update(Math.floor(getCurrentIteration() * 100 / pageState.iterations.value));
    console.log( pageState.progress.value)
    // testState.rate.update(rate);
    // testState.time.update(time);
    fn(result, memResult);
  }
}

async function doTest(pageState, testParams, shaderCode, testState) {
  console.log("do test")
  console.log(testParams)
  var keys;
  pageState.running.update(true);
  if (testState.numOutputs == 1) {
    keys = ["seq", "weak"];
  } else if (testState.numOutputs == 2) {
    keys = ["seq0", "seq1", "interleaved", "weak"];
  } else if (testState.numOutputs == 4) {
    keys = ["seq", "interleaved", "weak"];
  }
  clearState(testState, keys);
  console.log("start a test")
   await runLitmusTest(shaderCode, testParams, pageState.iterations.value, handleResult(testState, keys)).then(
    success => {
      pageState.running.update(false);
      console.log("success!")
     
    },
    error => console.log(error)
  );
  //return 1;
}



function chartData(testState) {
  if (testState.numOutputs == 1) {
    return oneOutputChartData(testState);
  } else if (testState.numOutputs == 2) {
    return twoOutputChartData(testState);
  } else if (testState.numOutputs == 4) {
    return fourOutputChartData(testState);
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

function fourOutputChartData(testState) {
  return {
    labels: [testState.seq.label, testState.interleaved.label, testState.weak.label],
    datasets: [
      {
        label: "Sequential",
        backgroundColor: 'rgba(21,161,42,0.7)',
        grouped: false,
        data: [testState.seq.visibleState, null, null]
      },
      {
        label: "Sequential Interleaving",
        backgroundColor: 'rgba(3,35,173,0.7)',
        grouped: false,
        data: [null, testState.interleaved.visibleState, null]
      },
      {
        label: "Weak Behavior",
        backgroundColor: 'rgba(212,8,8,0.7)',
        grouped: false,
        data: [null, null, testState.weak.visibleState]
      }
    ]
  }
}

function commonTooltipFilter(tooltipItem, data) {
  return tooltipItem.datasetIndex == tooltipItem.dataIndex;
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
  if (testState.numOutputs == 2) {
    tooltipFilter = twoOutputTooltipFilter;
  } else {
    tooltipFilter = commonTooltipFilter;
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
      <label><b>Choose variant:</b></label>
      <select className="dropdown" name="variant" onChange={(e) => {
        props.pageState.activePseudoCode.update(props.variants[e.target.value].pseudo);
        props.pageState.activeShader.update(props.variants[e.target.value].shader);
      }} disabled={props.pageState.running.value}>
        {variantOptions}
      </select>
    </>)
}

let rows = [];
let currentParam;
let config;
//run litmus test for each random config and store config for displaying 
async function random(pageState, activeShader, testState,tuningTimes){
 pageState.rows.update([]);
 rows.splice(0,rows.length);
 var keys;
 pageState.running.update(true);
 if (testState.numOutputs == 1) {
   keys = ["seq", "weak"];
 } else if (testState.numOutputs == 2) {
   keys = ["seq0", "seq1", "interleaved", "weak"];
 } else if (testState.numOutputs == 4) {
   keys = ["seq", "interleaved", "weak"];
 }
 clearState(testState, keys);
  for(let i =0; i<tuningTimes; i++){
    let array1 = ["round-robin", "chunking"];
    let array2 = ["load-store", "store-load", "load-load", "store-store"];
    let maxWorkgroups =  randomGenerator(4,1024);
    let minWorkgroups = randomGenerator(4, maxWorkgroups);
    let stressLineSize = Math.pow(2, randomGenerator(1,10));
    let stressTargetLines = randomGenerator(1,16);
    let memStride = Math.pow(2, randomGenerator(1, 9));
    let obj ={
      id: i,
      minWorkgroups: minWorkgroups ,
      maxWorkgroups: maxWorkgroups,
      minWorkgroupSize: 1,
      maxWorkgroupSize: 1,
      testMemorySize:  memStride * 128,
      memStride: memStride,
      memStressIterations: randomGenerator(0,1024),
      preStressPct: randomGenerator(0,100),
      preStressIterations: randomGenerator(0,2048),
      stressLineSize : stressLineSize,
      stressTargetLines: stressTargetLines,
      shufflePct: randomGenerator(0,100),
      barrierPct: randomGenerator(0,100),
      memStressPct :randomGenerator(0,100),
      scratchMemorySize : 32 * stressLineSize * stressTargetLines,
      stressAssignmentStrategyName : array1[Math.floor(Math.random() * 2)],
      memStressPatternName: array2[Math.floor(Math.random() * 4)],
      preStressPatternName: array2[Math.floor(Math.random() * 4)],
      stressAssignmentStrategy : Math.floor(Math.random() * 2),
      memStressPattern: Math.floor(Math.random() * 4),
      preStressPattern: Math.floor(Math.random() * 4),
      numMemLocations: 2,
      numOutputs: 2,
      memoryAliases: {}
    }
    await doTest(pageState, obj, activeShader, testState);
     config ={
      progress: 100,
      rate: Math.round((getCurrentIteration() / (reportTime()))),
      time: reportTime(),
      seq0: testState.seq0.internalState,
      seq1: testState.seq1.internalState,
      interleaved: testState.interleaved.internalState,
      weak: testState.weak.internalState,
    }
    //call component here with the current config 
    currentParam = obj
    let row = <BuildStaticRows pageState={pageState} key={obj.id} params={obj} config={config} rows={rows}></BuildStaticRows>
    rows.push(row);
  }
  pageState.rows.update(rows);
  console.log(rows)
}


export function makeTestPage(props) {
  const pageState = getPageState(props);
  let initialIterations = pageState.iterations.value;
  let initialTuningTimes = pageState.tuningTimes.value;
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
         <div className="section " style={{width:"700px"}}>
            <div className="columns is-6 ">
              <div className="column is-half ">
                <div className="button is-info " onClick={()=>{
                  pageState.modeActive.update(false);
                }}>
                    Explorer Mode
                </div>
              </div>
              <div className="column is-half pl-6">
                <div className="button is-info " onClick={()=>{
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
                  <div className="column  is-two-fifth">
                    <div className="control mb-2">
                      <label><b>Tuning Config Num:</b></label>
                      <input className="input" type="text" defaultValue={initialTuningTimes} onInput={(e) => {
                        pageState.tuningTimes.update(e.target.value);
                      }} />
                     </div>
                    <button className="button is-primary" onClick={()=>{
                      pageState.resetTable.update(false);
                      pageState.rows.value.splice(0,pageState.rows.length);
                      random(pageState, pageState.activeShader.value, props.testState, pageState.tuningTimes.value);
                      pageState.tuningActive.update(true);
                      
                    }}>
                      Start Tuning
                    </button>
                  </div>
                  <div className="column is-two-fifth" >
                    <div className="control">
                      <label><b>Iterations:</b></label>
                      <input className="input" type="text" defaultValue={initialIterations} onInput={(e) => {
                        pageState.iterations.update(e.target.value);
                      }} disabled={pageState.running.value}/>
                    </div>
                  </div>

                </div>  
                {
                (pageState.tuningActive.value && !pageState.resetTable.value)
                  ? <TuningTable params={currentParam} pageState={pageState} testState={props.testState} ></TuningTable>
                  :<></>
                }
           </div>
          : <div className="columns mr-2">
            <div className="column is-two-thirds">
              <div className="section">
                <div className="columns">
                <Bar
                data={chartData(props.testState)}
                options={chartConfig(pageState, props.testState)}
              />
                </div>
              </div>
              <div className="columns" >
                <div className="column" style={{ width: '300px', paddingLeft: '0px' }}>
                  <div className="column " style={{ width: "200px" }}>
                    <ProgressBar ></ProgressBar>
                  </div>
                </div>
              </div>
            </div>
            <StressPanel params={props.testParams} pageState={pageState}></StressPanel>
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
            }} disabled={pageState.running.value}/>
          </div>
          <div className="buttons mt-2">
            <button className="button is-primary" onClick={() => {
              console.log(props.testParams);
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
      }
    </>
    
  );
}

export function getIterationNum() {
  return totalIteration;
}