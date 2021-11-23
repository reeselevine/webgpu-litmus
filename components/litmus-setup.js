/** Default test parameters */
export const defaultTestParams = {
  minWorkgroups: 4,
  maxWorkgroups: 4,
  minWorkgroupSize: 256,
  maxWorkgroupSize: 256,
  testingWorkgroups: 2,
  shufflePct: 0,
  barrierPct: 0,
  numMemLocations: 2,
  testMemorySize: 2048,
  numOutputs: 2,
  scratchMemorySize: 2048,
  memStride: 1,
  memStressPct: 0,
  memStressIterations: 1024,
  memStressPattern: 2,
  preStressPct: 0,
  preStressIterations: 128,
  preStressPattern: 2,
  stressLineSize: 64,
  stressTargetLines: 2,
  stressAssignmentStrategy: 0,
  permuteFirst: 4099,
  permuteSecond: 419,
  memoryAliases: {}
}
let currentIteration = 0;
let duration = 0;
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/** Used to set buffer sizes/clear buffers. */
const uint32ByteSize = 4;

/** Uniform buffer elements must align to a 16 byte boundary (see https://www.w3.org/TR/WGSL/#storage-class-layout-constraints). */
const uniformBufferAlignment = 4;
/** Number of individual stresss parameters. */
const numStressParams = 11;

/** Returns a random number in between the min and max values. */
function getRandomInRange(min, max) {
  if (min == max) {
    return min;
  } else {
    const offset = getRandomInt(max - min);
    return min + offset;
  }
}

/** Returns a GPU that can be used to run compute shaders. */
async function getDevice() {
  if (!navigator.gpu) {
    console.log(
      "WebGPU is not supported. Switch to Chrome Canary and enable chrome://flags/#enable-unsafe-webgpu flag."
    );
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.log("Failed to get GPU adapter.");
    return;
  }
  const device = await adapter.requestDevice();
  return device;
}

