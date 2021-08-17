[[block]] struct AtomicMemory {
  value: array<atomic<u32>>;
};
[[block]] struct Memory {
  value: array<u32>;
};

[[block]] struct StressParamsMemory {
  value: [[stride(16)]] array<u32, 7>;
};

[[group(0), binding(0)]] var<storage, read_write> test_data : Memory;
[[group(0), binding(1)]] var<storage, read_write> atomic_test_data : AtomicMemory;
[[group(0), binding(2)]] var<storage, read_write> mem_locations : Memory;
[[group(0), binding(3)]] var<storage, read_write> results : Memory;
[[group(0), binding(4)]] var<storage, read_write> shuffled_ids : Memory;
[[group(0), binding(5)]] var<storage, read_write> barrier : AtomicMemory;
[[group(0), binding(6)]] var<storage, read_write> scratchpad : Memory;
[[group(0), binding(7)]] var<storage, read_write> scratch_locations : Memory;
[[group(0), binding(8)]] var<uniform> stress_params : StressParamsMemory;

fn spin() {
  var i : u32 = 0u;
  var bar_val : u32 = atomicAdd(&barrier.value[0], 1u);
  loop {
    if (i == 1024u || bar_val >= 2u) {
      break;
    }
    bar_val = atomicAdd(&barrier.value[0], 0u);
    i = i + 1u;
  }
}

fn do_stress(iterations: u32, pattern: u32, workgroup_id: u32) {
  let addr = scratch_locations.value[workgroup_id];
  switch(pattern) {
    case 0u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        scratchpad.value[addr] = i;
        scratchpad.value[addr] = i + 1u;
      }
    }
    case 1u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        scratchpad.value[addr] = i;
        let tmp1: u32 = scratchpad.value[addr];
        if (tmp1 > 100000u) {
          scratchpad.value[addr] = i;
          break;
        }
      }
    }
    case 2u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        let tmp1: u32 = scratchpad.value[addr];
        if (tmp1 > 100000u) {
          scratchpad.value[addr] = i;
          break;
        }
        scratchpad.value[addr] = i;
      }
    }
    case 3u: {
      for(var i: u32 = 0u; i < iterations; i = i + 1u) {
        let tmp1: u32 = scratchpad.value[addr];
        if (tmp1 > 100000u) {
          scratchpad.value[addr] = i;
          break;
        }
        let tmp2: u32 = scratchpad.value[addr];
        if (tmp2 > 100000u) {
          scratchpad.value[addr] = i;
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
  let mem_stress = stress_params.value[4];
  let do_barrier = stress_params.value[0];
  let ax = &atomic_test_data.value[mem_locations.value[0]];
  let ay = &atomic_test_data.value[mem_locations.value[1]];
  if (shuffled_ids.value[global_invocation_id[0]] == u32(workgroupXSize) * 0u + 0u) {
    if (mem_stress == 1u) {
      do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
    }
    if (do_barrier == 1u) {
      spin();
    }
    let r0 = atomicLoad(ax);
    atomicStore(ay, 1u);
    results.value[0] = r0;
  } elseif (shuffled_ids.value[global_invocation_id[0]] == u32(workgroupXSize) * 1u + 0u) {
    if (mem_stress == 1u) {
      do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
    }
    if (do_barrier == 1u) {
      spin();
    }
    let unused = atomicExchange(ax, 2u);
  } elseif (stress_params.value[1] == 1u) {  
    do_stress(stress_params.value[2], stress_params.value[3], workgroup_id[0]);  
  }
}
