import { defaultTestParams } from '../../components/litmus-setup.js'
import { commonHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import messagePassing from '../../shaders/message-passing.wgsl'
import barrierMessagePassing from '../../shaders/barrier-message-passing.wgsl'

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: x=1
0.2: y=1`, `1.1: r0=y
1.2: r1=x`]),
    shader: messagePassing
  },
  barrier: {
    pseudo: buildPseudoCode([`0.1: store(x, 1)
0.2: barrier()
0.3: store(y, 1)`, `1.1: r0=load(y)
1.2: barrier()
1.3: r1=load(x)`]),
    shader: barrierMessagePassing
  }
}

export default function MessagePassing() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0, y=0" finalState="r0=1 && r1=0"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0=0 && r1=0",
      handler: commonHandlers.bothZero
    },
    seq1: {
      label: "r0=1 && r1=1",
      handler: commonHandlers.bothOne
    },
    interleaved: {
      label: "r0=0 && r1=1",
      handler: commonHandlers.zeroOne
    },
    weak: {
      label: "r0=1 && r1=0",
      handler: commonHandlers.oneZero
    }
  };

  const props = {
      testName: "Message Passing",
      testDescription: "The message passing litmus test checks to see if two stores in one thread can be re-ordered according to loads on a second thread.",
      testParams: defaultTestParams,
      shaderCode: messagePassing,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}