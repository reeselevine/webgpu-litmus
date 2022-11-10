struct Memory {
  value: array<u32>,
};

struct AtomicMemory {
  value: array<atomic<u32>>,
};

struct ReadResult {
  r0: atomic<u32>,
  r1: atomic<u32>,
};

struct ReadResults {
  value: array<ReadResult>,
};

struct StressParamsMemory {
  do_barrier: u32,
  mem_stress: u32,
  mem_stress_iterations: u32,
  mem_stress_pattern: u32,
  pre_stress: u32,
  pre_stress_iterations: u32,
  pre_stress_pattern: u32,
  permute_first: u32,
  permute_second: u32,
  testing_workgroups: u32,
  mem_stride: u32,
  location_offset: u32,
};

@group(0) @binding(1) var<storage, read_write> results : ReadResults;
@group(0) @binding(2) var<storage, read> shuffled_workgroups : Memory;
@group(0) @binding(3) var<storage, read_write> barrier : AtomicMemory;
@group(0) @binding(4) var<storage, read_write> scratchpad : Memory;
@group(0) @binding(5) var<storage, read_write> scratch_locations : Memory;
@group(0) @binding(6) var<uniform> stress_params : StressParamsMemory;
@group(0) @binding(0) var<storage, read_write> test_locations : AtomicMemory;

fn permute_id(id: u32, factor: u32, mask: u32) -> u32 {
  return (id * factor) % mask;
}

fn stripe_workgroup(workgroup_id: u32, local_id: u32) -> u32 {
  return (workgroup_id + 1u + local_id % (stress_params.testing_workgroups - 1u)) % stress_params.testing_workgroups;
}

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

override workgroupXSize: u32;
@compute @workgroup_size(workgroupXSize) fn main(
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(workgroup_id) workgroup_id : vec3<u32>) {
  let shuffled_workgroup = shuffled_workgroups.value[workgroup_id[0]];
  let x = shuffled_workgroups.value[0u] * workgroupXSize % (workgroupXSize * stress_params.testing_workgroups);
  let y = x + (1u << stress_params.mem_stride);
  if (shuffled_workgroup == 0u) {
    if (local_invocation_id[0] == workgroup_id[0] % workgroupXSize) {
      if (stress_params.pre_stress == 1u) {
        do_stress(stress_params.pre_stress_iterations, stress_params.pre_stress_pattern, shuffled_workgroup);
      }
      if (stress_params.do_barrier == 1u) {
        spin(2u);
      }
      atomicStore(&test_locations.value[x], 2u);
      atomicStore(&test_locations.value[y], 1u);
    }
  } else if (shuffled_workgroup == 1u) {
    if (local_invocation_id[0] == workgroup_id[0] % workgroupXSize) {
      if (stress_params.pre_stress == 1u) {
        do_stress(stress_params.pre_stress_iterations, stress_params.pre_stress_pattern, shuffled_workgroup);
      }
      if (stress_params.do_barrier == 1u) {
        spin(2u);
      }
      let unused = atomicExchange(&test_locations.value[y], 2u);
    }
    storageBarrier();
    if (local_invocation_id[0] == workgroup_id[0] % workgroupXSize) {
      atomicStore(&test_locations.value[x], 1u);
    }
  } else if (stress_params.mem_stress == 1u) {
    do_stress(stress_params.mem_stress_iterations, stress_params.mem_stress_pattern, shuffled_workgroup);
  }
}
