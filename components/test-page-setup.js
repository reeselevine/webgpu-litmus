import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { runLitmusTest, reportTime, getCurrentIteration } from './litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';
import { getStressPanel, randomConfig }from './stressPanel.js';
import ProgressBar, { setProgressBarState } from '../components/progressBar';
import { clearState, handleResult, workgroupMemorySize } from './test-page-utils.js';
import TuningTable, { BuildStaticRows } from "../components/tuningTable"

function getPageState(props) {
  const [iterations, setIterations] = useState(1000);
  const [running, setRunning] = useState(false);
  const [pseudoActive, setPseudoActive] = useState(true);
  const [mode, setMode] = useState(false);
  const [tuning, setTuning] = useState(false);
  const [activePseudoCode, setActivePseudoCode] = useState(props.pseudoCode.code);
  const [activeShader, setActiveShader] = useState(props.shaderCode);
  const [activeVariant, setActiveVariant] = useState("default");
  const [tuningTimes, setTuningTimes] = useState(10);
  const [resetTable, setResetTable] = useState(false);
  const [progress, setProgress] = useState(0);
  //do next test if true, stop otherwise; change by tuningTable component
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
    activeVariant: {
      value: activeVariant,
      update: setActiveVariant
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
    tuningRows:{
      value: rows,
      update: setRows
    }
  
  }
}

async function doTest(pageState, testParams, shaderCode, testState, keys) {
  pageState.running.update(true);
  clearState(testState, keys);
   await runLitmusTest(shaderCode, testParams, pageState.iterations.value, handleResult(testState, keys)).then(
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
        props.pageState.activeVariant.update(e.target.value);
        if (e.target.value == "workgroup") {
          props.uiParams.testMemorySize.state.update(workgroupMemorySize);
          props.testParams['testMemorySize'] = workgroupMemorySize;
        }
      }} disabled={props.pageState.running.value}>
        {variantOptions}
      </select>
    </>)
}

let rows = [];
let currentParam;
let config;
//run litmus test for each random config and store config for displaying 
async function random(pageState, activeShader, testState, tuningTimes, keys){
 pageState.tuningRows.update([]);
 rows.splice(0,rows.length);
 pageState.running.update(true);
  for(let i =0; i<tuningTimes; i++){
    let obj = randomConfig();
    obj={...obj, 
        id:i,
        minWorkgroupSize: 1,
        maxWorkgroupSize: 1,
        numMemLocations: 2,
        numOutputs: 2,
        memoryAliases: {}
      }
    await doTest(pageState, obj, activeShader, testState, keys);
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
  pageState.tuningRows.update(rows);
}

export function makeTestPage(props) {
  const pageState = getPageState(props);
  const stressPanel = getStressPanel(props.testParams, pageState);
  let initialIterations = pageState.iterations.value;
  let initialTuningTimes = pageState.tuningTimes.value;
  let variantOptions;
  if ('variants' in props) {
    variantOptions = <VariantOptions variants={props.variants} pageState={pageState} uiParams={stressPanel.uiParams} testParams={props.testParams}/>;
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
                      pageState.tuningRows.value.splice(0,pageState.tuningRows.length);
                      random(pageState, pageState.activeShader.value, props.testState, pageState.tuningTimes.value, props.keys);
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