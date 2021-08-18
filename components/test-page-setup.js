import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { runLitmusTest, reportTime, getCurrentIteration } from './litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';
import StressPanel,{randomGenerator}from './stressPanel.js';
import ProgressBar, { setProgressBarState } from '../components/progressBar';
import TuningTable from "../components/tuningTable"
import { clearState, handleResult } from './test-page-utils.js';

function getPageState(props) {
  const [iterations, setIterations] = useState(1000);
  const [running, setRunning] = useState(false);
  const [pseudoActive, setPseudoActive] = useState(true);
  const [mode, setMode] = useState(false);
  const [tuning, setTuning] = useState(false);
  const [activePseudoCode, setActivePseudoCode] = useState(props.pseudoCode.code);
  const [activeShader, setActiveShader] = useState(props.shaderCode);
  const [tuningTimes, setTuningTimes] = useState(10);
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
    }
  }
}

function doTest(pageState, testParams, shaderCode, testState, keys) {
  var keys;
  pageState.running.update(true);
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
function random(paramsref){
  const [params, setRandom] = useState(paramsref)
  let array1 = ["round-robin", "chunking"];
  let array2 = ["load-store", "store-load", "load-load", "store-store"];
  let scratchMem = 4*params.stressLineSize*params.stressTargetLines;
  let testMem = params.memStride * Math.pow(2,6);
  let memStride_ = randomGenerator(1,128);
  let maxWorkgroups =  randomGenerator(4,1024);
  let minWorkgroups = maxWorkgroups+1;
  while(minWorkgroups > maxWorkgroups){
    minWorkgroups = randomGenerator(4,maxWorkgroups);;
  }
  let stressLineSize_ = randomGenerator(1,128);
  let stressTargetLines_ =  randomGenerator(1,128);
  scratchMem = 4*stressLineSize_ * stressTargetLines_;
  while(testMem > 4096){
    memStride_ = randomGenerator(1,128);
    testMem = memStride_ * Math.pow(2,6);
  }
  setRandom({
      minWorkgroups : minWorkgroups, 
      maxWorkgroups : maxWorkgroups, 
      testMemorySize : testMem,
      memStride : memStride_,
      memStressIterations : randomGenerater(0,1024),
      preStressPct :randomGenerater(0,100),
      preStressIterations :  randomGenerater(0,2048),
      stressLineSize : stressLineSize_,
      stressTargetLines : stressTargetLines_,
      shufflePct : randomGenerater(0,100),
      barrierPct : randomGenerater(0,100),
      memStressPct : randomGenerater(0,100),
      scratchMemorySize : scratchMem,
      stressAssignmentStrategy : array1[Math.floor(Math.random() * 2)],
      memStressPattern : array2[Math.floor(Math.random() * 4)],
      preStressPattern : array2[Math.floor(Math.random() * 4)]
  })
  
  console.log(params);
}
//need to be fixed
var arrayObj = [];
function doTuning(params ,numTuning){
  for(let i = 0; i<=numTuning; i++){
   random(params);
    let obj = {
      id: i,
      value: params
    };
    arrayObj.push(obj);
  }
    console.log(arrayObj)
   console.log(Array.isArray(arrayObj))
   //console.log(arrayObj)
   return arrayObj;
}

function handleTuning(params,numTuning,updateParamArray){
  
  const array = doTuning(params,numTuning);
  console.log(array)
  updateParamArray(array);
}

export function makeTestPage(props) {
  const pageState = getPageState(props);
  // let temp = props.testParams
  // const [params, setParams] = useState(temp);
  const [paramArray, setParamArray] = useState([]);
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
                  <div className="column is-one-fifth">
                    <div className="control mb-4">
                      <label><b>Tuning Times:</b></label>
                      <input className="input" type="text" defaultValue={initialTuningTimes} onInput={(e) => {
                        pageState.tuningTimes.update(e.target.value);
                      }} />
                     </div>
                    <button className="button is-primary" onClick={()=>{
                     // console.log(params)
                      // handleTuning(params, pageState.tuningTimes.value,setParamArray);
                      for(let i = 0; i < pageState.tuningTimes.value; i++ ){
                        random(props.testParams);
                      }
                      pageState.tuningActive.update(true);
                    }}>
                      Start Tuning
                    </button>
                   </div>
                </div>
                {console.log(Array.isArray(paramArray))}
                {pageState.tuningActive.value? <TuningTable params={paramArray} pageState={pageState}></TuningTable>:<></> }
           </div>
          : <div className="columns mr-2">
            <div className="column is-two-thirds">
              <div className="section">
                <div className="columns">
                <Bar
                data={props.chartData}
                options={chartConfig(pageState, props.tooltipFilter)}
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
              doTest(pageState, props.testParams, pageState.activeShader.value, props.testState, props.keys);
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