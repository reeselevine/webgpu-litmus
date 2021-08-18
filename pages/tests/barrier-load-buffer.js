import { defaultTestParams } from '../../components/litmus-setup.js'
import { commonHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierLoadBuffer from '../../shaders/barrier-load-buffer.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function BarrierLoadBuffer() {
  testParams.numMemLocations = 2;
  testParams.numOutputs = 2;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=1 && r1=0"/>,
    code: buildPseudoCode([`0.1: r0=load(y)
0.2: barrier()
0.3: store(x, 1)`, `1.1: r1=load(x)
1.2: barrier()
1.3: store(y, 1)`])
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
    testName: "Barrier Load Buffer Synchronization",
    testDescription: "The barrier load buffer test checks to see if the barrier works correctly",
    testParams: testParams,
    stateConfig: stateConfig,
    shaderCode: barrierLoadBuffer,
    pseudoCode: pseudoCode
  };

  return makeTwoOutputLitmusTestPage(props);
}
