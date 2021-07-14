import React,{ useState } from 'react';
import _ from 'lodash'
import { Bar } from 'react-chartjs-2';
import { defaultTestParams, runLitmusTest } from '../../components/litmus-setup.js'
import * as ReactBootStrap from 'react-bootstrap';

const shaderCode = `
[[block]] struct AtomicMemory {
  value: array<atomic<u32>>;
};
[[block]] struct Memory {
  value: array<u32>;
};

[[group(0), binding(0)]] var<storage, read_write> test_data : AtomicMemory;
[[group(0), binding(1)]] var<storage, read_write> mem_locations : Memory;
[[group(0), binding(2)]] var<storage, read_write> results : AtomicMemory;
[[group(0), binding(3)]] var<storage, read_write> shuffled_ids : Memory;
[[group(0), binding(4)]] var<storage, read_write> barrier : AtomicMemory;
[[group(0), binding(5)]] var<storage, read_write> scratchpad : Memory;
[[group(0), binding(6)]] var<storage, read_write> scratch_locations : Memory;
[[group(0), binding(7)]] var<storage, read_write> stress_params : Memory;

fn spin() {
  var i : u32 = 0u;
  var bar_val : u32 = atomicAdd(&barrier.value[0], 1u);
  loop {
    if (i == 1024u || bar_val >= 2u) {
      break;
    }
    bar_val = atomicLoad(&barrier.value[0]);
    i = i + 1u;
  }
}

fn do_stress(iterations: u32, pattern: u32, workgroup_id: u32) {
  switch(pattern) {
    case 0u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        scratchpad.value[scratch_locations.value[workgroup_id]] = i;
        scratchpad.value[scratch_locations.value[workgroup_id]] = i + 1u;
      }
    }
    case 1u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        scratchpad.value[scratch_locations.value[workgroup_id]] = i;
        let tmp1: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
        if (tmp1 > 100u) {
          break;
        }
      }
    }
    case 2u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        let tmp1: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
        if (tmp1 > 100u) {
          break;
        }
        scratchpad.value[scratch_locations.value[workgroup_id]] = i;
      }
    }
    case 3u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        let tmp1: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
        if (tmp1 > 100u) {
          break;
        }
        let tmp2: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
        if (tmp2 > 100u) {
          break;
        }
      }
    }
    default: {
      break;
    }
  }
}

let workgroupXSize = 1;
[[stage(compute), workgroup_size(workgroupXSize)]] fn main([[builtin(workgroup_id)]] workgroup_id : vec3<u32>, [[builtin(global_invocation_id)]] global_invocation_id : vec3<u32>, [[builtin(local_invocation_index)]] local_invocation_index : u32) {
  var y : u32 = mem_locations.value[0];
  var x : u32 = mem_locations.value[1];
  if (shuffled_ids.value[global_invocation_id[0]] == u32(workgroupXSize) * 0u + 0u) {
    if (stress_params.value[4] == 1u) {
      do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
    }
    if (stress_params.value[0] == 1u) {
      spin();
    }
    atomicStore(&test_data.value[y], 1u);
    atomicStore(&test_data.value[x], 1u);
  } elseif (shuffled_ids.value[global_invocation_id[0]] == u32(workgroupXSize) * 1u + 0u) {
    if (stress_params.value[4] == 1u) {
      do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
    }
    if (stress_params.value[0] == 1u) {
      spin();
    }
    let r0 = atomicLoad(&test_data.value[x]);
    let r1 = atomicLoad(&test_data.value[y]);
    atomicStore(&results.value[1], r1);
    atomicStore(&results.value[0], r0);
  } elseif (stress_params.value[1] == 1u) {
    do_stress(stress_params.value[2], stress_params.value[3], workgroup_id[0]);
  }
}
`

function buildThrottle(updateFunc) {
  const throttled = _.throttle((newValue) => updateFunc(newValue), 50);
  return throttled;
}

function handleResult(result, state) {
  if (result[0] == 1 && result[1] == 1) {
    state.bothOne.value = state.bothOne.value + 1;
    state.bothOne.update(state.bothOne.value);
  } else if (result[0] == 1 && result[1] == 0) {
    state.oneZero.value = state.oneZero.value + 1;
    state.oneZero.update(state.oneZero.value);
  } else if (result[0] == 0 && result[1] == 1) {
    state.zeroOne.value = state.zeroOne.value + 1;
    state.zeroOne.update(state.zeroOne.value);
  } else if (result[0] == 0 && result[1] == 0) {
    state.bothZero.value = state.bothZero.value + 1;
    state.bothZero.update(state.bothZero.value);
  }
}

