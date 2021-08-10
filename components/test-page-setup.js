import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { runLitmusTest, reportTime, getCurrentIteration } from './litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';
import StressPanel,{randomGenerater}from './stressPanel.js';
import ProgressBar, { setProgressBarState } from '../components/progressBar';
// import TuningTable from "../components/tuningTable"
function getPageState(props) {
  const [iterations, setIterations] = useState(1000);
  const [running, setRunning] = useState(false);
  const [pseudoActive, setPseudoActive] = useState(true);
  const [mode, setMode] = useState(false);
  const [tuning, setTuning] = useState(false);
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
    },
    modeActive:{
      value: mode,
      update: setMode
    },
    tuningActive:{
      value: tuning,
      update: setTuning
    }
  }
}

function doTest(pageState, testParams, shaderCode, testState) {
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
  const p = runLitmusTest(shaderCode, testParams, pageState.iterations.value, handleResult(testState, keys));
  p.then(
    success => {
      pageState.running.update(false);
      console.log("success!")
    },
    error => console.log(error)
  );
}

function clearState(state, keys) {
  for (const key of keys) {
    state[key].internalState = 0;
    state[key].syncUpdate(0);
  }
}

function handleResult(state, keys) {
  return function (result, memResult) {
    for (const key of keys) {
      if (state[key].resultHandler(result, memResult)) {
        state[key].internalState = state[key].internalState + 1;
        state[key].throttledUpdate(state[key].internalState);
        break;
      }
    }
  }
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
function random(params, updateParams){
  let array1 = ["round-robin", "chunking"];
  let array2 = ["load-store", "store-load", "load-load", "store-store"];
  let scratchMem = 4*params.stressLineSize*params.stressTargetLines;
  let testMem = params.memStride * Math.pow(2,6);
  let memStride_ = randomGenerater(1,128);
  let maxWorkgroups =  randomGenerater(4,1024);
  let minWorkgroups = maxWorkgroups+1;
  while(minWorkgroups > maxWorkgroups){
    minWorkgroups = randomGenerater(4,maxWorkgroups);;
  }
  let stressLineSize_ = randomGenerater(1,128);
  let stressTargetLines_ =  randomGenerater(1,128);
  scratchMem = 4*stressLineSize_ * stressTargetLines_;
  while(testMem > 4096){
    memStride_ = randomGenerater(1,128);
    testMem = memStride_ * Math.pow(2,6);
  }
  params.minWorkgroups = minWorkgroups, 
  params.maxWorkgroups = maxWorkgroups, 
  params.testMemorySize = testMem,
  params.memStride = memStride_,
  params.memStressIterations = randomGenerater(0,1024),
  params.preStressPct =randomGenerater(0,100),
  params.preStressIterations =  randomGenerater(0,2048),
  params.stressLineSize = stressLineSize_,
  params.stressTargetLines = stressTargetLines_,
  params.scratchMemorySize = scratchMem,
  params.shufflePct =randomGenerater(0,100),
  params.barrierPct = randomGenerater(0,100),
  params.memStressPct= randomGenerater(0,100),
  params.stressAssignmentStrategy = array1[Math.floor(Math.random() * 2)],
  params.memStressPattern = array2[Math.floor(Math.random() * 4)],
  params.preStressPattern = array2[Math.floor(Math.random() * 4)]
  updateParams(params);
  console.log(params);
}
//need to be fixed
// var arrayObj = [];
// function doTuning(params, updateParams ,numTuning){
//   for(let i = 0; i<=numTuning; i++){
//    random(params,updateParams);
//     let obj = {
//       id: i,
//       value: params
//     };
//     arrayObj.push(obj);
//   }
//     console.log(arrayObj)
//    console.log(Array.isArray(arrayObj))
//    //console.log(arrayObj)
//    return arrayObj;
// }

function handleTuning(params,numTuning, updateParams,updateParamArray){
  
  const array = doTuning(params,updateParams,numTuning);
  console.log(array)
  updateParamArray(array);
}

export function makeTestPage(props) {
  const pageState = getPageState(props);
  let temp = props.testParams
  const [params, setParams] = useState(temp);
  const [paramArray, setParamArray] = useState([]);
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
                <button className="button is-primary" onClick={()=>{
                  // console.log(params)
                  // handleTuning(params, 3, setParams,setParamArray);
                  // pageState.tuningActive.update(true);
                }}>
                  Start Tuning
                </button>
                {/* {console.log(Array.isArray(paramArray))}
                {pageState.tuningActive.value? <TuningTable params={paramArray}></TuningTable>:<></> } */}
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