function createBuffer(device, bufferSize, copySrc, copyDst, bufferUsage = GPUBufferUsage.STORAGE) {
  var extraFlags = 0;
  var readBuffer = undefined;
  var writeBuffer = undefined;
  if (copySrc) {
    readBuffer = device.createBuffer({
      mappedAtCreation: false,
      size: bufferSize * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    extraFlags = extraFlags | GPUBufferUsage.COPY_SRC;
  }
  if (copyDst) {
    writeBuffer = device.createBuffer({
      mappedAtCreation: false,
      size: bufferSize * 4,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE
    });
    extraFlags = extraFlags | GPUBufferUsage.COPY_DST;
  }
  const deviceBuffer = device.createBuffer({
    mappedAtCreation: true,
    size: bufferSize * 4,
    usage: bufferUsage | extraFlags
  });
  const deviceArrayBuffer = deviceBuffer.getMappedRange();
  new Uint32Array(deviceArrayBuffer).fill(0, 0, bufferSize);
  deviceBuffer.unmap();
  return {
    deviceBuffer: deviceBuffer,
    readBuffer: readBuffer,
    writeBuffer: writeBuffer
  }
}

function map_buffer(buffer) {
  return buffer.writeBuffer.mapAsync(GPUMapMode.WRITE);
}

function clearBuffer(buffer, bufferSize) {
  const arrayBuffer = buffer.writeBuffer.getMappedRange();
  new Uint32Array(arrayBuffer).fill(0, 0, bufferSize);
  buffer.writeBuffer.unmap();
}

function setMemLocations(memLocations, testParams, referenceArray) {
  const memLocationsArrayBuffer = memLocations.writeBuffer.getMappedRange();
  const memLocationsArray = new Uint32Array(memLocationsArrayBuffer);
  const usedRegions = new Set();
  const locations = {};
  const numRegions = testParams.testMemorySize / testParams.memStride;
  for (let i = 0; i < testParams.numMemLocations; i++) {
    if (testParams.memoryAliases[i] !== undefined) {
      memLocationsArray[i] = locations[testParams.memoryAliases[i]];
      referenceArray[i] = memLocationsArray[i];
    } else {
      let region = getRandomInt(numRegions);
      while (usedRegions.has(region)) {
        region = getRandomInt(numRegions);
      }
      const locInRegion = getRandomInt(testParams.memStride);
      memLocationsArray[i] = region * testParams.memStride + locInRegion;
      locations[i] = region * testParams.memStride + locInRegion;
      usedRegions.add(region);
    }
    referenceArray[i] = memLocationsArray[i];

  }
  memLocations.writeBuffer.unmap();
}

function setShuffleIds(shuffleIds, testParams, numWorkgroups, workgroupSize) {
  const shuffleIdsArrayBuffer = shuffleIds.writeBuffer.getMappedRange();
  const shuffleIdsArray = new Uint32Array(shuffleIdsArrayBuffer);
  for (let i = 0; i < testParams.maxWorkgroups * testParams.maxWorkgroupSize; i++) {
    shuffleIdsArray[i] = i;
  }
  if (getRandomInt(100) < testParams.shufflePct) {
    for (let i = numWorkgroups - 1; i >= 0; i--) {
      const x = getRandomInt(i + 1);
      if (workgroupSize > 1) {
        for (let j = 0; j < workgroupSize; j++) {
          const temp = shuffleIdsArray[i * workgroupSize + j]
          shuffleIdsArray[i * workgroupSize + j] = shuffleIdsArray[x * workgroupSize + j];
          shuffleIdsArray[x * workgroupSize + j] = temp;
        }
        for (let j = workgroupSize - 1; j > 0; j--) {
          const y = getRandomInt(j + 1);
          const temp = shuffleIdsArray[i * workgroupSize + y];
          shuffleIdsArray[i * workgroupSize + y] = shuffleIdsArray[i * workgroupSize + j];
          shuffleIdsArray[i * workgroupSize + j] = temp;
        }
      } else {
        const temp = shuffleIdsArray[i];
        shuffleIdsArray[i] = shuffleIdsArray[x];
        shuffleIdsArray[x] = temp;
      }
    }
  }
  shuffleIds.writeBuffer.unmap();
}

function setShuffledWorkgroups(shuffledWorkgroups, testParams, numWorkgroups) {
  const shuffledWorkgroupsBuffer = shuffledWorkgroups.writeBuffer.getMappedRange();
  const shuffledWorkgroupsArray = new Uint32Array(shuffledWorkgroupsBuffer);
  for (let i = 0; i < numWorkgroups; i++) {
    shuffledWorkgroupsArray[i] = i;
  }
  if (getRandomInt(100) < testParams.shufflePct) {
    for (let i = numWorkgroups - 1; i > 0; i--) {
      const x = getRandomInt(i + 1);
      const temp = shuffledWorkgroupsArray[i];
      shuffledWorkgroupsArray[i] = shuffledWorkgroupsArray[x];
      shuffledWorkgroupsArray[x] = temp;
    }
  }
  shuffledWorkgroups.writeBuffer.unmap();
}

function setScratchLocations(scratchLocations, testParams, numWorkgroups) {
  const scratchLocationsArrayBuffer = scratchLocations.writeBuffer.getMappedRange();
  const scratchLocationsArray = new Uint32Array(scratchLocationsArrayBuffer);
  const scratchUsedRegions = new Set();
  const scratchNumRegions = testParams.scratchMemorySize / testParams.stressLineSize;
  for (let i = 0; i < testParams.stressTargetLines; i++) {
    let region = getRandomInt(scratchNumRegions);
    while (scratchUsedRegions.has(region)) {
      region = getRandomInt(scratchNumRegions);
    }
    const locInRegion = getRandomInt(testParams.stressLineSize);
    if (testParams.stressAssignmentStrategy == 0) {
      for (let j = i; j < numWorkgroups; j += testParams.stressTargetLines) {
        scratchLocationsArray[j] = region * testParams.stressLineSize + locInRegion;

      }
    } else if (testParams.stressAssignmentStrategy == 1) {
      const workgroupsPerLocation = numWorkgroups / testParams.stressTargetLines;
      for (let j = 0; j < workgroupsPerLocation; j++) {
        scratchLocationsArray[i * workgroupsPerLocation + j] = region * testParams.stressLineSize + locInRegion;
      }
      if (i == testParams.stressTargetLines - 1 && numWorkgroups % testParams.stressTargetLines != 0) {
        for (let j = 0; j < numWorkgroups % testParams.stressTargetLines; j++) {
          scratchLocationsArray[numWorkgroups - j - 1] = region * testParams.stressLineSize + locInRegion;
        }
      }
    }
    scratchUsedRegions.add(region);

  }
  scratchLocations.writeBuffer.unmap();
}

function setStressParams(stressParams, testParams) {
  const stressParamsArrayBuffer = stressParams.writeBuffer.getMappedRange();
  const stressParamsArray = new Uint32Array(stressParamsArrayBuffer);
  if (getRandomInt(100) < testParams.barrierPct) {
    stressParamsArray[0] = 1;
  } else {
    stressParamsArray[0] = 0;
  }
  if (getRandomInt(100) < testParams.memStressPct) {
    stressParamsArray[1*uniformBufferAlignment] = 1;
  } else {
    stressParamsArray[1*uniformBufferAlignment] = 0;
  }
  stressParamsArray[2*uniformBufferAlignment] = testParams.memStressIterations;
  stressParamsArray[3*uniformBufferAlignment] = testParams.memStressPattern;
  if (getRandomInt(100) < testParams.preStressPct) {
    stressParamsArray[4*uniformBufferAlignment] = 1;
  } else {
    stressParamsArray[4*uniformBufferAlignment] = 0;
  }
  stressParamsArray[5*uniformBufferAlignment] = testParams.preStressIterations;
  stressParamsArray[6*uniformBufferAlignment] = testParams.preStressPattern;
  stressParamsArray[7*uniformBufferAlignment] = testParams.permuteFirst;
  stressParamsArray[8*uniformBufferAlignment] = testParams.permuteSecond;
  stressParamsArray[9*uniformBufferAlignment] = testParams.testingWorkgroups;
  stressParamsArray[10*uniformBufferAlignment] = testParams.memStride;
  stressParams.writeBuffer.unmap();
}

function createBindGroupLayout(device) {
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
          type: "uniform"
        }
      }

    ]
  });
  return bindGroupLayout;
}