export default function StoreBuffer() {
  const [bothOne, setBothOne] = useState(0);
  const [oneZero, setOneZero] = useState(0);
  const [zeroOne, setZeroOne] = useState(0);
  const [bothZero, setBothZero] = useState(0);

  const [iterations, setIterations] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [pseudoSwitch, setPseudo]=useState("");
  const [sourceSwitch, setSource]=useState("is-hidden");
  const [pseudoActive, setPseudoActive]=useState("is-active");
  const [sourceActive, setSourceActive]=useState("");

  const state = {
    bothOne: {
      update: buildThrottle(setBothOne),
      value: 0
    },
    oneZero: {
      update: buildThrottle(setOneZero),
      value: 0
    },
    zeroOne: {
      update: buildThrottle(setZeroOne),
      value: 0
    },
    bothZero: {
      update: buildThrottle(setBothZero),
      value: 0
    }
  }

  function doMessagePassing() {
    setLoading(true);
    state.bothZero.value = 0;
    state.bothZero.update(0);
    state.bothOne.value = 0;
    state.bothOne.update(0);
    state.oneZero.value = 0;
    state.oneZero.update(0);
    state.zeroOne.value = 0;
    state.zeroOne.update(0);
    const p = runLitmusTest(shaderCode, defaultTestParams, iterations, handleResult, state);
    p.then(
      success => {
        setLoading(false);
        console.log("success!")
      },
      error => console.log(error)
    );
  }

  const chartConfig = {
    labels: ["r0=1 and r1=1", "r0=0 and r1=0", "r0=0 and r1=1", "r0=1 and r1=0 (weak behavior)"],
    datasets: [
      {
        label: "Times behavior observed",
        backgroundColor: ['rgba(21,161,42,0.7)','rgba(21,161,42,0.7)','rgba(3,35,173,0.7)','rgba(212,8,8,0.7)'],
        data: [bothOne, bothZero, zeroOne, oneZero]
      }
    ]
  }

  return (
  <>
    <div className="columns">
      <div className="column">
        <h1 className="testName">Message Passing</h1>
          <h2 className="testDescription">The message passing litmus test checks to see if two stores in one thread can be re-ordered according to loads on a second thread.</h2>
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
                  <li className={pseudoActive} onClick={()=>{setPseudoActive("is-active"); setSourceActive(""); setSource("is-hidden");setPseudo(""); }}><a>Pseudo-Code</a></li>
                  <li className={sourceActive} onClick={()=>{setPseudoActive(""); setSourceActive("is-active"); setSource(""); setPseudo("is-hidden"); }}><a>Source Code</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="columns">
            <div className="column">
              <div className="px-2" id="tab-content">
                <div id="pseudoCode" className={pseudoSwitch}>
                  <p>Pseudocode goes here</p>
                </div>
                <div id="sourceCode" className={sourceSwitch}>
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
                data={chartConfig}
                options={{
                  title: {
                    display: true,
                    text: 'Message Passing Litmus Test Results',
                    fontSize: 20
                  },
                  legend: {
                    display: true,
                    position: 'right'
                  },
                  scales: {
                    yAxis: {
                      axis: 'y',
                      type: 'logarithmic',
                      min: 1,
                      max: iterations,
                      ticks: {
                        callback: function(value,index,values) {
                          var val = value;
                          while(val >= 10 && val % 10 == 0) {
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
                }}
              />
        </div>
      </div>
    </div>
    <div className="column is-one-third mr-2">
      <nav className="panel">
        <p className="panel-heading">
          Stress Parameters
        </p>
        <p className="control">
          <div className="columns p-2">
            <div className="column is-one-third">
            <span>Param 1</span>
            </div>
            <div className="column">
              <input className="input is-small" type="text" placeholder="Parameter 1"/>
            </div>
          </div>
        </p>
        <p className="control">
          <div className="columns p-2">
            <div className="column is-one-third">
            <span>Param 2</span>
            </div>
            <div className="column">
              <input className="input is-small" type="text" placeholder="Parameter 2"/>
            </div>
          </div>
        </p>
        <p className="control">
          <div className="columns p-2">
            <div className="column is-one-third">
            <span>Param 3</span>
            </div>
            <div className="column">
              <input className="input is-small" type="text" placeholder="Parameter 3"/>
            </div>
          </div>
        </p>
        <div className="panel-block">
          <button className="button is-link is-outlined is-fullwidth">
            Reset all Parameters
          </button>
        </div>
      </nav>
    </div>
  </div>
  <div className="columns">
    <div className="column is-one-fifth">
    <p className="control">
      <input className="input" type="text" placeholder="Iterations" onInput={(e) => {
              setIterations(e.target.value);
      }}/>
    </p>
    <div className="buttons mt-2">
      <button className="button is-primary" onClick={()=>{
              doMessagePassing();
            }} disabled={iterations < 0}>Start Test</button>
    </div>
    </div>
    <div className="column">
          {loading ? (<ReactBootStrap.Spinner animation="border" />) : (<><p></p></>)}
    </div>
  </div>
</>
    );
}