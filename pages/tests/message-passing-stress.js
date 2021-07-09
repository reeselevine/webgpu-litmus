import Link from 'next/link'
import { useState } from "react"
import { defaultTestParams, runLitmusTest } from '../../components/litmus-setup.js'


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

export default function MessagePassingStress() {
  const initialResults = {
    bothOne: 0,
    oneZero: 0,
    zeroOne: 0,
    bothZero: 0
  }
  const [results, setResults] = useState(initialResults);
  function doMessagePassing() {
    setResults(initialResults);
    const p = runLitmusTest(shaderCode, defaultTestParams, 100);
    p.then(
      success => {
        console.log(success)
        setResults(success)
      },
      error => console.log(error)
    );
  }

  return (
      <>
        <h1>Message Passing (with stress)</h1>
        <h2>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </h2>
        <div>
          <p> r0=1 and r1=1: {results.bothOne} </p>
          <p> r0=0 and r1=0: {results.bothZero} </p>
          <p> r0=0 and r1=1: {results.zeroOne} </p>
          <p> r0=1 and r1=0 (weak behavior): {results.oneZero} </p>
          <button onClick={() => doMessagePassing()}>
            Run Message Passing Litmus Test
          </button>
        </div>
      </>
    )
}