function createBindGroup(device, bindGroupLayout, buffers) {
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: buffers.testLocations.deviceBuffer
        }
      },
      {
        binding: 1,
        resource: {
          buffer: buffers.results.deviceBuffer
        }
      },
      {
        binding: 2,
        resource: {
          buffer: buffers.shuffledWorkgroups.deviceBuffer
        }
      },
      {
        binding: 3,
        resource: {
          buffer: buffers.barrier.deviceBuffer
        }
      },
      {
        binding: 4,
        resource: {
          buffer: buffers.scratchpad.deviceBuffer
        }
      },
      {
        binding: 5,
        resource: {
          buffer: buffers.scratchLocations.deviceBuffer
        }
      },
      {
        binding: 6,
        resource: {
          buffer: buffers.stressParams.deviceBuffer
        }
      }
    ]
  });
  return bindGroup;
}

function createComputePipeline(device, bindGroupLayout, shaderCode, workgroupSize) {
  // Compute shader code
  const messagePassingModule = device.createShaderModule({ code: shaderCode });

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
  return computePipeline;
}

async function runTestIteration(device, computePipeline, bindGroup, buffers, testParams, workgroupSize) {
  // Commands submission
  const numWorkgroups = getRandomInRange(testParams.minWorkgroups, testParams.maxWorkgroups);
  let testingThreads = workgroupSize * testParams.testingWorkgroups;
  let testLocationsSize = testingThreads * testParams.numMemLocations * testParams.memStride;
  let resultsSize = testingThreads * testParams.numOutputs;

  // interleave waiting for buffers to map with initializing
  // buffer values. This increases test throughput by about 2x. 
  const p1 = map_buffer(buffers.testLocations);
  const p2 = map_buffer(buffers.results);
  const p3 = map_buffer(buffers.shuffledWorkgroups);
  const p4 = map_buffer(buffers.barrier);
  const p5 = map_buffer(buffers.scratchLocations);

  await p1;
  clearBuffer(buffers.testLocations, testLocationsSize);

  await p2;
  clearBuffer(buffers.results, resultsSize);

  await p3;
  clearBuffer(buffers.barrier, 1);

  await p4;
  setShuffledWorkgroups(buffers.shuffledWorkgroups, testParams, numWorkgroups);

  await p5;
  setScratchLocations(buffers.scratchLocations, testParams, numWorkgroups);

  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyBufferToBuffer(buffers.testLocations.writeBuffer, 0, buffers.testLocations.deviceBuffer, 0, testLocationsSize * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.results.writeBuffer, 0, buffers.results.deviceBuffer, 0, resultsSize * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.barrier.writeBuffer, 0, buffers.barrier.deviceBuffer, 0, 1 * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.shuffledWorkgroups.writeBuffer, 0, buffers.shuffledWorkgroups.deviceBuffer, 0, testParams.maxWorkgroups * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.scratchpad.writeBuffer, 0, buffers.scratchpad.deviceBuffer, 0, testParams.scratchMemorySize * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.scratchLocations.writeBuffer, 0, buffers.scratchLocations.deviceBuffer, 0, testParams.maxWorkgroups * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.stressParams.writeBuffer, 0, buffers.stressParams.deviceBuffer, 0, numStressParams * uniformBufferAlignment * uint32ByteSize);

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatch(numWorkgroups);
  passEncoder.endPass();

  commandEncoder.copyBufferToBuffer(
    buffers.results.deviceBuffer,
    0,
    buffers.results.readBuffer,
    0,
    resultsSize * uint32ByteSize
  );

  commandEncoder.copyBufferToBuffer(
    buffers.testLocations.deviceBuffer,
    0,
    buffers.testLocations.readBuffer,
    0,
    testLocationsSize * uint32ByteSize
  );

  // Submit GPU commands.
  const gpuCommands = commandEncoder.finish();
  device.queue.submit([gpuCommands]);

  // Read buffer.
  await buffers.results.readBuffer.mapAsync(GPUMapMode.READ);
  await buffers.testLocations.readBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = buffers.results.readBuffer.getMappedRange();
  const memBuffer = buffers.testLocations.readBuffer.getMappedRange();
  const memResult = new Uint32Array(memBuffer).slice(0);
  const result = new Uint32Array(arrayBuffer).slice(0);
  buffers.results.readBuffer.unmap();
  buffers.testLocations.readBuffer.unmap();
  return {
    readResult: result,
    memResult: memResult
  };
}

