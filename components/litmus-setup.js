import { getRouteRegex } from "next/dist/next-server/lib/router/utils";

/** Default test parameters */
export const defaultTestParams = {
    minWorkgroups: 4,
    maxWorkgroups: 4,
    minWorkgroupSize: 1,
    maxWorkgroupSize: 1,
    shufflePct: 100,
    barrierPct: 100,
    numMemLocations: 2,
    testMemorySize: 128,
    numOutputs: 2,
    scratchMemorySize: 256,
    memStride: 8,
    memStressPct: 100,
    memStressIterations: 100,
    memStressPattern: 0,
    preStressPct: 100,
    preStressIterations: 100,
    preStressPattern: 0,
    stressLineSize: 4,
    stressTargetLines: 4,
    stressAssignmentStrategy: "round-robin"
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/** Returns a random number in between the min and max values. */
function getRandomInRange(min, max) {
    if (min == max) {
        return min;
    } else {
        const offset = getRandomInt(max - min);
        return min + size;
    }
}

/** Returns a GPU that can be used to run compute shaders. */
async function getDevice() {
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
    return device;
}

function createBuffer(device, bufferSize, copySrc, copyDst) {
    var extraFlags = 0;
    var readBuffer = undefined;
    var writeBuffer = undefined;
    if (copySrc) {
        readBuffer = device.createBuffer({
            mappedAtCreation: false,
            size:  bufferSize * 4,
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
        usage: GPUBufferUsage.STORAGE | extraFlags
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

async function clearBuffer(buffer, bufferSize) {
    await buffer.writeBuffer.mapAsync(GPUMapMode.WRITE);
    const arrayBuffer = buffer.writeBuffer.getMappedRange();
    new Uint32Array(arrayBuffer).fill(0, 0, bufferSize);
    buffer.writeBuffer.unmap();
}

async function setMemLocations(memLocations, testParams) {
    await memLocations.writeBuffer.mapAsync(GPUMapMode.WRITE);
    const memLocationsArrayBuffer = memLocations.writeBuffer.getMappedRange();
    const memLocationsArray = new Uint32Array(memLocationsArrayBuffer);
    const usedRegions = new Set();
    const numRegions = testParams.testMemorySize / testParams.memStride;
    for (let i = 0; i < testParams.numMemLocations; i++) {
        let region = getRandomInt(numRegions);
        while(usedRegions.has(region)) {
            region = getRandomInt(numRegions);
        }
        const locInRegion = getRandomInt(testParams.memStride);
        memLocationsArray[i] = region*testParams.memStride + locInRegion;
        usedRegions.add(region);
    }
    memLocations.writeBuffer.unmap();
}

async function setShuffleIds(shuffleIds, testParams, numWorkgroups, workgroupSize) {
  await shuffleIds.writeBuffer.mapAsync(GPUMapMode.WRITE);
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
    shuffleIds.writeBuffer.unmap();
}

async function setScratchLocations(scratchLocations, testParams, numWorkgroups) {
    await scratchLocations.writeBuffer.mapAsync(GPUMapMode.WRITE);
    const scratchLocationsArrayBuffer = scratchLocations.writeBuffer.getMappedRange();
    const scratchLocationsArray = new Uint32Array(scratchLocationsArrayBuffer);
    const scratchUsedRegions = new Set();
    const scratchNumRegions = testParams.scratchMemorySize / testParams.stressLineSize;
    for (let i = 0; i < testParams.stressTargetLines; i++) {
        let region = getRandomInt(scratchNumRegions);
        while(scratchUsedRegions.has(region)) {
            region = getRandomInt(scratchNumRegions);
        }
        const locInRegion = getRandomInt(testParams.stressLineSize);
        if (testParams.stressAssignmentStrategy == "round-robin") {
            for (let j = i; j < numWorkgroups; j += testParams.stressTargetLines) {
                scratchLocationsArray[j] = region * testParams.stressLineSize + locInRegion;

            }
        } else if (testParams.stressAssignmentStrategy == "chunking") {
            const workgroupsPerLocation = numWorkgroups/testParams.stressTargetLines;
            for (let j = 0; j < workgroupsPerLocation; j++) {
                scratchLocationsArray[i*workgroupsPerLocation + j] = region * testParams.stressLineSize + locInRegion;
            }
            if (i == stressParams.stressTargetLines - 1 && numWorkgroups % testParams.stressTargetLines != 0) {
                for (let j = 0; j < numWorkgroups % testParams.stressTargetLines; j++) {
                    scratchLocationsArray[numWorkgroups - j - 1] = region * testParams.stressLineSize + locInRegion;
                }
            }
        }
        scratchUsedRegions.add(region);
 
    }
    scratchLocations.writeBuffer.unmap();
}

async function setStressParams(stressParams, testParams) {
    await stressParams.writeBuffer.mapAsync(GPUMapMode.WRITE);
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
        }
    ]});
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
                buffer: buffers.memLocations.deviceBuffer
            }
        },
        {
            binding: 2,
            resource: {
                buffer: buffers.results.deviceBuffer
            }
        },
        {
            binding: 3,
            resource: {
                buffer: buffers.shuffleIds.deviceBuffer
            }
        },
        {
            binding: 4,
            resource: {
                buffer: buffers.barrier.deviceBuffer
            }
        },
        {
            binding: 5,
            resource: {
                buffer: buffers.scratchpad.deviceBuffer 
            }
        },
        {
            binding: 6,
            resource: {
                buffer: buffers.scratchLocations.deviceBuffer
            }
        },
        {
            binding: 7,
            resource: {
                buffer: buffers.stressParams.deviceBuffer 
            }
        }
    ]});
    return bindGroup;
}

