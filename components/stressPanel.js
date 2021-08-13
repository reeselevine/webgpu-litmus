import dynamic from "next/dynamic";
import React, { useState, useEffect} from 'react';
//see https://github.com/wwayne/react-tooltip/issues/675
const ReactTooltip = dynamic(() => import("react-tooltip"), {
  ssr: false,
});

function buildIntStressParam(name, description, paramName, params, pageState, min, max) {
  //console.log(params.minWorkgroups)
  const[val, setVal]=useState(params[paramName]);

  function validate(e) {
    if (isNaN(parseInt(e.target.value)) || val < min || val > max) {
      alert( name + " value is invalid. The value should be in between " + min + " and "+ max);
      console.log(params[paramName])
      setVal(params[paramName]);
    } else if ((paramName =="memStride" || paramName == "stressLineSize") && !powOf2(e.target.value)) {
        alert( name + " value is invalid. The value should be power of 2");
        setVal(params[paramName]);
    } else {
      params[paramName] = val;
    }
  }

  function handleInput(e) {
    let tryParse = parseInt(e.target.value);
    if (isNaN(tryParse)) {
      setVal(e.target.value);
    } else {
      setVal(tryParse);
    }
  }

  let jsx = <IntegerStressParam name={name} description={description} paramName={paramName} params={params} pageState={pageState}
            val={val} handleInput={handleInput}  validate={validate} />
  return {
    state: {
      value: val,
      update: setVal
    },
    jsx: jsx
  }
}

function IntegerStressParam(props) {
  
  return (
    <>
      <div className="columns">
        <div className="column">
          <label data-tip={props.description}>{props.name}:</label>
          <input name={props.paramName} id="myInput" className="input is-small stressPanel" type="text" 
            value={props.val} onChange={(e)=>{
              props.handleInput(e);
            }} onBlur={(e)=>{
              props.validate(e);
              //props.checkPowOf2(e);
            }} disabled={props.pageState.running.value}/>
        </div>
      </div>
    </>
  );
}

function DropdownOption(props) {
  return (<option value={props.value}>{props.value}</option>)
}

function stressPatternOnChange(params, paramName) {
  return function onChange(e) {
    switch(e.target.value) {
      case "store-store":
        params[paramName] = 0;
        break;
      case "store-load":
        params[paramName] = 1;
        break;
      case "load-store":
        params[paramName] = 2;
        break;
      case "load-load":
        params[paramName] = 3;
        break;
      default:
        console.log("Unexpected value");
    }
  }
}

function stressAssignmentStrategyOnChange(params, paramName) {
  return function onChange(e) {
    params[paramName] = e.target.value;
  }
}

function DropdownStressParam(props) {
  const options = props.options.map(val => <DropdownOption value={val} key={val}/>)
  return (
    <>
      <div className="columns">
        <div className="column">
          <label data-tip={props.description}>{props.name}:</label>
          <select className="stressPanelDropdown" name={props.paramName} 
            onChange={props.updateFunc(props.params, props.paramName)} disabled={props.pageState.running.value}>
            {options}
          </select>
        </div>
      </div>
    </>
  )
}

