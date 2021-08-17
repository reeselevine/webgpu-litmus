import { defaultTestParams } from '../../components/litmus-setup.js'
import { commonHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import loadBuffer from '../../shaders/load-buffer.wgsl'

export default function LoadBuffer() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0, y=0" finalState="r0=1 && r1=1"/>,
    code: buildPseudoCode([`0.1: r0=y
0.2: x=1`, `1.1: r1=x
1.2: y=1`]),
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
      pseudoCode: pseudoCode
  }

  return makeTwoOutputLitmusTestPage(props);
}