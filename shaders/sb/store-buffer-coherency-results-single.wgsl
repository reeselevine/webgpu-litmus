[[block]] struct TestResults {
  seq0: atomic<u32>;
  seq1: atomic<u32>;
  interleaved: atomic<u32>;
  weak: atomic<u32>;
};

[[block]] struct Memory {
  value: array<u32>;
};

[[block]] struct AtomicMemory {
  value: array<atomic<u32>>;
};

struct ReadResult {
  r0: atomic<u32>;
  r1: atomic<u32>;
};

[[block]] struct ReadResults {
  value: array<ReadResult>;
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
[[group(0), binding(1)]] var<storage, read_write> read_results : ReadResults;
[[group(0), binding(2)]] var<storage, read_write> test_results : TestResults;
[[group(0), binding(3)]] var<uniform> stress_params : StressParamsMemory;
[[group(0), binding(4)]] var<storage, read> shuffled_workgroups : Memory;

fn permute_id(id: u32, factor: u32, mask: u32) -> u32 {
  return (id * factor) % mask;
}

fn stripe_workgroup(workgroup_id: u32, local_id: u32) -> u32 {
  return (workgroup_id + 1u + local_id % (stress_params.testing_workgroups - 1u)) % stress_params.testing_workgroups;
}

let workgroupXSize = 1u;
[[stage(compute), workgroup_size(workgroupXSize)]] fn main(
  [[builtin(local_invocation_id)]] local_invocation_id : vec3<u32>,
  [[builtin(workgroup_id)]] workgroup_id : vec3<u32>) {
  if (workgroup_id[0] == 0u && local_invocation_id[0] == 0u) {
    let r0 = atomicLoad(&read_results.value[0u].r0);
    let r1 = atomicLoad(&read_results.value[0u].r1);
    if ((r0 == 2u && r1 == 0u)) {
      let unused = atomicAdd(&test_results.seq0, 1u);
    } elseif ((r0 == 0u && r1 == 1u)) {
      let unused = atomicAdd(&test_results.seq1, 1u);
    } elseif ((r0 == 2u && r1 == 1u)) {
      let unused = atomicAdd(&test_results.interleaved, 1u);
    } elseif ((r0 == 0u && r1 == 0u)) {
      let unused = atomicAdd(&test_results.weak, 1u);
    }
  }
}
