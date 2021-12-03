[[block]] struct TestResults {
  seq0: atomic<u32>;
  seq1: atomic<u32>;
  interleaved: atomic<u32>;
  weak: atomic<u32>;
};

[[block]] struct AtomicMemory {
  value: array<atomic<u32>>;
};

[[block]] struct Memory {
  value: array<u32>;
};

[[block]] struct StressParamsMemory {
  [[size(16)]] do_barrier: u32;
  [[size(16)]] mem_stress: u32;
  [[size(16)]] mem_stress_iterations: u32;
  [[size(16)]] mem_stress_pattern: u32;
  [[size(16)]] pre_stress: u32;
  [[size(16)]] pre_stress_iterations: u32;
  [[size(16)]] pre_stress_pattern: u32;
  [[size(16)]] permute_first: u32;
  [[size(16)]] permute_second: u32;
  [[size(16)]] testing_workgroups: u32;
  [[size(16)]] mem_stride: u32;
  [[size(16)]] location_offset: u32;
};

[[group(0), binding(0)]] var<storage, read_write> test_locations : AtomicMemory;
[[group(0), binding(1)]] var<storage, read_write> results : TestResults;
[[group(0), binding(2)]] var<storage, read_write> shuffled_workgroups : Memory;
[[group(0), binding(3)]] var<storage, read_write> barrier : AtomicMemory;
[[group(0), binding(4)]] var<storage, read_write> scratchpad : Memory;
[[group(0), binding(5)]] var<storage, read_write> scratch_locations : Memory;
[[group(0), binding(6)]] var<uniform> stress_params : StressParamsMemory;

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

let workgroupXSize = 256;
[[stage(compute), workgroup_size(workgroupXSize)]] fn main(
  [[builtin(local_invocation_id)]] local_invocation_id : vec3<u32>,
  [[builtin(workgroup_id)]] workgroup_id : vec3<u32>) {
  let shuffled_workgroup = shuffled_workgroups.value[workgroup_id[0]];
  if (shuffled_workgroup < stress_params.testing_workgroups) {
    let total_ids = u32(workgroupXSize) * stress_params.testing_workgroups;
    let id_0 = shuffled_workgroup * u32(workgroupXSize) + local_invocation_id[0];
    let new_workgroup = stripe_workgroup(shuffled_workgroup, local_invocation_id[0]);
    let id_1 = new_workgroup * u32(workgroupXSize) + permute_id(local_invocation_id[0], stress_params.permute_first, u32(workgroupXSize));;
    let x_0 = &test_locations.value[id_0 * stress_params.mem_stride * 2u];
    let y_0 = &test_locations.value[permute_id(id_0, stress_params.permute_second, total_ids) * stress_params.mem_stride * 2u + stress_params.location_offset];
    let x_1 = &test_locations.value[id_1 * stress_params.mem_stride * 2u];
    if (stress_params.pre_stress == 1u) {
      do_stress(stress_params.pre_stress_iterations, stress_params.pre_stress_pattern, shuffled_workgroup);
    }
    if (stress_params.do_barrier == 1u) {
      spin(u32(workgroupXSize) * stress_params.testing_workgroups);
    }
    atomicStore(x_0, 1u);
    let r0 = atomicLoad(y_0);
    atomicStore(x_1, 2u);
    storageBarrier();
    let mem_x_1 = atomicLoad(x_0);
    if ((r0 == 1u && mem_x_1 == 2u)) {
      atomicAdd(&results.seq0, 1u);
    } elseif ((r0 == 1u && mem_x_1 == 1u)) {
      atomicAdd(&results.seq1, 1u);
    } elseif ((r0 == 2u && mem_x_1 == 2u)) {
      atomicAdd(&results.interleaved, 1u);
    } elseif ((r0 == 2u && mem_x_1 == 1u)) {
      atomicAdd(&results.weak, 1u);
    }
  } elseif (stress_params.mem_stress == 1u) {
    do_stress(stress_params.mem_stress_iterations, stress_params.mem_stress_pattern, shuffled_workgroup);
  }
}
