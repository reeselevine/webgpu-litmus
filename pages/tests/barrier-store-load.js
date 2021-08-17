import { defaultTestParams } from '../../components/litmus-setup.js'
import { barrierStoreLoadHandlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierSL from '../../shaders/barrier-store-load.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function BarrierStoreLoad() {
  testParams.memoryAliases[1] = 0;
  testParams.numMemLocations = 2;
  testParams.numOutputs = 1;
  testParams.minWorkgroupSize = 256;
  testParams.maxWorkgroupSize = 256;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=0"/>,
    code: buildPseudoCode([`0.1: x=1
0.2: barrier()`, `1.1: barrier()
1.2: r0=x`])
  };

  const stateConfig = {
    seq: {
      label: "r0=1", 
      handler: barrierStoreLoadHandlers.seq
    },
    weak: {
      label: "r0=0",
      handler: barrierStoreLoadHandlers.weak
    }
  };

  const props = {
    testName: "Barrier Store Load",
    testDescription: "The barrier store load test checks to see if the barrier works correctly",
    testParams: testParams,
    shaderCode: barrierSL,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode
  };

  return makeOneOutputLitmusTestPage(props);
}
