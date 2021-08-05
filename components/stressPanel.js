import dynamic from "next/dynamic";
import React, { useState, useEffect} from 'react';
//see https://github.com/wwayne/react-tooltip/issues/675
const ReactTooltip = dynamic(() => import("react-tooltip"), {
  ssr: false,
});

let click = false; 

function buildIntStressParam(name, description, paramName, params, pageState, min, max) {
  console.log(params.minWorkgroups)
  const[val, setVal]=useState(params[paramName]);
  useEffect(()=>{
    setVal(params[paramName]);
  },[params[paramName]]);
  console.log("val is ");
  console.log(val);
  function validate(e) {
    if (isNaN(parseInt(e.target.value)) || val < min || val > max) {
      alert( name + " value is invalid. The value should be in between " + min + " and "+ max);
      setVal(params.paramName);
    } else {
      params.paramName = val;
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
            val={val} handleInput={handleInput} validate={validate}/>
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
function randomStressStrategy(params, option){
  params["stressAssignmentStrategy" ] = option;
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
export default function stressPanel(props) {
  const [params, setParam] = useState(props.params);
  const [random, setRandom] = useState(false);
  let array1 = ["round-robin", "chunking"];
  let array2 = ["load-store", "store-load", "load-load", "store-store"];
  let scratchMem = 4*props.params.stressLineSize*props.params.stressTargetLines;

    console.log("param after click is " )
    console.log(props.params);
  
  const minWorkgroupsDom = buildIntStressParam("Minimum Workgroups", "Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)", "minWorkgroups", props.params, props.pageState, 4, 1024);
  const maxWorkgroupsDom = buildIntStressParam("Maximum Workgroups",  "Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)", "maxWorkgroups", props.params, props.pageState, 4, 1024);
  const shufflePct = buildIntStressParam("Shuffle Percentage", "The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)","shufflePct", props.params, props.pageState, 0, 100);
  const barrierPct = buildIntStressParam("Barrier Percentage", "The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)","barrierPct", props.params, props.pageState, 0, 100);
  const testMemorySize = buildIntStressParam("Test Memory Size", "The size of the memory buffer that contains the global testing locations (values should be between 256 and 4096)", "testMemorySize",props.params, props.pageState, 256, 4096);
  const scratchMemorySize = buildIntStressParam("Scatch Memory Size", "The size of the memory buffer where threads stress the memory" , "scratchMemorySize", props.params, props.pageState, scratchMem, scratchMem)
  const memoryStride = buildIntStressParam("Memory Stride", "The testing locations in the litmus test are guaranteed to be seperated by at least this many 32-bit words (values should be between 1 and 128)", "memStride", props.params, props.pageState, 1, 128 );
  const memStressPct = buildIntStressParam("Memory Stress Percentage", "The percentage of iterations in which all non-testing threads repeatedly access the scratch memory to cause memory stress (values should be between 0 and 100)", "memStressPct", props.params, props.pageState, 0, 100);
  const memStressLoops = buildIntStressParam("Memory Stress Loops", "How many times the non-testing threads loop on their memory stress access pattern (values should be between 0 and 1024)", "memStressIterations", props.params, props.pageState, 0, 1024 )
  const preStressPct =buildIntStressParam( "Pre-Stress Percentage",  "The percent of iterations in which the testing threads access the scratch memory region before executing their part of the litmus test (values should be between 0 and 100)","preStressPct", props.params, props.pageState, 0, 100);
  const preStressLoops = buildIntStressParam("Pre Stress Loops", "How many times the testing threads perform their accesses on the scratch memory region before performing the litmus test  (values should be between 0 and 2048)" , "preStressIterations", props.params, props.pageState, 0, 2048);
  const stressLineSize = buildIntStressParam("Stress Line Size", "The non-testing threads will access disjoint memory locations at seperatated by at least this many 32-bit words (values should be between 1 and 128)", "stressLineSize", props.params, props.pageState, 1, 128)
  const stressTargetLines = buildIntStressParam("Stress Target Lines", "How many disjoint memory locations the non-testing threads access in the scratch memory region (values should be between 1 and 128)", "stressTargetLines", props.params, props.pageState, 1, 128 )  
  return (
    <>
      <div className="column is-one-third mr-2">
        <ReactTooltip backgroundColor="black"/>
        <nav className="panel">
          <p className="panel-heading">
            Test Parameters
          </p>
          <div className="container" style={{ overflowY: 'scroll', overflowX: 'hidden', height: '350px' }}>
            {minWorkgroupsDom.jsx}
            {maxWorkgroupsDom.jsx}
            {shufflePct.jsx}
            {barrierPct.jsx}
            {testMemorySize.jsx}
            {scratchMemorySize.jsx}
            {memoryStride.jsx}
            {memStressPct.jsx}
            {memStressLoops.jsx}
            {preStressPct.jsx}
            {preStressLoops.jsx}
            {stressLineSize.jsx}
            {stressTargetLines.jsx}
            <DropdownStressParam name="Stress Assignment Strategy" description="How non-testing threads are assigned to scratch memory regions to access" paramName="stressAssignmentStrategy" params={props.params} options={["round-robin", "chunking"]} updateFunc={stressAssignmentStrategyOnChange} pageState={props.pageState}/>
            <DropdownStressParam name="Memory Stress Pattern" description="The access pattern that non-testing threads access the scratch memory region" paramName="memStressPattern" params={props.params} options={["load-store", "store-load", "load-load", "store-store"]} updateFunc={stressPatternOnChange} pageState={props.pageState}/>
            <DropdownStressParam name="Pre Stress Pattern" description="The access pattern that testing threads access the scratch memory region before executing their litmus test" paramName="preStressPattern" params={props.params} options={["load-store", "store-load", "load-load", "store-store"]} updateFunc={stressPatternOnChange} pageState={props.pageState}/>
          </div>
          <div className="panel-block p-2">
            <div className="columns is-2 ">
              <div className="column ">
                <div className="buttons are-small">
                <button className="button is-link is-outlined " onClick={()=>{
                  console.log("click test1")
                  click = true;
                   setParam({...params,minWorkgroups: 4,maxWorkgroups: 4, shufflePct: 0, barrierPct: 0, memStressPct: 0});
                   props.params.minWorkgroups = 4;
                   props.params.maxWorkgroups = 4;
                   props.params.shufflePct = 0;
                   props.params.barrierPct = 0;
                   props.params.memStressPct = 0;
                  // console.log("after click");
                  // console.log(props.params)
                  click = false;
                }}>
                  Test 1
                </button> 
                <button className="button is-link is-outlined " onClick={()=>{
                  console.log("click test2")
                  setParam({...params,minWorkgroups: 1024, maxWorkgroups: 1024, shufflePct: 100, barrierPct: 100, memStressPct: 0});
                  click = true;
                  props.params.minWorkgroups = 1024;
                  props.params.maxWorkgroups = 1024;
                  props.params.shufflePct = 100;
                  props.params.barrierPct = 100;
                  props.params.memStressPct = 0;
                  click= false;
                }}>
                  Test 2
                </button>
                <button className="button is-link is-outlined " onClick={()=>{
                  console.log("click test3")
                  setParam({...params,minWorkgroups: 1024,maxWorkgroups: 1024, shufflePct: 100, barrierPct: 100, memStressPct: 100});
                  click = true;
                  props.params.minWorkgroups = 1024;
                  props.params.maxWorkgroups = 1024;
                  props.params.shufflePct = 100;
                  props.params.barrierPct = 100;
                  props.params.memStressPct = 100;
                  click = false;
                }}>
                  Test 3
                </button>
                <button className="button is-link is-outlined " onClick={()=>{
                   let maxWorkgroups =  Math.floor(Math.random() * (1024 - 4+1) + 4);
                  let minWorkgroups = maxWorkgroups+1;
                  while(minWorkgroups > maxWorkgroups){
                    minWorkgroups =  Math.floor(Math.random() * (maxWorkgroups - 4+1) + 4);
                  }
                  let stressLineSize_ =  Math.floor(Math.random() * (128 - 1 + 1) + 1);
                  let stressTargetLines_ =  Math.floor(Math.random() * (128 - 1 + 1) + 1);
                  scratchMem = 4*stressLineSize_ * stressTargetLines_;
                  setParam({minWorkgroups: minWorkgroups, 
                            maxWorkgroups: maxWorkgroups, 
                            testMemorySize: Math.floor(Math.random() * (4096 - 256 + 1) + 256),
                            memStride: Math.floor(Math.random() * (128 - 1 + 1) + 1), 
                            memStressIterations: Math.floor(Math.random() * (1024 - 0 + 1) + 0),
                            preStressPct: Math.floor(Math.random() * (100 - 0 + 1) + 0),
                            preStressIterations: Math.floor(Math.random() * (2048 - 0 + 1) + 0),
                            shufflePct: Math.floor(Math.random() * (100 - 0 + 1) + 0), 
                            barrierPct: Math.floor(Math.random() * (100 - 0 + 1) + 0),
                            memStressPct: Math.floor(Math.random() * (100 - 0 + 1) + 0),
                            stressLineSize: stressLineSize,
                            stressTargetLines : stressTargetLines,
                            stressAssignmentStrategy: array1[Math.floor(Math.random() * 2)],
                            memStressPattern: array2[Math.floor(Math.random() * 4)],
                            preStressPattern: array2[Math.floor(Math.random() * 4)],
                          });
                            props.params.minWorkgroups = minWorkgroups, 
                            props.params.maxWorkgroups = maxWorkgroups, 
                            props.params.testMemorySize = Math.floor(Math.random() * (4096 - 256 + 1) + 256),
                            props.params.memStride = Math.floor(Math.random() * (128 - 1 + 1) + 1), 
                            props.params.memStressIterations = Math.floor(Math.random() * (1024 - 0 + 1) + 0),
                            props.params.preStressPct = Math.floor(Math.random() * (100 - 0 + 1) + 0),
                            props.params.preStressIterations =  Math.floor(Math.random() * (2048 - 0 + 1) + 0),
                            props.params.stressLineSize = Math.floor(Math.random() * (128 - 1 + 1) + 1), 
                            props.params.stressTargetLines = Math.floor(Math.random() * (128 - 1 + 1) + 1),
                            props.params.shufflePct = Math.floor(Math.random() * (100 - 0 + 1) + 0), 
                            props.params.barrierPct = Math.floor(Math.random() * (100 - 0 + 1) + 0),
                            props.params.memStressPct= Math.floor(Math.random() * (100 - 0 + 1) + 0),
                            props.params.stressAssignmentStrategy = array1[Math.floor(Math.random() * 2)],
                            props.params.memStressPattern = array2[Math.floor(Math.random() * 4)],
                            props.params.preStressPattern = array2[Math.floor(Math.random() * 4)]
                            click = false;
                }}>
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