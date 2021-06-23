import Link from 'next/link'

async function doMatrixMult() {
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

  // First Matrix

  const firstMatrix = new Float32Array([
    2 /* rows */,
    4 /* columns */,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8
  ]);

  const gpuBufferFirstMatrix = device.createBuffer({
    mappedAtCreation: true,
    size: firstMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE
  });
  const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();
  new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
  gpuBufferFirstMatrix.unmap();

  // Second Matrix

  const secondMatrix = new Float32Array([
    4 /* rows */,
    2 /* columns */,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8
  ]);

  const gpuBufferSecondMatrix = device.createBuffer({
    mappedAtCreation: true,
    size: secondMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE
  });
  const arrayBufferSecondMatrix = gpuBufferSecondMatrix.getMappedRange();
  new Float32Array(arrayBufferSecondMatrix).set(secondMatrix);
  gpuBufferSecondMatrix.unmap();

  // Result Matrix

  const resultMatrixBufferSize =
    Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  // Bind group layout and bind group

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage"
        }
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage"
        }
      },
      {
        binding: 2,
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
          buffer: gpuBufferFirstMatrix
        }
      },
      {
        binding: 1,
        resource: {
          buffer: gpuBufferSecondMatrix
        }
      },
      {
        binding: 2,
        resource: {
          buffer: resultMatrixBuffer
        }
      }
    ]
  });

  // Compute shader code

  const shaderModule = device.createShaderModule({
    code: `
      [[block]] struct Matrix {
        size : vec2<f32>;
        numbers: array<f32>;
      };
      
      [[group(0), binding(0)]] var<storage, read> firstMatrix : Matrix;
      [[group(0), binding(1)]] var<storage, read> secondMatrix : Matrix;
      [[group(0), binding(2)]] var<storage, write> resultMatrix : Matrix;
      
      [[stage(compute)]] fn main([[builtin(global_invocation_id)]] global_id : vec3<u32>) {
        resultMatrix.size = vec2<f32>(firstMatrix.size.x, secondMatrix.size.y);
        
        let resultCell : vec2<u32> = vec2<u32>(global_id.x, global_id.y);
        var result : f32 = 0.0;
        for (var i : u32 = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
          let a : u32 = i + resultCell.x * u32(firstMatrix.size.y);
          let b : u32 = resultCell.y + i * u32(secondMatrix.size.y);
          result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
        }
        
        let index : u32 = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
        resultMatrix.numbers[index] = result;
      }
    `
  });
  
  // Pipeline setup

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    compute: {
      module: shaderModule,
      entryPoint: "main"
    }
  });

  // Commands submission

  const commandEncoder = device.createCommandEncoder();

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatch(firstMatrix[0] /* x */, secondMatrix[1] /* y */);
  passEncoder.endPass();

  // Get a GPU buffer for reading in an unmapped state.
  const gpuReadBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  // Encode commands for copying buffer to buffer.
  commandEncoder.copyBufferToBuffer(
    resultMatrixBuffer /* source buffer */,
    0 /* source offset */,
    gpuReadBuffer /* destination buffer */,
    0 /* destination offset */,
    resultMatrixBufferSize /* size */
  );

  // Submit GPU commands.
  const gpuCommands = commandEncoder.finish();
  device.queue.submit([gpuCommands]);

  // Read buffer.
  await gpuReadBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = gpuReadBuffer.getMappedRange();
  console.log(new Float32Array(arrayBuffer));
}

export default function StoreBuffer() {
  try {
    const p = doMatrixMult();
    if (p instanceof Promise) {
      p.catch((err) => {
        console.error(err);
        setError(err);
      });
    }
  } catch (err) {
    console.error(err);
    setError(err);
  }
  return (
      <>
        <h1>Store Buffer</h1>
        <h2>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </h2>
      </>
    )
}