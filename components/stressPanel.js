import dynamic from "next/dynamic";
import React, { useState, useEffect } from 'react';
import { randomConfig } from "./test-page-utils";
//see https://github.com/wwayne/react-tooltip/issues/675
const ReactTooltip = dynamic(() => import("react-tooltip"), {
  ssr: false,
});

function validateWrapper(name, paramName, val, min, max) {
  return function (e) {
    if (isNaN(parseInt(e.target.value)) || val < min || val > max) {
      alert(name + " value is invalid. The value should be in between " + min + " and " + max);
      return false;
    } else if (paramName == "stressLineSize" && !powOf2(e.target.value)) {
      alert(name + " value is invalid. The value should be power of 2");
      return false;
    } else {
      return true;
    }
  }
}

function handleInput(setVal) {
  return function (e) {
    let tryParse = parseInt(e.target.value);
    if (isNaN(tryParse)) {
      setVal(e.target.value);
    } else {
      setVal(tryParse);
    }
  }
}

function buildIntStressParam(name, description, paramName, params, pageState, min, max) {
  const [val, setVal] = useState(params[paramName]);

  function validate(e) {
    if (validateWrapper(name, paramName, val, min, max)(e)) {
      params[paramName] = val;
    } else {
      setVal(params[paramName]);
    }
  }

  let jsx = <IntegerStressParam name={name} description={description} paramName={paramName} params={params} pageState={pageState}
    val={val} handleInput={handleInput(setVal)} validate={validate} />
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
            value={props.val} onChange={(e) => {
              props.handleInput(e);
            }} onBlur={(e) => {
              props.validate(e);
              //props.checkPowOf2(e);
            }} />
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
  const [val, setVal] = useState(params[paramName]);
  let jsx = <DropdownStressParam name={name} description={description} paramName={paramName} initialValue={val} options={options} updateFunc={dropdownOnChange(params, paramName, setVal)} pageState={pageState} />
  return {
    state: {
      value: val,
      update: setVal
    },
    jsx: jsx
  };
}

