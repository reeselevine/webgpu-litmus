 struct TestResults {
  nonWeak: atomic<u32>,
  weak: atomic<u32>,
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

@group(0) @binding(0) var<storage, read_write> test_locations : AtomicMemory;
@group(0) @binding(1) var<storage, read_write> read_results : ReadResults;
@group(0) @binding(2) var<storage, read_write> test_results : TestResults;
@group(0) @binding(3) var<uniform> stress_params : StressParamsMemory;

fn permute_id(id: u32, factor: u32, mask: u32) -> u32 {
  return (id * factor) % mask;
}

fn stripe_workgroup(workgroup_id: u32, local_id: u32) -> u32 {
  return (workgroup_id + 1u + local_id % (stress_params.testing_workgroups - 1u)) % stress_params.testing_workgroups;
}

const workgroupXSize = 256;
@compute @workgroup_size(workgroupXSize) fn main(
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(workgroup_id) workgroup_id : vec3<u32>) {
  let total_ids = u32(workgroupXSize) * stress_params.testing_workgroups;
  let id_0 = workgroup_id[0] * u32(workgroupXSize) + local_invocation_id[0];
  let r0 = atomicLoad(&read_results.value[id_0].r0);
  let r1 = atomicLoad(&read_results.value[id_0].r1);
  if ((r0 == 0u && r1 == 0u)) {
    let unused = atomicAdd(&test_results.weak, 1u);
  } else {
    let unused = atomicAdd(&test_results.nonWeak, 1u);
  }
}