export async function runLitmusTest(shaderCode, testParams, iterations, handleResult) {
  const device = await getDevice();
  if (device === undefined) {
    alert("WebGPU not enabled or supported!")
    return;
  }
  let testingThreads = testParams.maxWorkgroupSize * testParams.testingWorkgroups;
  const buffers = {
    testLocations: createBuffer(device, testingThreads * testParams.numMemLocations * testParams.memStride, true, true),
    results: createBuffer(device, testingThreads * testParams.numOutputs, true, true),
    shuffledWorkgroups: createBuffer(device, testParams.maxWorkgroups, false, true),
    barrier: createBuffer(device, 1, false, true),
    scratchpad: createBuffer(device, testParams.scratchMemorySize, false, true),
    scratchLocations: createBuffer(device, testParams.maxWorkgroups, false, true),
    stressParams: createBuffer(device, numStressParams*uniformBufferAlignment, false, true, GPUBufferUsage.UNIFORM)
  }

  const workgroupSize = getRandomInRange(testParams.minWorkgroupSize, testParams.maxWorkgroupSize);

  const bindGroupLayout = createBindGroupLayout(device);
  const bindGroup = createBindGroup(device, bindGroupLayout, buffers);
  const computePipeline = createComputePipeline(device, bindGroupLayout, shaderCode, workgroupSize);

  // Before the iterations we can initialize the scratchpad
  // and set the stress parameters. Increases test throughput
  // a little more
  const p0 = map_buffer(buffers.scratchpad);
  await p0;
  clearBuffer(buffers.scratchpad, testParams.scratchMemorySize);

  const p1 = map_buffer(buffers.stressParams);
  await p1;
  setStressParams(buffers.stressParams, testParams);

  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    currentIteration = i;
    const result = await runTestIteration(device, computePipeline, bindGroup, buffers, testParams, workgroupSize);

    handleResult(result.readResult, result.memResult);
    duration = Date.now() - start;
  }
}