// Generates a random number between min and max (inclusive)
export function randomGenerator(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const noStressConfig = {
  minWorkgroups: 4,
  maxWorkgroups: 4,
  shufflePct: 0,
  barrierPct: 0,
  memStressPct: 0,
  testMemorySize: 2048,
  scratchMemorySize: 2048,
  memStride: 64,
  memStressIterations: 1024,
  preStressIterations: 128,
  stressLineSize: 64,
  stressTargetLines: 2,
  preStressPct: 0
};

const someStressConfig = {
  minWorkgroups: 1024,
  maxWorkgroups: 1024,
  shufflePct: 100,
  barrierPct: 100,
  memStressPct: 0,
  testMemorySize: 2048,
  scratchMemorySize: 2048,
  memStride: 64,
  memStressIterations: 1024,
  preStressIterations: 128,
  stressLineSize: 64,
  stressTargetLines: 2,
  preStressPct: 0
};

const allStressConfig = {
  minWorkgroups: 1024,
  maxWorkgroups: 1024,
  shufflePct: 100,
  barrierPct: 100,
  memStressPct: 100,
  testMemorySize: 2048,
  scratchMemorySize: 2048,
  memStride: 64,
  memStressIterations: 1024,
  preStressIterations: 128,
  stressLineSize: 64,
  stressTargetLines: 2,
  preStressPct: 100
};

function randomConfig() {
  let maxWorkgroups =  randomGenerator(4,1024);
  let minWorkgroups = randomGenerator(4, maxWorkgroups);
  let stressLineSize = Math.pow(2, randomGenerator(1,10));
  let stressTargetLines = randomGenerator(1,16);
  let memStride = Math.pow(2, randomGenerator(1, 9));
  return {
    minWorkgroups: minWorkgroups,
    maxWorkgroups: maxWorkgroups,
    shufflePct: randomGenerator(0, 100),
    barrierPct: randomGenerator(0, 100),
    memStressPct: randomGenerator(0, 100),
    testMemorySize: memStride * 128,
    scratchMemorySize: 32 * stressLineSize * stressTargetLines,
    memStride: memStride,
    memStressIterations: randomGenerator(0, 1024),
    preStressIterations: randomGenerator(0, 128),
    stressLineSize: stressLineSize,
    stressTargetLines: stressTargetLines,
    preStressPct: randomGenerator(0, 100)
  };
}

function setConfig(params, uiParams, config) {
  for (let key of Object.keys(config)) {
    params[key] = config[key];
    uiParams[key].state.update(config[key]);
  }
}

function powOf2(n){
  return  n && (n & (n - 1)) === 0
}

export default function stressPanel(props) {
  const uiParams = {
    minWorkgroups : buildIntStressParam("Minimum Workgroups", "Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)", "minWorkgroups", props.params, props.pageState, 4, 1024),
    maxWorkgroups : buildIntStressParam("Maximum Workgroups",  "Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)", "maxWorkgroups", props.params, props.pageState, 4, 1024),
    shufflePct : buildIntStressParam("Shuffle Percentage", "The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)","shufflePct", props.params, props.pageState, 0, 100),
    barrierPct : buildIntStressParam("Barrier Percentage", "The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)","barrierPct", props.params, props.pageState, 0, 100),
    testMemorySize : buildIntStressParam("Test Memory Size", "The size of the memory buffer that contains the global testing locations", "testMemorySize",props.params, props.pageState, 256, 523776),
    memStride : buildIntStressParam("Memory Stride", "The testing locations in the litmus test are guaranteed to be seperated by at least this many 32-bit words (values should be between 1 and 128)", "memStride", props.params, props.pageState, 2, 128 ),
    memStressPct : buildIntStressParam("Memory Stress Percentage", "The percentage of iterations in which all non-testing threads repeatedly access the scratch memory to cause memory stress (values should be between 0 and 100)", "memStressPct", props.params, props.pageState, 0, 100),
    memStressIterations : buildIntStressParam("Memory Stress Loops", "How many times the non-testing threads loop on their memory stress access pattern (values should be between 0 and 1024)", "memStressIterations", props.params, props.pageState, 0, 1024),
    preStressPct : buildIntStressParam( "Pre-Stress Percentage",  "The percent of iterations in which the testing threads access the scratch memory region before executing their part of the litmus test (values should be between 0 and 100)","preStressPct", props.params, props.pageState, 0, 100),
    preStressIterations : buildIntStressParam("Pre Stress Loops", "How many times the testing threads perform their accesses on the scratch memory region before performing the litmus test  (values should be between 0 and 2048)" , "preStressIterations", props.params, props.pageState, 0, 2048),
    scratchMemorySize : buildIntStressParam("Scatch Memory Size", "The size of the memory buffer where threads stress the memory" , "scratchMemorySize", props.params, props.pageState, 256, 4096),
    stressLineSize : buildIntStressParam("Stress Line Size", "The non-testing threads will access disjoint memory locations at seperatated by at least this many 32-bit words (values should be between 1 and 128)", "stressLineSize", props.params, props.pageState, 2, 128),
    stressTargetLines : buildIntStressParam("Stress Target Lines", "How many disjoint memory locations the non-testing threads access in the scratch memory region (values should be between 1 and 128)", "stressTargetLines", props.params, props.pageState, 1, 128 )
  }; 

  return (
    <>
      <div className="column is-one-third mr-2">
        <ReactTooltip backgroundColor="black"/>
        <nav className="panel">
          <p className="panel-heading">
            Test Parameters
          </p>
          <div className="container" style={{ overflowY: 'scroll', overflowX: 'hidden', height: '350px' }}>
            {uiParams.minWorkgroups.jsx}
            {uiParams.maxWorkgroups.jsx}
            {uiParams.shufflePct.jsx}
            {uiParams.barrierPct.jsx}
            {uiParams.testMemorySize.jsx}
            {uiParams.scratchMemorySize.jsx}
            {uiParams.memStride.jsx}
            {uiParams.memStressPct.jsx}
            {uiParams.memStressIterations.jsx}
            {uiParams.preStressPct.jsx}
            {uiParams.preStressIterations.jsx}
            {uiParams.stressLineSize.jsx}
            {uiParams.stressTargetLines.jsx}
            <DropdownStressParam name="Stress Assignment Strategy" description="How non-testing threads are assigned to scratch memory regions to access" paramName="stressAssignmentStrategy" params={props.params} options={["round-robin", "chunking"]} updateFunc={stressAssignmentStrategyOnChange} pageState={props.pageState}/>
            <DropdownStressParam name="Memory Stress Pattern" description="The access pattern that non-testing threads access the scratch memory region" paramName="memStressPattern" params={props.params} options={["load-store", "store-load", "load-load", "store-store"]} updateFunc={stressPatternOnChange} pageState={props.pageState}/>
            <DropdownStressParam name="Pre Stress Pattern" description="The access pattern that testing threads access the scratch memory region before executing their litmus test" paramName="preStressPattern" params={props.params} options={["load-store", "store-load", "load-load", "store-store"]} updateFunc={stressPatternOnChange} pageState={props.pageState}/>
          </div>
          <div className="panel-block p-2">
            <div className="columns is-2 ">
              <div className="column ">
                <div className="buttons are-small">
                <button className="button is-link is-outlined " onClick={()=>{
                  setConfig(props.params, uiParams, noStressConfig);
                }} disabled={props.pageState.running.value}>
                  Test 1
                </button> 
                <button className="button is-link is-outlined " onClick={()=>{
                  setConfig(props.params, uiParams, someStressConfig);
                }} disabled={props.pageState.running.value}>
                  Test 2
                </button>
                <button className="button is-link is-outlined " onClick={()=>{
                  setConfig(props.params, uiParams, allStressConfig);
                }} disabled={props.pageState.running.value}>
                  Test 3
                </button>
                <button className="button is-link is-outlined " onClick={()=>{
                  setConfig(props.params, uiParams, randomConfig());
                }} disabled={props.pageState.running.value}>
                  Random
                </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}