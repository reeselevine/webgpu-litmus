import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTwoOutputTest } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'

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
    if (i == 20480u || bar_val >= 2u) {
      break;
    }
    bar_val = atomicAdd(&barrier.value[0],0u);
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
        if (tmp1 > 204800u) {
          break;
        }
      }
    }
    case 2u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        let tmp1: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
        if (tmp1 > 204800u) {
          break;
        }
        scratchpad.value[scratch_locations.value[workgroup_id]] = i;
      }
    }
    case 3u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        let tmp1: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
        if (tmp1 > 204800u) {
          break;
        }
        let tmp2: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
        if (tmp2 > 204800u) {
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
  let pre_stress = stress_params.value[4];
  let barrier_spin = stress_params.value[0];
  let mem_stress = stress_params.value[1];
  let a1 = &test_data.value[y];
  let a2 = &test_data.value[x];
  if (shuffled_ids.value[global_invocation_id[0]] == u32(workgroupXSize) * 0u + 0u) {
    if (pre_stress == 1u) {
      do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
    }
    if (barrier_spin == 1u) {
      spin();
    }
    atomicStore(a1, 1u);
    atomicStore(a2, 1u);
  } elseif (shuffled_ids.value[global_invocation_id[0]] == u32(workgroupXSize) * 1u + 0u) {
    if (pre_stress == 1u) {
      do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
    }
    if (barrier_spin == 1u) {
      spin();
    }
    let r0 = atomicLoad(a2);
    let r1 = atomicLoad(a1);
    atomicStore(&results.value[1], r1);
    atomicStore(&results.value[0], r0);
  } elseif (mem_stress == 1u) {
    do_stress(stress_params.value[2], stress_params.value[3], workgroup_id[0]);
  }
}
`
// atomicLoad(a1);
//    let r0 = atomicLoad(&test_data.value[x]);
//    let r1 = atomicLoad(&test_data.value[y]);
// do_stress(stress_params.value[2], stress_params.value[3], workgroup_id[0]);

export default function MessagePassing() {
  const thread0 = `0.1: x=1
0.2: y=1`
  const thread1 = `1.1: r0=y
1.2: r1=x`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0, y=0" finalState="r0=1 && r1=0"/>,
    code: (<>
      <TestThreadPseudoCode thread="0" code={thread0}/>
      <TestThreadPseudoCode thread="1" code={thread1}/>
    </>)
  };
  return makeTwoOutputTest(
    defaultTestParams, 
    "Message Passing",
    "The message passing litmus test checks to see if two stores in one thread can be re-ordered according to loads on a second thread.",
    shaderCode,
    pseudoCode);
}