export async function runEvaluationLitmusTest(
  validShader,
  buggyShader,
  testParams,
  buggyParams,
  iterations,
  buggyPercentage,
  handleResult) {
  const device = await getDevice();
  if (device === undefined) {
    alert("WebGPU not enabled or supported!")
    return;
  }
  const buffers = {
    testData: createBuffer(device, testParams.testMemorySize, true, true),
    memLocations: createBuffer(device, testParams.numMemLocations, false, true),
    results: createBuffer(device, testParams.numOutputs, true, true),
    shuffleIds: createBuffer(device, testParams.maxWorkgroups * testParams.maxWorkgroupSize, false, true),
    barrier: createBuffer(device, 1, false, true),
    scratchpad: createBuffer(device, testParams.scratchMemorySize, false, true),
    scratchLocations: createBuffer(device, testParams.maxWorkgroups, false, true),
    stressParams: createBuffer(device, 7 * 4, false, true, GPUBufferUsage.UNIFORM)
  }

  const workgroupSize = getRandomInRange(testParams.minWorkgroupSize, testParams.maxWorkgroupSize);

  const bindGroupLayout = createBindGroupLayout(device);
  const bindGroup = createBindGroup(device, bindGroupLayout, buffers);

  // Before the iterations we can initialize the scratchpad
  // and set the stress parameters. Increases test throughput
  // a little more
  const p0 = map_buffer(buffers.scratchpad);
  await p0;
  clearBuffer(buffers.scratchpad, testParams.scratchMemorySize);

  const p7 = map_buffer(buffers.stressParams);
  await p7;
  setStressParams(buffers.stressParams, testParams);
  const start = Date.now();

  for (let i = 0; i < iterations; i++) {
    let shaderCode;
    let params;
    if (Math.random() <= buggyPercentage) {
      shaderCode = buggyShader;
      params = buggyParams;
    } else {
      shaderCode = validShader;
      params = testParams;
    }
    const computePipeline = createComputePipeline(device, bindGroupLayout, shaderCode, workgroupSize);
    currentIteration = i;
    const result = await runTestIteration(device, computePipeline, bindGroup, buffers, params, workgroupSize);
    handleResult(result.readResult, result.memResult);
    duration = Date.now() - start;
  }
}