function createComputePipeline(device, bindGroupLayout, shaderCode, workgroupSize) {
    // Compute shader code
    const messagePassingModule = device.createShaderModule({code: shaderCode});

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
  const uint32ByteSize = 4;
  const numWorkgroups = getRandomInRange(testParams.minWorkgroups, testParams.maxWorkgroups);
  await clearBuffer(buffers.testData, testParams.testMemorySize);
  await setMemLocations(buffers.memLocations, testParams);
  await clearBuffer(buffers.results, testParams.numOutputs);
  await setShuffleIds(buffers.shuffleIds, testParams, numWorkgroups, workgroupSize);
  await clearBuffer(buffers.barrier, 1);
  await clearBuffer(buffers.scratchpad, testParams.scratchMemorySize);
  await setScratchLocations(buffers.scratchLocations, testParams, numWorkgroups);
  await setStressParams(buffers.stressParams, testParams);
  
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

  // Submit GPU commands.
  const gpuCommands = commandEncoder.finish();
  device.queue.submit([gpuCommands]);

  // Read buffer.
  await buffers.results.readBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = buffers.results.readBuffer.getMappedRange();
  console.log(new Uint32Array(arrayBuffer));
  buffers.results.readBuffer.unmap();
}

export async function runLitmusTest(shaderCode, testParams) {
    const device = await getDevice();
    const buffers = {
        testData: createBuffer(device, testParams.testMemorySize, true, true),
        memLocations: createBuffer(device, testParams.numMemLocations, false, true),
        results: createBuffer(device, testParams.numOutputs, true, true),
        shuffleIds: createBuffer(device, testParams.maxWorkgroups * testParams.maxWorkgroupSize, false, true),
        barrier: createBuffer(device, 1, false, true),
        scratchpad: createBuffer(device, testParams.scratchMemorySize, false, true),
        scratchLocations: createBuffer(device, testParams.maxWorkgroups, false, true),
        stressParams: createBuffer(device, 7, false, true)
    }

    const workgroupSize = getRandomInRange(testParams.minWorkgroupSize, testParams.maxWorkgroupSize);

    const bindGroupLayout = createBindGroupLayout(device);
    const bindGroup = createBindGroup(device, bindGroupLayout, buffers);
    const computePipeline = createComputePipeline(device, bindGroupLayout, shaderCode, workgroupSize);
    for (let i = 0; i < 2; i++) {
        await runTestIteration(device, computePipeline, bindGroup, buffers, testParams, workgroupSize);
    }
}