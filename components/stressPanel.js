import dynamic from "next/dynamic";
import React, { useState, useEffect} from 'react';
import { randomConfig } from "./test-page-utils";
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
            }} disabled={props.pageState.running.value || 
                        (props.pageState.activeVariant != undefined && 
                         props.paramName == "testMemorySize" && 
                        props.pageState.activeVariant.value == "workgroup")}/>
        </div>
      </div>
    </>
  );
}

function DropdownOption(props) {
  return (<option value={props.value}>{props.name}</option>)
}

function dropdownOnChange(params, paramName, setVal) {
  return function onChange(e) {
    setVal(e.target.value);
    params[paramName] = parseInt(e.target.value);
  }
}

function buildDropdownStressParam(name, description, paramName, params, pageState, options) {
  const[val, setVal]=useState(params[paramName]);
  let jsx = <DropdownStressParam name={name} description={description} paramName={paramName} initialValue={val} options={options} updateFunc={dropdownOnChange(params, paramName, setVal)} pageState={pageState}/>
  return {
    state: {
      value: val,
      update: setVal
    },
    jsx: jsx
  };
}

function DropdownStressParam(props) {
  const options = props.options.map((val, index) => <DropdownOption value={index} name={val} key={val}/>)
  return (
    <>
      <div className="columns">
        <div className="column">
          <label data-tip={props.description}>{props.name}:</label>
          <select className="stressPanelDropdown" name={props.paramName} value={props.initialValue}
            onChange={props.updateFunc} disabled={props.pageState.running.value}>
            {options}
          </select>
        </div>
      </div>
    </>
  )
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
  preStressPct: 0,
  stressAssignmentStrategy: 0,
  memStressPattern: 2,
  preStressPattern: 2
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
  preStressPct: 0,
  stressAssignmentStrategy: 0,
  memStressPattern: 2,
  preStressPattern: 2
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
  preStressPct: 100,
  stressAssignmentStrategy: 0,
  memStressPattern: 2,
  preStressPattern: 2
};

function setConfig(params, uiParams, config) {
  for (let key of Object.keys(config)) {
    params[key] = config[key];
    uiParams[key].state.update(config[key]);
  }
}

function powOf2(n){
  return  n && (n & (n - 1)) === 0
}

export function getStressPanel(params, pageState) {
  const uiParams = {
    minWorkgroups : buildIntStressParam("Minimum Workgroups", "Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)", "minWorkgroups", params, pageState, 4, 1024),
    maxWorkgroups : buildIntStressParam("Maximum Workgroups",  "Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)", "maxWorkgroups", params, pageState, 4, 1024),
    shufflePct : buildIntStressParam("Shuffle Percentage", "The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)","shufflePct", params, pageState, 0, 100),
    barrierPct : buildIntStressParam("Barrier Percentage", "The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)","barrierPct", params, pageState, 0, 100),
    testMemorySize : buildIntStressParam("Test Memory Size", "The size of the memory buffer that contains the global testing locations", "testMemorySize", params, pageState, 256, 523776),
    memStride : buildIntStressParam("Memory Stride", "The testing locations in the litmus test are guaranteed to be seperated by at least this many 32-bit words (values should be between 1 and 128)", "memStride", params, pageState, 2, 128 ),
    memStressPct : buildIntStressParam("Memory Stress Percentage", "The percentage of iterations in which all non-testing threads repeatedly access the scratch memory to cause memory stress (values should be between 0 and 100)", "memStressPct", params, pageState, 0, 100),
    memStressIterations : buildIntStressParam("Memory Stress Loops", "How many times the non-testing threads loop on their memory stress access pattern (values should be between 0 and 1024)", "memStressIterations", params, pageState, 0, 1024),
    preStressPct : buildIntStressParam( "Pre-Stress Percentage",  "The percent of iterations in which the testing threads access the scratch memory region before executing their part of the litmus test (values should be between 0 and 100)","preStressPct", params, pageState, 0, 100),
    preStressIterations : buildIntStressParam("Pre Stress Loops", "How many times the testing threads perform their accesses on the scratch memory region before performing the litmus test  (values should be between 0 and 2048)" , "preStressIterations", params, pageState, 0, 2048),
    scratchMemorySize : buildIntStressParam("Scatch Memory Size", "The size of the memory buffer where threads stress the memory" , "scratchMemorySize", params, pageState, 256, 4096),
    stressLineSize : buildIntStressParam("Stress Line Size", "The non-testing threads will access disjoint memory locations at seperatated by at least this many 32-bit words (values should be between 1 and 128)", "stressLineSize", params, pageState, 2, 128),
    stressTargetLines : buildIntStressParam("Stress Target Lines", "How many disjoint memory locations the non-testing threads access in the scratch memory region (values should be between 1 and 128)", "stressTargetLines", params, pageState, 1, 128),
    stressAssignmentStrategy: buildDropdownStressParam("Stress Assignment Strategy", "How non-testing threads are assigned to scratch memory regions to access", "stressAssignmentStrategy", params, pageState, ["round-robin", "chunking"]),
    memStressPattern: buildDropdownStressParam("Memory Stress Pattern", "The access pattern that non-testing threads access the scratch memory region", "memStressPattern", params, pageState, ["store-store", "store-load", "load-store", "load-load"]),
    preStressPattern: buildDropdownStressParam("Pre Stress Pattern", "The access pattern that testing threads access the scratch memory region before executing their litmus test", "preStressPattern", params, pageState, ["store-store", "store-load", "load-store", "load-load"])
  }; 

  return {
    uiParams: uiParams,
    jsx: (
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
            {uiParams.stressAssignmentStrategy.jsx}
            {uiParams.memStressPattern.jsx}
            {uiParams.preStressPattern.jsx}
          </div>
            <div className="panel-block p-2">
            <div className="columns is-2 ">
		<div className="column ">
		    <b> Test Parameter Presets </b>
                  <div className="buttons are-small">
                <button className="button is-link is-outlined " onClick={()=>{
                  setConfig(params, uiParams, noStressConfig);
                }} disabled={pageState.running.value}>
                  Basic
                </button> 
                <button className="button is-link is-outlined " onClick={()=>{
                  setConfig(params, uiParams, someStressConfig);
                }} disabled={pageState.running.value}>
                  Interleave
                </button>
                <button className="button is-link is-outlined " onClick={()=>{
                  setConfig(params, uiParams, allStressConfig);
                }} disabled={pageState.running.value}>
                  Stress
                </button>
                <button className="button is-link is-outlined " onClick={()=>{
                  setConfig(params, uiParams, randomConfig());
                }} disabled={pageState.running.value}>
                  Random
                </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  )};
}
