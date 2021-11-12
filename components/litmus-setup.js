/** Default test parameters */
export const defaultTestParams = {
  minWorkgroups: 4,
  maxWorkgroups: 4,
  minWorkgroupSize: 256,
  maxWorkgroupSize: 256,
  shufflePct: 0,
  barrierPct: 0,
  numMemLocations: 2,
  testMemorySize: 2048,
  numOutputs: 2,
  scratchMemorySize: 2048,
  memStride: 64,
  memStressPct: 0,
  memStressIterations: 1024,
  memStressPattern: 2,
  preStressPct: 0,
  preStressIterations: 128,
  preStressPattern: 2,
  stressLineSize: 64,
  stressTargetLines: 2,
  stressAssignmentStrategy: 0,
  memoryAliases: {}
}
let currentIteration = 0;
let duration = 0;
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/** Used to set buffer sizes/clear buffers. */
const uint32ByteSize = 4;

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
    stressParamsArray[1] = 1;
  } else {
    stressParamsArray[1] = 0;
  }
  stressParamsArray[2] = testParams.memStressIterations;
  stressParamsArray[3] = testParams.memStressPattern;
  if (getRandomInt(100) < testParams.preStressPct) {
    stressParamsArray[4] = 1;
  } else {
    stressParamsArray[4] = 0;
  }
  stressParamsArray[5] = testParams.preStressIterations;
  stressParamsArray[6] = testParams.preStressPattern;

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
          type: "storage"
        }
      },
      {
        binding: 7,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      },
      {
        binding: 8,
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
          buffer: buffers.testData.deviceBuffer
        }
      },
      {
        binding: 1,
        resource: {
          buffer: buffers.testData.deviceBuffer
        }
      },
      {
        binding: 2,
        resource: {
          buffer: buffers.memLocations.deviceBuffer
        }
      },
      {
        binding: 3,
        resource: {
          buffer: buffers.results.deviceBuffer
        }
      },
      {
        binding: 4,
        resource: {
          buffer: buffers.shuffleIds.deviceBuffer
        }
      },
      {
        binding: 5,
        resource: {
          buffer: buffers.barrier.deviceBuffer
        }
      },
      {
        binding: 6,
        resource: {
          buffer: buffers.scratchpad.deviceBuffer
        }
      },
      {
        binding: 7,
        resource: {
          buffer: buffers.scratchLocations.deviceBuffer
        }
      },
      {
        binding: 8,
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
  let memLocations = new Array(testParams.numMemLocations);

  // interleave waiting for buffers to map with initializing
  // buffer values. This increases test throughput by about 2x. 
  const p1 = map_buffer(buffers.testData);
  const p2 = map_buffer(buffers.results);
  const p3 = map_buffer(buffers.barrier);
  const p4 = map_buffer(buffers.shuffleIds);
  const p5 = map_buffer(buffers.memLocations);
  const p6 = map_buffer(buffers.scratchLocations);


  await p1;
  clearBuffer(buffers.testData, testParams.testMemorySize);

  await p2;
  clearBuffer(buffers.results, testParams.numOutputs);

  await p3;
  clearBuffer(buffers.barrier, 1);

  await p4;
  setShuffleIds(buffers.shuffleIds, testParams, numWorkgroups, workgroupSize);

  await p5;
  setMemLocations(buffers.memLocations, testParams, memLocations);

  await p6;
  setScratchLocations(buffers.scratchLocations, testParams, numWorkgroups);

  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyBufferToBuffer(buffers.testData.writeBuffer, 0, buffers.testData.deviceBuffer, 0, testParams.testMemorySize * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.memLocations.writeBuffer, 0, buffers.memLocations.deviceBuffer, 0, testParams.numMemLocations * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.results.writeBuffer, 0, buffers.results.deviceBuffer, 0, testParams.numOutputs * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.shuffleIds.writeBuffer, 0, buffers.shuffleIds.deviceBuffer, 0, testParams.maxWorkgroups * testParams.maxWorkgroupSize * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.barrier.writeBuffer, 0, buffers.barrier.deviceBuffer, 0, 1 * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.scratchpad.writeBuffer, 0, buffers.scratchpad.deviceBuffer, 0, testParams.scratchMemorySize * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.scratchLocations.writeBuffer, 0, buffers.scratchLocations.deviceBuffer, 0, testParams.maxWorkgroups * uint32ByteSize);
  commandEncoder.copyBufferToBuffer(buffers.stressParams.writeBuffer, 0, buffers.stressParams.deviceBuffer, 0, 7 * uint32ByteSize);

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
    testParams.numOutputs * uint32ByteSize
  );

  commandEncoder.copyBufferToBuffer(
    buffers.testData.deviceBuffer,
    0,
    buffers.testData.readBuffer,
    0,
    testParams.testMemorySize * uint32ByteSize
  );

  // Submit GPU commands.
  const gpuCommands = commandEncoder.finish();
  device.queue.submit([gpuCommands]);

  // Read buffer.
  await buffers.results.readBuffer.mapAsync(GPUMapMode.READ);
  await buffers.testData.readBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = buffers.results.readBuffer.getMappedRange();
  const memBuffer = buffers.testData.readBuffer.getMappedRange();
  const memArray = new Uint32Array(memBuffer);
  const result = new Uint32Array(arrayBuffer).slice(0);
  const memResult = new Array(testParams.numMemLocations);
  for (let i = 0; i < testParams.numMemLocations; i++) {
    memResult[i] = memArray[memLocations[i]];
  }
  buffers.results.readBuffer.unmap();
  buffers.testData.readBuffer.unmap();
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
  const computePipeline = createComputePipeline(device, bindGroupLayout, shaderCode, workgroupSize);

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


export function getCurrentIteration() {
  return currentIteration;
}

export function reportTime() {
  return duration / 1000;
}
