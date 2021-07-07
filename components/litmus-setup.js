import { getRouteRegex } from "next/dist/next-server/lib/router/utils";

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomInRange(min, max) {
    if (min == max) {
        return min;
    } else {
        const offset = getRandomInt(max - min);
        return min + size;
    }
}
  
export async function runLitmusTest() {

    // Constants
    const minWorkgroups = 4
    const maxWorkgroups = 4
    const minWorkgroupSize = 1
    const maxWorkgroupSize = 1 
    const shufflePct = 100
    const barrierPct = 100
    const numMemLocations = 2
    const testMemorySize = 128
    const numOutputs = 2
    const scratchMemorySize = 256
    const memStride = 8
    const memStressPct = 100
    const memStressIterations = 100
    const memStressPattern = 0
    const preStressPct = 100
    const preStressIterations = 100
    const preStressPattern = 0
    const stressLineSize = 4
    const stressTargetLines = 4
    const testName = "message-passing"
    const stressAssignmentStrategy = "round-robin"

    const uint32ByteSize = 4

    if (!navigator.gpu) {
        console.log(
        "WebGPU is not supported. Enable chrome://flags/#enable-unsafe-webgpu flag."
        );
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.log("Failed to get GPU adapter.");
        return;
    }
    const device = await adapter.requestDevice();


    const numWorkgroups = getRandomInRange(minWorkgroups, maxWorkgroups);
    const workgroupSize = getRandomInRange(minWorkgroupSize, maxWorkgroupSize);

    //Initialize buffers
    const testData = device.createBuffer({
        mappedAtCreation: true,
        size: testMemorySize * uint32ByteSize,
        usage: GPUBufferUsage.STORAGE
    });
    const testDataArrayBuffer = testData.getMappedRange();
    new Uint32Array(testDataArrayBuffer).fill(0, 0, testMemorySize);
    testData.unmap();

    const memLocations = device.createBuffer({
        mappedAtCreation: true,
        size: numMemLocations * uint32ByteSize,
        usage: GPUBufferUsage.STORAGE
    });
    const memLocationsArrayBuffer = memLocations.getMappedRange();
    const memLocationsArray = new Uint32Array(memLocationsArrayBuffer);
    const usedRegions = new Set();
    const numRegions = testMemorySize / memStride;
    for (let i = 0; i < numMemLocations; i++) {
        let region = getRandomInt(numRegions);
        while(usedRegions.has(region)) {
            region = getRandomInt(numRegions);
        }
        const locInRegion = getRandomInt(memStride);
        memLocationsArray[i] = region*memStride + locInRegion;
        usedRegions.add(region);
    }
    memLocations.unmap();

    const results = device.createBuffer({
        mappedAtCreation: true,
        size: numOutputs * uint32ByteSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });
    const resultsArrayBuffer = results.getMappedRange();
    new Uint32Array(resultsArrayBuffer).fill(0, 0, numOutputs);
    results.unmap();

    const shuffleIds = device.createBuffer({
        mappedAtCreation: true,
        size: maxWorkgroups * maxWorkgroupSize * uint32ByteSize,
        usage: GPUBufferUsage.STORAGE
    });

    const shuffleIdsArrayBuffer = shuffleIds.getMappedRange();
    const shuffleIdsArray = new Uint32Array(shuffleIdsArrayBuffer);
    for (let i = 0; i < maxWorkgroups * maxWorkgroupSize; i++) {
        shuffleIdsArray[i] = i;
    }
    if (getRandomInt(100) < shufflePct) {
        for (let i = numWorkgroups - 1; i >= 0; i--) {
            const x = getRandomInt(i + 1);
            if (workgroupSize > 1) {
                for (let j = 0; j < workgroupSize; j++) {
                    const temp = shuffleIdsArray[i*workgroupSize + j]
                    shuffleIdsArray[i*workgroupSize + j] = shuffleIdsArray[x*workgroupSize + j];
                    shuffleIdsArray[x*workgroupSize + j] = temp;
                }
                for (let j = workgroupSize - 1; j > 0; j--) {
                    const y = getRandomInt(j + 1);
                    const temp = shuffleIdsArray[i*workgroupSize + y];
                    shuffleIdsArray[i*workgroupSize + y] = shuffleIdsArray[i*workgroupSize + j];
                    shuffleIdsArray[i*workgroupSize + j] = temp;
                }
            } else {
                const temp = shuffleIdsArray[i];
                shuffleIdsArray[i] = shuffleIdsArray[x];
                shuffleIdsArray[x] = temp;
            }
        }
    }
    shuffleIds.unmap();

    const barrier = device.createBuffer({
        mappedAtCreation: true,
        size: 1 * uint32ByteSize,
        usage: GPUBufferUsage.STORAGE
    });
    const barrierArrayBuffer = barrier.getMappedRange();
    new Uint32Array(barrierArrayBuffer).fill(0, 0, 1);
    barrier.unmap();

    const scratchpad = device.createBuffer({
        mappedAtCreation: true,
        size: scratchMemorySize * uint32ByteSize,
        usage: GPUBufferUsage.STORAGE
    });
    const scratchpadArrayBuffer = scratchpad.getMappedRange();
    new Uint32Array(scratchpadArrayBuffer).fill(0, 0, scratchMemorySize);
    scratchpad.unmap();

    const scratchLocations = device.createBuffer({
        mappedAtCreation: true,
        size: maxWorkgroups * uint32ByteSize,
        usage: GPUBufferUsage.STORAGE
    });
    const scratchLocationsArrayBuffer = scratchLocations.getMappedRange();
    const scratchLocationsArray = new Uint32Array(scratchLocationsArrayBuffer);
    const scratchUsedRegions = new Set();
    const scratchNumRegions = scratchMemorySize / stressLineSize;
    for (let i = 0; i < stressTargetLines; i++) {
        let region = getRandomInt(scratchNumRegions);
        while(scratchUsedRegions.has(region)) {
            region = getRandomInt(scratchNumRegions);
        }
        const locInRegion = getRandomInt(stressLineSize);
        if (stressAssignmentStrategy == "round-robin") {
            for (let j = i; j < numWorkgroups; j += stressTargetLines) {
                scratchLocationsArray[j] = region * stressLineSize + locInRegion;

            }
        } else if (stressAssignmentStrategy == "chunking") {
            const workgroupsPerLocation = numWorkgroups/stressTargetLines;
            for (let j = 0; j < workgroupsPerLocation; j++) {
                scratchLocationsArray[i*workgroupsPerLocation + j] = region * stressLineSize + locInRegion;
            }
            if (i == stressTargetLines - 1 && numWorkgroups % stressTargetLines != 0) {
                for (let j = 0; j < numWorkgroups % stressTargetLines; j++) {
                    scratchLocationsArray[numWorkgroups - j - 1] = region * stressLineSize + locInRegion;
                }
            }
        }
        scratchUsedRegions.add(region);
 
    }
    scratchLocations.unmap();

    const stressParams = device.createBuffer({
        mappedAtCreation: true,
        size: 7 * uint32ByteSize,
        usage: GPUBufferUsage.STORAGE
    });
    const stressParamsArrayBuffer = stressParams.getMappedRange();
    const stressParamsArray = new Uint32Array(stressParamsArrayBuffer);
    if (getRandomInt(100) < barrierPct) {
        stressParamsArray[0] = 1;
    } else {
        stressParamsArray[0] = 0;
    }
    if (getRandomInt(100) < memStressPct) {
        stressParamsArray[1] = 1;
    } else {
        stressParamsArray[1] = 0;
    }
    stressParamsArray[2] = memStressIterations;
    stressParamsArray[3] = memStressPattern;
    if (getRandomInt(100) < preStressPct) {
        stressParamsArray[4] = 1;
    } else {
        stressParamsArray[4] = 0;
    }
    stressParamsArray[5] = preStressIterations;
    stressParamsArray[6] = preStressPattern;

    stressParams.unmap();

  // Bind group layout and bind group

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      },
      {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      },
      {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      },
      {
        binding: 5,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      },
      {
        binding: 6,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      },
      {
        binding: 7,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      }
    ]
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: testData 
        }
      },
      {
        binding: 1,
        resource: {
          buffer: memLocations 
        }
      },
      {
        binding: 2,
        resource: {
          buffer: results
        }
      },
      {
        binding: 3,
        resource: {
          buffer: shuffleIds 
        }
      },
      {
        binding: 4,
        resource: {
          buffer: barrier 
        }
      },
      {
        binding: 5,
        resource: {
          buffer: scratchpad 
        }
      },
      {
        binding: 6,
        resource: {
          buffer: scratchLocations 
        }
      },
      {
        binding: 7,
        resource: {
          buffer: stressParams 
        }
      }
    ]
  });

  // Compute shader code
  const messagePassingModule = device.createShaderModule({
    code: `
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
        for(var i: u32 = 0u; i < iterations; i = i + 1u) {
          if (pattern == 0u) {
            scratchpad.value[scratch_locations.value[workgroup_id]] = i;
            scratchpad.value[scratch_locations.value[workgroup_id]] = i + 1u;
          } elseif (pattern == 1u) {
            scratchpad.value[scratch_locations.value[workgroup_id]] = i;
            let tmp1: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
            if (tmp1 > 100u) {
              break;
            }
          } elseif (pattern == 2u) {
            let tmp1: u32 = scratchpad.value[scratch_locations.value[workgroup_id]];
            if (tmp1 > 100u) {
              break;
            }
            scratchpad.value[scratch_locations.value[workgroup_id]] = i;
          } elseif (pattern == 3u) {
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
      }
      
      [[override]] let workgroupXSize: i32;
      [[stage(compute), workgroup_size(1u)]] fn main([[builtin(workgroup_id)]] workgroup_id : vec3<u32>, [[builtin(global_invocation_id)]] global_invocation_id : vec3<u32>, [[builtin(local_invocation_index)]] local_invocation_index : u32) {
        var y : u32 = mem_locations.value[0];
        var x : u32 = mem_locations.value[1];
        if (shuffled_ids.value[global_invocation_id[0]] == local_invocation_index) {
          if (stress_params.value[4] == 1u) {
            do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
          }
          if (stress_params.value[0] == 1u) {
            spin();
          }
          atomicStore(&test_data.value[y], 1u);
          atomicStore(&test_data.value[x], 1u);
        } elseif (shuffled_ids.value[global_invocation_id[0]] == local_invocation_index) {
          if (stress_params.value[4] == 1u) {
            do_stress(stress_params.value[5], stress_params.value[6], workgroup_id[0]);
          }
          if (stress_params.value[0] == 1u) {
            spin();
          }
          let r0 = atomicLoad(&test_data.value[x]);
          let r1 = atomicLoad(&test_data.value[y]);
          atomicStore(&results.value[0], r0);
          atomicStore(&results.value[1], r1);
        } elseif (stress_params.value[1] == 1u) {
          do_stress(stress_params.value[2], stress_params.value[3], workgroup_id[0]);
        }
      }
    `
  });

  // Pipeline setup

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    compute: {
      module: messagePassingModule,
      entryPoint: "main",
      constants: {
          workgroupXSize: workgroupSize
      }
    }
  });

  // Commands submission

  const commandEncoder = device.createCommandEncoder();

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatch(numWorkgroups);
  passEncoder.endPass();

  const resultsReadBuffer = device.createBuffer({
    size: numOutputs * uint32ByteSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  commandEncoder.copyBufferToBuffer(
    results,
    0,
    resultsReadBuffer,
    0,
    numOutputs * uint32ByteSize
  );

  // Submit GPU commands.
  const gpuCommands = commandEncoder.finish();
  device.queue.submit([gpuCommands]);

  // Read buffer.
  await resultsReadBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = resultsReadBuffer.getMappedRange();
  console.log(new Uint32Array(arrayBuffer));
}