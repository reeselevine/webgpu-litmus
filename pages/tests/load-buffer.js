import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import loadBuffer from '../../shaders/lb/load-buffer.wgsl'
import barrierLoadBuffer from '../../shaders/lb/load-buffer-barrier.wgsl'
import workgroupLoadBuffer from '../../shaders/lb/load-buffer-workgroup.wgsl';
import storageWorkgroupLoadBuffer from '../../shaders/lb/load-buffer-storage-workgroup.wgsl';
import barrierWorkgroupLoadBuffer from '../../shaders/lb/load-buffer-workgroup-barrier.wgsl';
import barrierStorageWorkgroupLoadBuffer from '../../shaders/lb/load-buffer-storage-workgroup-barrier.wgsl';
import loadBufferResults from '../../shaders/lb/load-buffer-results.wgsl';
import loadBufferWorkgroupResults from '../../shaders/lb/load-buffer-workgroup-results.wgsl';

const thread0B = `0.1: let r0 = atomicLoad(y)
0.2: storageBarrier()
0.3: atomicStore(x, 1)`;

const thread1B = `1.1: let r1 = atomicLoad(x)
1.2: storageBarrier()
1.3: atomicStore(y, 1)`;

const thread0WB = `0.1: let r0 = atomicLoad(y)
0.2: workgroupBarrier()
0.3: atomicStore(x, 1)`;

const thread1WB = `1.1: let r1 = atomicLoad(x)
1.2: workgroupBarrier()
1.3: atomicStore(y, 1)`;

const thread0NB = `0.1: let r0 = atomicLoad(y)
0.2: atomicStore(x, 1)`;

const thread1NB = `1.1: let r1 = atomicLoad(x)
1.2: atomicStore(y, 1)`;

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: loadBuffer,
    workgroup: false
  },
  barrier: {
    pseudo: buildPseudoCode([thread0B, thread1B]),
    shader: barrierLoadBuffer,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0NB, thread1NB], true),
    shader: workgroupLoadBuffer,
    workgroup: true
  },
  workgroupBarrier: {
    pseudo: buildPseudoCode([thread0WB, thread1WB], true),
    shader: barrierWorkgroupLoadBuffer,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0NB, thread1NB], true),
    shader: storageWorkgroupLoadBuffer,
    workgroup: true
  },
  storageWorkgroupBarrier: {
    pseudo: buildPseudoCode([thread0B, thread1B], true),
    shader: barrierStorageWorkgroupLoadBuffer,
    workgroup: true
  },

}

export default function LoadBuffer() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="r0 == 1 && r1 == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 1 && r1 == 0",
    },
    seq1: {
      label: "r0 == 0 && r1 == 1",
    },
    interleaved: {
      label: "r0 == 0 && r1 == 0",
    },
    weak: {
      label: "r0 == 1 && r1 == 1",
    }
  };

  const props = {
      testName: "Load Buffer",
      testDescription: "The load buffer litmus test checks to see if loads can be buffered and re-ordered on different threads. Variants using the release/acquire workgroup control barrier are also included.",
      testParams: defaultTestParams,
      shaderCode: loadBuffer,
      resultShaderCode: {
        default: loadBufferResults,
        workgroup: loadBufferWorkgroupResults
      },
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}