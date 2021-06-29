import Link from 'next/link'

async function doMessagePassing() {
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

  // Test buffers
  const xBuffer = device.createBuffer({
    mappedAtCreation: true,
    size: 4,
    usage: GPUBufferUsage.STORAGE
  });
  const xArrayBuffer = xBuffer.getMappedRange();
  new Uint32Array(xArrayBuffer).set([0]);
  xBuffer.unmap();

  const yBuffer = device.createBuffer({
    mappedAtCreation: true,
    size: 4,
    usage: GPUBufferUsage.STORAGE
  });
  const yArrayBuffer = yBuffer.getMappedRange();
  new Uint32Array(yArrayBuffer).set([0]);
  yBuffer.unmap();

  // Results buffer 
  const resultsBuffer = device.createBuffer({
    mappedAtCreation: true,
    size: 8,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  })
  const resultsArrayBuffer = resultsBuffer.getMappedRange();
  new Uint32Array(resultsArrayBuffer).set([0, 0]);
  resultsBuffer.unmap();

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
      }
    ]
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: xBuffer 
        }
      },
      {
        binding: 1,
        resource: {
          buffer: yBuffer 
        }
      },
      {
        binding: 2,
        resource: {
          buffer: resultsBuffer
        }
      }
    ]
  });

  // Compute shader code

  const messagePassingModule = device.createShaderModule({
    code: `
      [[block]] struct MemLoc {
        value : atomic<u32>;
      };

      [[block]] struct Result {
        values : vec2<u32>;
      };

      [[group(0), binding(0)]] var<storage, read_write> x : MemLoc;
      [[group(0), binding(1)]] var<storage, read_write> y : MemLoc;
      [[group(0), binding(2)]] var<storage, read_write> results : Result;

      [[stage(compute)]] fn main([[builtin(workgroup_id)]] workgroup_id : vec3<u32>, [[builtin(local_invocation_id)]] local_invocation_id : vec3<u32>) {
        if (workgroup_id[0] == 1u && local_invocation_id[0] == 0u) {
          atomicStore(&x.value, 1u);
          atomicStore(&y.value, 1u);
        }
        if (workgroup_id[0] == 0u && local_invocation_id[0] == 0u) {
          results.values[1] = atomicLoad(&y.value);
          results.values[0] = atomicLoad(&x.value);
        }
      }
    `
  })
  
  // Pipeline setup

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    compute: {
      module: messagePassingModule,
      entryPoint: "main"
    }
  });

  // Commands submission

  const commandEncoder = device.createCommandEncoder();

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatch(2);
  passEncoder.endPass();

  const resultsReadBuffer = device.createBuffer({
    size: 8,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  commandEncoder.copyBufferToBuffer(
    resultsBuffer,
    0,
    resultsReadBuffer,
    0,
    8
  );

  // Submit GPU commands.
  const gpuCommands = commandEncoder.finish();
  device.queue.submit([gpuCommands]);

  // Read buffer.
  await resultsReadBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = resultsReadBuffer.getMappedRange();
  console.log(new Uint32Array(arrayBuffer));
  return new Uint32Array(arrayBuffer);
}

export default function StoreBuffer() {
  try {
    const p = doMessagePassing();
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
        <h1>Message Passing</h1>
        <h2>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </h2>
      </>
    )
}