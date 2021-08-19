import { defaultTestParams } from '../../components/litmus-setup.js'
import { commonHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import loadBuffer from '../../shaders/load-buffer.wgsl'
import barrierLoadBuffer from '../../shaders/barrier-load-buffer.wgsl';

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: r0=y
0.2: x=1`, `1.1: r1=x
1.2: y=1`]),
    shader: loadBuffer
  },
  barrier: {
    pseudo: buildPseudoCode([`0.1: r0=load(y)
0.2: barrier()
0.3: store(x, 1)`, `1.1: r1=load(x)
1.2: barrier()
1.3: store(y, 1)`]),
    shader: barrierLoadBuffer
  }
}

export default function LoadBuffer() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0, y=0" finalState="r0=1 && r1=1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0=1 && r1=0",
      handler: commonHandlers.oneZero
    },
    seq1: {
      label: "r0=0 && r1=1",
      handler: commonHandlers.zeroOne
    },
    interleaved: {
      label: "r0=0 && r1=0",
      handler: commonHandlers.bothZero
    },
    weak: {
      label: "r0=1 && r1=1",
      handler: commonHandlers.bothOne
    }
  };

  const props = {
      testName: "Load Buffer",
      testDescription: "The load buffer litmus test checks to see if loads can be buffered and re-ordered on different threads.",
      testParams: defaultTestParams,
      shaderCode: loadBuffer,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}