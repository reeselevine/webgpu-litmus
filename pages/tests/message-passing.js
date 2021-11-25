import { defaultTestParams } from '../../components/litmus-setup.js'
import { commonHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import messagePassing from '../../shaders/message-passing.wgsl'
import barrierMessagePassing from '../../shaders/message-passing-barrier.wgsl'
import barrier1MessagePassing from '../../shaders/barrier1-message-passing.wgsl'
import barrier2MessagePassing from '../../shaders/barrier2-message-passing.wgsl'
import barrierMessagePassingNA from '../../shaders/barrier-message-passing-na.wgsl';
import barrierMessagePassingNARacy from '../../shaders/barrier-message-passing-na-racy.wgsl';

const thread0B = `0.1: atomicStore(x, 1)
0.2: storageBarrier()
0.3: atomicStore(y, 1)`;

const thread1B = `1.1: let r0 = atomicLoad(y)
1.2: storageBarrier()
1.3: let r1 = atomicLoad(x)`;

const thread0NB = `0.1: atomicStore(x, 1)
0.2: atomicStore(y, 1)`

const thread1NB = `1.1: let r0 = atomicLoad(y)
1.2: let r1 = atomicLoad(x)`

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: messagePassing
  },
  barrier: {
    pseudo: buildPseudoCode([thread0B, thread1B]),
    shader: barrierMessagePassing
  },
  barrier1: {
    pseudo: buildPseudoCode([thread0B, thread1NB]),
    shader: barrier1MessagePassing
  },
  barrier2: {
    pseudo: buildPseudoCode([thread0NB, thread1B]),
    shader: barrier2MessagePassing
  },
  nonatomic: {
    pseudo: buildPseudoCode([`0.1: *x = 1
0.2: storageBarrier()
0.3: atomicStore(y, 1)`, `1.1: let r0 = atomicLoad(y)
1.2: storageBarrier()
1.3: if (r0 == 1):
1.4:   let r1 = *x`]),
    shader: barrierMessagePassingNA 
  },
  nonatomic1: {
    pseudo: buildPseudoCode([`0.1: *x = 1
0.2: storageBarrier()
0.3: atomicStore(y, 1)`, `1.1: let r0 = atomicLoad(y)
1.2: storageBarrier()
1.4: let r1 = *x`]),
    shader: barrierMessagePassingNARacy
  }

}

export default function MessagePassing() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="r0 == 1 && r1 == 0"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 0 && r1 == 0",
      handler: commonHandlers.bothZero
    },
    seq1: {
      label: "r0 == 1 && r1 == 1",
      handler: commonHandlers.bothOne
    },
    interleaved: {
      label: "r0 == 0 && r1 == 1",
      handler: commonHandlers.zeroOne
    },
    weak: {
      label: "r0 == 1 && r1 == 0",
      handler: commonHandlers.oneZero
    }
  };

  const props = {
      testName: "Message Passing",
      testDescription: "The message passing litmus test checks to see if two stores in one thread can be re-ordered according to loads on a second thread. This test also includes variants using WebGPU's acquire/release workgroup control barrier to synchronize across testing threads and disallow the weak behavior.",
      testParams: defaultTestParams,
      shaderCode: messagePassing,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}