export async function runParallelLitmusTest(shader, iterations, handleResult) {
  const device = await getDevice();
  if (device === undefined) {
    alert("WebGPU not enabled or supported!")
    return;
  }
  const dataBufSize = 65536 * 2;
  const controlBufSize = 1;
  const dataBuffer = createBuffer(device, dataBufSize, false, true);
  const controlBuffer = createBuffer(device, controlBufSize, true, true)
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
      }
    ]
  });
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: dataBuffer.deviceBuffer
        }
      },
      {
        binding: 1,
        resource: {
          buffer: controlBuffer.deviceBuffer
        }
      }
    ]
  });
  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    currentIteration = i;
    const computePipeline = createComputePipeline(device, bindGroupLayout, shader, 256);
    const p1 = map_buffer(dataBuffer);
    const p2 = map_buffer(controlBuffer);
    await p1;
    clearBuffer(dataBuffer, dataBufSize);
    await p2;
    clearBuffer(controlBuffer, controlBufSize);
    const commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(dataBuffer.writeBuffer, 0, dataBuffer.deviceBuffer, 0, dataBufSize * uint32ByteSize);
    commandEncoder.copyBufferToBuffer(controlBuffer.writeBuffer, 0, controlBuffer.deviceBuffer, 0, controlBufSize * uint32ByteSize);
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatch(256);
    passEncoder.endPass();

    commandEncoder.copyBufferToBuffer(
      controlBuffer.deviceBuffer,
      0,
      controlBuffer.readBuffer,
      0,
      controlBufSize * uint32ByteSize
    );

    // Submit GPU commands.
    const gpuCommands = commandEncoder.finish();
    device.queue.submit([gpuCommands]);

    // Read buffer.
    await controlBuffer.readBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = controlBuffer.readBuffer.getMappedRange();
    const result = new Uint32Array(arrayBuffer).slice(0);
    controlBuffer.readBuffer.unmap();
    handleResult(result);
    duration = Date.now() - start;
  }
}

export async function runPrefixSum(numWorkgroups, workgroupSize, n_seq, shader, iterations, handleResult) {
  const device = await getDevice();
  if (device === undefined) {
    alert("WebGPU not enabled or supported!")
    return;
  }
  const dataBufSize = numWorkgroups * workgroupSize * n_seq;
  const controlBufSize = 3 * numWorkgroups + 2;
  const dataBuffer = createBuffer(device, dataBufSize, true, true);
  const controlBuffer = createBuffer(device, controlBufSize, false, true);
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
      }
    ]
  });
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: dataBuffer.deviceBuffer
        }
      },
      {
        binding: 1,
        resource: {
          buffer: controlBuffer.deviceBuffer
        }
      }
    ]
  });
  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    const computePipeline = createComputePipeline(device, bindGroupLayout, shader, workgroupSize);
    const p1 = map_buffer(controlBuffer);
    const p2 = map_buffer(dataBuffer);
    await p1;
    clearBuffer(controlBuffer, controlBufSize);
    await p2;
    const writeArrayBuffer = dataBuffer.writeBuffer.getMappedRange();
    const writeArray = new Uint32Array(writeArrayBuffer);
    for (let i = 0; i < dataBufSize; i++) {
      writeArray[i] = i;
    }
    dataBuffer.writeBuffer.unmap();
    const commandEncoder = device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(dataBuffer.writeBuffer, 0, dataBuffer.deviceBuffer, 0, dataBufSize * uint32ByteSize);
    commandEncoder.copyBufferToBuffer(controlBuffer.writeBuffer, 0, controlBuffer.deviceBuffer, 0, controlBufSize * uint32ByteSize);
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatch(numWorkgroups);
    passEncoder.endPass();
    commandEncoder.copyBufferToBuffer(dataBuffer.deviceBuffer, 0, dataBuffer.readBuffer, 0, dataBufSize * uint32ByteSize);

    // Submit GPU commands.
    const gpuCommands = commandEncoder.finish();
    device.queue.submit([gpuCommands]);

    // Read buffer.
    await dataBuffer.readBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = dataBuffer.readBuffer.getMappedRange();
    const result = new Uint32Array(arrayBuffer);
    handleResult(result);
    dataBuffer.readBuffer.unmap();
    duration = Date.now() - start;
  }
}

export function getCurrentIteration() {
  return currentIteration;
}

export function reportTime() {
  return duration / 1000;
}
