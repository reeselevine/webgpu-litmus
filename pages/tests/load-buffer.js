import { defaultTestParams } from '../../components/litmus-setup.js'
import { commonHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import loadBuffer from '../../shaders/load-buffer.wgsl'
import barrierLoadBuffer from '../../shaders/barrier-load-buffer.wgsl';
import barrier1LoadBuffer from '../../shaders/barrier1-load-buffer.wgsl';
import barrier2LoadBuffer from '../../shaders/barrier2-load-buffer.wgsl';
import barrierLoadBufferNA from '../../shaders/barrier-load-buffer-na.wgsl';
import loadBufferResults from '../../shaders/load-buffer-results.wgsl'

const thread0B = `0.1: let r0 = atomicLoad(y)
0.2: storageBarrier()
0.3: atomicStore(x, 1)`;

const thread1B = `1.1: let r1 = atomicLoad(x)
1.2: storageBarrier()
1.3: atomicStore(y, 1)`;

const thread0NB = `0.1: let r0 = atomicLoad(y)
0.2: atomicStore(x, 1)`;

const thread1NB = `1.1: let r0 = atomicLoad(x)
1.2: atomicStore(y, 1)`;

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: loadBuffer
  },
  barrier: {
    pseudo: buildPseudoCode([thread0B, thread1B]),
    shader: barrierLoadBuffer
  },
  barrier1: {
    pseudo: buildPseudoCode([thread0B, thread1NB]),
    shader: barrier1LoadBuffer
  },
  barrier2: {
    pseudo: buildPseudoCode([thread0NB, thread1B]),
    shader: barrier2LoadBuffer
  },
  nonatomic: {
    pseudo: buildPseudoCode([`0.1: let r0 = *y
0.2: storageBarrier()
0.3: atomicStore(x, 1)`, `1.1: let r1 = atomicLoad(x)
1.2: storageBarrier()
1.3: if r1 == 1:
1.4:   *y = 1`]),
    shader: barrierLoadBufferNA
  }
}

export default function LoadBuffer() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="r0 == 1 && r1 == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 1 && r1 == 0",
      handler: commonHandlers.oneZero
    },
    seq1: {
      label: "r0 == 0 && r1 == 1",
      handler: commonHandlers.zeroOne
    },
    interleaved: {
      label: "r0 == 0 && r1 == 0",
      handler: commonHandlers.bothZero
    },
    weak: {
      label: "r0 == 1 && r1 == 1",
      handler: commonHandlers.bothOne
    }
  };

  const props = {
      testName: "Load Buffer",
      testDescription: "The load buffer litmus test checks to see if loads can be buffered and re-ordered on different threads. Variants using the release/acquire workgroup control barrier are also included.",
      testParams: defaultTestParams,
      shaderCode: loadBuffer,
      resultShaderCode: loadBufferResults,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}