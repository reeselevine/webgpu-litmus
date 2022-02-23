import { defaultTestParams } from '../../components/litmus-setup.js'
import { commonHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import messagePassing from '../../shaders/mp/message-passing.wgsl'
import barrierMessagePassing from '../../shaders/mp/message-passing-barrier.wgsl'
import workgroupMessagePassing from '../../shaders/mp/message-passing-workgroup.wgsl';
import storageWorkgroupMessagePassing from '../../shaders/mp/message-passing-storage-workgroup.wgsl';
import barrierWorkgroupMessagePassing from '../../shaders/mp/message-passing-workgroup-barrier.wgsl';
import barrierStorageWorkgroupMessagePassing from '../../shaders/mp/message-passing-storage-workgroup-barrier.wgsl';
import messagePassingResults from '../../shaders/mp/message-passing-results.wgsl';

const thread0B = `0.1: atomicStore(x, 1)
0.2: storageBarrier()
0.3: atomicStore(y, 1)`;

const thread1B = `1.1: let r0 = atomicLoad(y)
1.2: storageBarrier()
1.3: let r1 = atomicLoad(x)`;

const thread0WB = `0.1: atomicStore(x, 1)
0.2: workgroupBarrier()
0.3: atomicStore(y, 1)`;

const thread1WB = `1.1: let r0 = atomicLoad(y)
1.2: workgroupBarrier()
1.3: let r1 = atomicLoad(x)`;

const thread0NB = `0.1: atomicStore(x, 1)
0.2: atomicStore(y, 1)`

const thread1NB = `1.1: let r0 = atomicLoad(y)
1.2: let r1 = atomicLoad(x)`

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: messagePassing,
    workgroup: false
  },
  barrier: {
    pseudo: buildPseudoCode([thread0B, thread1B]),
    shader: barrierMessagePassing,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0NB, thread1NB], true),
    shader: workgroupMessagePassing,
    workgroup: true
  },
  workgroupBarrier: {
    pseudo: buildPseudoCode([thread0WB, thread1WB], true),
    shader: barrierWorkgroupMessagePassing,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0NB, thread1NB], true),
    shader: storageWorkgroupMessagePassing,
    workgroup: true
  },
  storageWorkgroupBarrier: {
    pseudo: buildPseudoCode([thread0B, thread1B], true),
    shader: barrierStorageWorkgroupMessagePassing,
    workgroup: true
  }
};

export default function MessagePassing() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="r0 == 1 && r1 == 0"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 0 && r1 == 0"
    },
    seq1: {
      label: "r0 == 1 && r1 == 1"
    },
    interleaved: {
      label: "r0 == 0 && r1 == 1"
    },
    weak: {
      label: "r0 == 1 && r1 == 0"
    }
  };

  const props = {
      testName: "Message Passing",
      testDescription: "The message passing litmus test checks to see if two stores in one thread can be re-ordered according to loads on a second thread. This test also includes variants using WebGPU's acquire/release workgroup control barrier to synchronize across testing threads and disallow the weak behavior.",
      testParams: defaultTestParams,
      shaderCode: messagePassing,
      resultShaderCode: {
        default: messagePassingResults,
        workgroup: messagePassingResults
      },
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}