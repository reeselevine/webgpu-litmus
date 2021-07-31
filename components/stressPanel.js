import dynamic from "next/dynamic";
import React, { useState } from 'react';
//see https://github.com/wwayne/react-tooltip/issues/675
const ReactTooltip = dynamic(() => import("react-tooltip"), {
  ssr: false,
});


function IntegerStressParam(props) {
  return (
    <>
      <div className="columns">
        <div className="column">
          <label data-tip={props.description}>{props.name}:</label>
          <input name={props.paramName} className="input is-small stressPanel" type="text" defaultValue={props.params[props.paramName]} onInput={(e) => {
            props.params[props.paramName] = parseInt(e.target.value);
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
  console.log(options);
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
  console.log(props);
  const [params, setParam] = useState(props.params)
  console.log(typeof params);
  let array1 = ["round-robin", "chunking"];
  let array2 = ["load-store", "store-load", "load-load", "store-store"];
  // const randomStressStrategy = (params, options)=>{

  // }
  return (
    <>
      <div className="column is-one-third mr-2">
        <ReactTooltip backgroundColor="black"/>
        <nav className="panel">
          <p className="panel-heading">
            Test Parameters
          </p>
          <div className="container" style={{ overflowY: 'scroll', overflowX: 'hidden', height: '350px' }}>
            <IntegerStressParam name="Minimum Workgroups" description="Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)" paramName="minWorkgroups" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Maximum Workgroups" description="Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)" paramName="maxWorkgroups" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Shuffle Percentage" description="The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)" paramName="shufflePct" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Barrier Percentage" description="The percentage of iterations where the testing workgroups attempt to synchronize before executing their part of the litmus test (values should be between 0 and 100)" paramName="barrierPct" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Test Memory Size" description="The size of the memory buffer that contains the global testing locations (values should be between 256 and 4096)" paramName="testMemorySize" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Scratch Memory Size" description="The size of the memory buffer where threads stress the memory" paramName="scratchMemorySize" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Memory Stride" description="The testing locations in the litmus test are guaranteed to be seperated by at least this many 32-bit words (values should be between 1 and 128)" paramName="memStride" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Memory Stress Percentage" description="The percentage of iterations in which all non-testing threads repeatedly access the scratch memory to cause memory stress (values should be between 0 and 100)" paramName="memStressPct" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Memory Stress Loops" description="How many times the non-testing threads loop on their memory stress access pattern (values should be between 0 and 1024)" paramName="memStressIterations" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Pre-Stress Percentage" description="The percent of iterations in which the testing threads access the scratch memory region before executing their part of the litmus test (values should be between 0 and 100)" paramName="preStressPct" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Pre-Stress Loops" description="How many times the testing threads perform their accesses on the scratch memory region before performing the litmus test  (values should be between 0 and 2048)" paramName="preStressIterations" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Stress Line Size" description="The non-testing threads will access disjoint memory locations at seperatated by at least this many 32-bit words (values should be between 1 and 128)" paramName="stressLineSize" params={params} pageState={props.pageState}/>
            <IntegerStressParam name="Stress Target Lines" description="How many disjoint memory locations the non-testing threads access in the scratch memory region (values should be between 1 and 128)" paramName="stressTargetLines" params={params} pageState={props.pageState}/>
            <DropdownStressParam name="Stress Assignment Strategy" description="How non-testing threads are assigned to scratch memory regions to access" paramName="stressAssignmentStrategy" params={params} options={["round-robin", "chunking"]} updateFunc={stressAssignmentStrategyOnChange} pageState={props.pageState}/>
            <DropdownStressParam name="Memory Stress Pattern" description="The access pattern that non-testing threads access the scratch memory region" paramName="memStressPattern" params={params} options={["load-store", "store-load", "load-load", "store-store"]} updateFunc={stressPatternOnChange} pageState={props.pageState}/>
            <DropdownStressParam name="Pre Stress Pattern" description="The access pattern that testing threads access the scratch memory region before executing their litmus test" paramName="preStressPattern" params={params} options={["load-store", "store-load", "load-load", "store-store"]} updateFunc={stressPatternOnChange} pageState={props.pageState}/>
          </div>
          <div className="panel-block p-2">
            <div className="columns is-2 ">
              <div className="column ">
                <div className="buttons are-small">
                <button className="button is-link is-outlined " onClick={()=>{
                  setParam({...params,minWorkgroups: 2,maxWorkgroups: 2, shufflePct: 0, barrierPct: 0, memStressPct: 0});
                  console.log("after click");
                  console.log(params)
                }}>
                  Test 1
                </button> 
                <button className="button is-link is-outlined " onClick={()=>{
                  setParam({...params,minWorkgroups: 1024, maxWorkgroups: 1024, shufflePct: 100, barrierPct: 100, memStressPct: 0});
                  console.log("after click");
                  console.log(params)
                }}>
                  Test 2
                </button>
                <button className="button is-link is-outlined " onClick={()=>{
                  setParam({...params,minWorkgroups: 1024,maxWorkgroups: 1024, shufflePct: 100, barrierPct: 100, memStressPct: 100});
                  console.log("after click");
                  console.log(params)
                }}>
                  Test 3
                </button>
                <button className="button is-link is-outlined " onClick={()=>{
                  setParam({minWorkgroups: Math.floor(Math.random() * (1024 - 4 + 1) + 4) , maxWorkgroups: Math.floor(Math.random() * (1024 - 4+1) + 4), 
                            testMemorySize: Math.floor(Math.random() * (4096 - 256 + 1) + 256),
                            memStride: Math.floor(Math.random() * (128 - 1 + 1) + 1), memStressIterations: Math.floor(Math.random() * (1024 - 0 + 1) + 0),
                            preStressPct: Math.floor(Math.random() * (100 - 0 + 1) + 0), preStressIterations: Math.floor(Math.random() * (2048 - 0 + 1) + 0),
                            stressLineSize:  Math.floor(Math.random() * (128 - 1 + 1) + 1), stressTargetLines: Math.floor(Math.random() * (128 - 1 + 1) + 1),
                            shufflePct: Math.floor(Math.random() * (100 - 0 + 1) + 0), barrierPct: Math.floor(Math.random() * (100 - 0 + 1) + 0),
                            memStressPct: Math.floor(Math.random() * (100 - 0 + 1) + 0),
                            stressAssignmentStrategy: array1[Math.floor(Math.random() * 1)]
                          });
                          randomStressStrategy( params, array1[Math.floor(Math.random() * 1)] );
                          console.log(params.stressAssignmentStrategy);
                          stressPatternOnChange(params, array2[Math.floor(Math.random() * 3)]);
                          stressPatternOnChange(params, array2[Math.floor(Math.random() * 3)]);
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
