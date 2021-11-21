struct TestData {
  x: atomic<u32>;
  y: atomic<u32>;
};

struct TestResult {
  x: u32;
  y: u32;
};

[[block]] struct TestLocations {
  value: [[stride(8)]] array<TestData>;
};

[[block]] struct TestResults {
  value: [[stride(8)]] array<TestResult>;
};

[[block]] struct AtomicMemory {
  value: array<atomic<u32>>;
};
[[block]] struct Memory {
  value: array<u32>;
};
[[block]] struct StressParamsMemory {
  value: [[stride(16)]] array<u32, 7>;
};

[[group(0), binding(0)]] var<storage, read_write> test_locations : TestLocations;
[[group(0), binding(1)]] var<storage, read_write> results : TestResults;
[[group(0), binding(2)]] var<storage, read_write> shuffled_workgroups : Memory;
[[group(0), binding(3)]] var<storage, read_write> barrier : AtomicMemory;
[[group(0), binding(4)]] var<storage, read_write> scratchpad : Memory;
[[group(0), binding(5)]] var<storage, read_write> scratch_locations : Memory;
[[group(0), binding(6)]] var<uniform> stress_params : StressParamsMemory;

fn spin(limit: u32) {
  var i : u32 = 0u;
  var bar_val : u32 = atomicAdd(&barrier.value[0], 1u);
  loop {
    if (i == 1024u || bar_val >= limit) {
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

fn permute_id(id: u32, factor: u32, mask: u32) -> u32 {
    return (id * factor) % mask;
}

let workgroupXSize = 256;
[[stage(compute), workgroup_size(workgroupXSize)]] fn main(
  [[builtin(local_invocation_id)]] local_invocation_id : vec3<u32>, 
  [[builtin(workgroup_id)]] workgroup_id: vec3<u32>,
  [[builtin(num_workgroups)]] num_workgroups: vec3<u32>) {
  let pre_stress = stress_params.value[4];
  let do_barrier = stress_params.value[0];
  let shuffled_workgroup = shuffled_workgroups.value[workgroup_id[0]];
  if (shuffled_workgroup < 2u) {
    let global_id = shuffled_workgroup * u32(workgroupXSize) + local_invocation_id[0];
    let total_ids = u32(workgroupXSize) * num_workgroups[0];
    let x_first = global_id;
    let y_first = permute_id(global_id, 419u, total_ids);
    let x_second = permute_id(global_id, 4099u, total_ids);
    let y_second = permute_id(x_second, 419u, total_ids);
    if (pre_stress == 1u) {
      do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
    }
    if (do_barrier == 1u) {
      spin(u32(workgroupXSize) * 2u);
    }
    atomicStore(&test_locations.value[y_first].y, 1u);
    atomicStore(&test_locations.value[x_first].x, 1u);
    let r0 = atomicLoad(&test_locations.value[x_second].x);
    let r1 = atomicLoad(&test_locations.value[y_second].y);
    var result: TestResult;
    result.x = r0;
    result.y = r1;
    results.value[global_id] = result;
  } elseif (stress_params.value[1] == 1u) {  
    do_stress(stress_params.value[2], stress_params.value[3], shuffled_workgroup);  
  }
}