function DropdownStressParam(props) {
  const options = props.options.map((val, index) => <DropdownOption value={index} name={val} key={val} />)
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

function paramsInputOnChange(params, uiParams) {
  return function onChange(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function(event) {
      let config = JSON.parse(event.target.result);
      setConfig(params, uiParams, config);
    };
    reader.readAsText(file);
    e.target.value = null;
  }
}

function StressParamsInput(props) {
  return (
    <>
      <div className="file is-primary">
        <label className="file-label" data-tip="A JSON file with the same structure and parameters as the 'params' field when downloading tuning results.">
          <input className="file-input" type="file" name="params" onChange={paramsInputOnChange(props.params, props.uiParams)}/>
          <span className="file-cta">
            <span className="file-label">
              Upload
            </span>
          </span>
        </label>
      </div>
    </>
  )
}

const noStressConfig = {
  testingWorkgroups: 2,
  maxWorkgroups: 4,
  shufflePct: 0,
  barrierPct: 0,
  memStressPct: 0,
  scratchMemorySize: 2048,
  memStride: 1,
  memStressIterations: 1024,
  preStressIterations: 128,
  stressLineSize: 64,
  stressTargetLines: 2,
  preStressPct: 0,
  stressStrategyBalancePct: 100,
  memStressStoreFirstPct: 0,
  memStressStoreSecondPct: 100,
  preStressStoreFirstPct: 0,
  preStressStoreSecondPct: 100
};

const someStressConfig = {
  testingWorkgroups: 256,
  maxWorkgroups: 1024,
  shufflePct: 100,
  barrierPct: 100,
  memStressPct: 0,
  scratchMemorySize: 2048,
  memStride: 4,
  memStressIterations: 1024,
  preStressIterations: 128,
  stressLineSize: 64,
  stressTargetLines: 2,
  preStressPct: 0,
  stressStrategyBalancePct: 100,
  memStressStoreFirstPct: 0,
  memStressStoreSecondPct: 100,
  preStressStoreFirstPct: 0,
  preStressStoreSecondPct: 100
};

const allStressConfig = {
  testingWorkgroups: 512,
  maxWorkgroups: 1024,
  shufflePct: 100,
  barrierPct: 100,
  memStressPct: 100,
  scratchMemorySize: 2048,
  memStride: 4,
  memStressIterations: 1024,
  preStressIterations: 128,
  stressLineSize: 64,
  stressTargetLines: 2,
  preStressPct: 100,
  stressStrategyBalancePct: 100,
  memStressStoreFirstPct: 50,
  memStressStoreSecondPct: 50,
  preStressStoreFirstPct: 50,
  preStressStoreSecondPct: 50 
};

function setConfig(params, uiParams, config) {
  for (let key of Object.keys(config)) {
    params[key] = config[key];
    if (uiParams[key]) {
      uiParams[key].state.update(config[key]);
    }
  }
}

function powOf2(n) {
  return n && (n & (n - 1)) === 0
}

export function getStressPanel(params, pageState) {
  const uiParams = {
    testingWorkgroups: buildIntStressParam("Testing Workgroups", "The number of workgroups that will execute testing instructions. Must be less than or equal to the number of running workgroups", "testingWorkgroups", params, pageState, 2, 1024),
    maxWorkgroups: buildIntStressParam("Maximum Workgroups", "Each stress iteration is launched with a random number of workgroups between testing workgroups and Maximum Workgroups (values should be between 4 and 1024)", "maxWorkgroups", params, pageState, 4, 1024),
    shufflePct: buildIntStressParam("Workgroup Shuffle Percentage", "The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)", "shufflePct", params, pageState, 0, 100),
    barrierPct: buildIntStressParam("Barrier Percentage", "The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)", "barrierPct", params, pageState, 0, 100),
    memStride: buildIntStressParam("Memory Stride", "The testing locations in the litmus test are guaranteed to be seperated by at least this many 32-bit words (values should be between 1 and 7)", "memStride", params, pageState, 1, 7),
    memStressPct: buildIntStressParam("Memory Stress Percentage", "The percentage of iterations in which all non-testing threads repeatedly access the scratch memory to cause memory stress (values should be between 0 and 100)", "memStressPct", params, pageState, 0, 100),
    memStressIterations: buildIntStressParam("Memory Stress Loops", "How many times the non-testing threads loop on their memory stress access pattern (values should be between 0 and 1024)", "memStressIterations", params, pageState, 0, 1024),
    preStressPct: buildIntStressParam("Pre-Stress Percentage", "The percent of iterations in which the testing threads access the scratch memory region before executing their part of the litmus test (values should be between 0 and 100)", "preStressPct", params, pageState, 0, 100),
    preStressIterations: buildIntStressParam("Pre Stress Loops", "How many times the testing threads perform their accesses on the scratch memory region before performing the litmus test  (values should be between 0 and 2048)", "preStressIterations", params, pageState, 0, 2048),
    scratchMemorySize: buildIntStressParam("Scratch Memory Size", "The size of the memory buffer where threads stress the memory", "scratchMemorySize", params, pageState, 256, 524288),
    stressLineSize: buildIntStressParam("Stress Line Size", "The non-testing threads will access disjoint memory locations at seperatated by at least this many bytes (values should be between 4 and 1024)", "stressLineSize", params, pageState, 4, 1024),
    stressTargetLines: buildIntStressParam("Stress Target Lines", "How many disjoint memory locations the non-testing threads access in the scratch memory region (values should be between 1 and 128)", "stressTargetLines", params, pageState, 1, 16),
    stressStrategyBalancePct: buildIntStressParam("Memory Stress Assignment Balance", "How non-testing threads are assigned to stressing locations. 100 means all iterations use a round robin approach, 0 means all use a chunking approach.", "stressStrategyBalancePct", params, pageState, 0, 100),
    memStressStoreFirstPct: buildIntStressParam("Memory Stress Store First Percentage", "The percentage of iterations the first instruction in the stress pattern should be a store", "memStressStoreFirstPct", params, pageState, 0, 100),
    memStressStoreSecondPct: buildIntStressParam("Memory Stress Store Second Percentage", "The percentage of iterations the second instruction in the stress pattern should be a store", "memStressStoreSecondPct", params, pageState, 0, 100),
    preStressStoreFirstPct: buildIntStressParam("Pre Stress Store First Percentage", "The percentage of iterations the first instruction in the stress pattern should be a store", "preStressStoreFirstPct", params, pageState, 0, 100),
    preStressStoreSecondPct: buildIntStressParam("Pre Stress Store Second Percentage", "The percentage of iterations the second instruction in the stress pattern should be a store", "preStressStoreSecondPct", params, pageState, 0, 100)
  };

  return {
    uiParams: uiParams,
    jsx: (
      <>
        <div className="column is-one-third mr-2">
          <ReactTooltip backgroundColor="black" />
          <nav className="panel">
            <p className="panel-heading">
              Test Parameters
            </p>
            <div className="container" style={{ overflowY: 'scroll', overflowX: 'hidden', height: '350px' }}>
              {uiParams.testingWorkgroups.jsx}
              {uiParams.maxWorkgroups.jsx}
              {uiParams.shufflePct.jsx}
              {uiParams.barrierPct.jsx}
              {uiParams.scratchMemorySize.jsx}
              {uiParams.memStride.jsx}
              {uiParams.memStressPct.jsx}
              {uiParams.memStressIterations.jsx}
              {uiParams.preStressPct.jsx}
              {uiParams.preStressIterations.jsx}
              {uiParams.stressLineSize.jsx}
              {uiParams.stressTargetLines.jsx}
              {uiParams.stressStrategyBalancePct.jsx}
              {uiParams.memStressStoreFirstPct.jsx}
              {uiParams.memStressStoreSecondPct.jsx}
              {uiParams.preStressStoreFirstPct.jsx}
              {uiParams.preStressStoreSecondPct.jsx}
            </div>
            <div className="panel-block p-2">
              <div className="columns is-2 ">
                <div className="column ">
                  <b> Test Parameter Presets </b>
                  <div className="buttons are-small">
                    <button className="button is-link is-outlined " onClick={() => {
                      setConfig(params, uiParams, noStressConfig);
                    }} disabled={pageState.running.value}>
                      Basic
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      setConfig(params, uiParams, someStressConfig);
                    }} disabled={pageState.running.value}>
                      Interleave
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      setConfig(params, uiParams, allStressConfig);
                    }} disabled={pageState.running.value}>
                      Stress
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      setConfig(params, uiParams, randomConfig(Math.random));
                    }} disabled={pageState.running.value}>
                      Random
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="panel-block p-2">
              <div className="columns">
                <div className="column">
                  <b>Choose a Parameter File:</b>
                  <StressParamsInput params={params} uiParams={uiParams}/>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </>
    )
  };
}
