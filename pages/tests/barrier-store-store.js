import { defaultTestParams } from '../../components/litmus-setup.js'
import { barrierStoreStoreHandlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierSS from '../../shaders/barrier-store-store.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function BarrierStoreStore() {
  testParams.memoryAliases[1] = 0;
  testParams.numMemLocations = 2;
  testParams.numOutputs = 1;
  testParams.minWorkgroupSize = 256;
  testParams.maxWorkgroupSize = 256;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="x=1"/>,
    code: buildPseudoCode([`0.1: x=1
0.2: barrier()`, `1.1: barrier()
1.2: x=2`])
  };

  const stateConfig = {
    seq: {
      label: "x=2", 
      handler: barrierStoreStoreHandlers.seq
    },
    weak: {
      label: "x=1",
      handler: barrierStoreStoreHandlers.weak
    }
  };

  const props = {
    testName: "Barrier Store Store",
    testDescription: "The barrier store store test checks to see if the barrier works correctly",
    testParams: testParams,
    shaderCode: barrierSS,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode
  };

  return makeOneOutputLitmusTestPage(props);
}
