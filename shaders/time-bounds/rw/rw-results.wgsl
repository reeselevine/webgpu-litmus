struct TestResults {
  sequential: atomic<u32>,
  interleaved: atomic<u32>,
  racy: atomic<u32>,
  unbound: atomic<u32>,
  other: atomic<u32>
};

struct Memory {
  value: array<u32>,
};

struct ReadResult {
  flag: u32, 
  r0: u32,
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

@group(0) @binding(0) var<storage, read_write> test_locations : Memory;
@group(0) @binding(1) var<storage, read_write> read_results : ReadResults;
@group(0) @binding(2) var<storage, read_write> test_results : TestResults;
@group(0) @binding(3) var<uniform> stress_params : StressParamsMemory;

override workgroupXSize: u32;
@compute @workgroup_size(workgroupXSize) fn main(
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(workgroup_id) workgroup_id : vec3<u32>) {
  let id_0 = workgroup_id[0] * workgroupXSize + local_invocation_id[0];
  let flag = read_results.value[id_0].flag;
  let r0 = read_results.value[id_0].r0;
  let mem_val = test_locations.value[id_0 * stress_params.mem_stride];
  if (flag == 1 && r0 == 2 && mem_val == 3) {
    atomicAdd(&test_results.sequential, 1);
  } else if (flag == 0 && r0 == 2 && mem_val == 1) {
    atomicAdd(&test_results.sequential, 1);
  } else if (flag == 1 && r0 == 1 & mem_val == 3) {
    atomicAdd(&test_results.interleaved, 1);
  } else if (flag == 0 && r0 == 1 & mem_val == 3) {
    atomicAdd(&test_results.interleaved, 1);
  } else if (flag == 0 && r0 == 2 & mem_val == 3) {
    atomicAdd(&test_results.racy, 1);
  } else if (flag == 0 && r0 == 1 & mem_val == 1) {
    atomicAdd(&test_results.racy, 1);
  } else if (flag == 1 && r0 == 2 & mem_val == 1) {
    atomicAdd(&test_results.unbound, 1);
  } else if (flag == 1 && r0 == 1 & mem_val == 1) {
    atomicAdd(&test_results.unbound, 1);
  } else {
    atomicAdd(&test_results.other, 1);
  }
}