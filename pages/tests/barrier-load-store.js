import { defaultTestParams } from '../../components/litmus-setup.js'
import { getOneOutputState, barrierLoadStoreHandlers } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierLS from '../../shaders/barrier-load-store.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function BarrierLoadStore() {
  testParams.memoryAliases[1] = 0;
  testParams.numMemLocations = 2;
  testParams.numOutputs = 1;
  testParams.minWorkgroupSize = 256;
  testParams.maxWorkgroupSize = 256;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=0"/>,
    code: buildPseudoCode([`0.1: r0=x
0.2: barrier()`, `1.1: barrier()
1.2: x=1`])
  };

  const testState = getOneOutputState({
    seq: {
      label: "r0=0", 
      handler: barrierLoadStoreHandlers.seq
    },
    weak: {
      label: "r0=1",
      handler: barrierLoadStoreHandlers.weak
    }
  })

  const props = {
    testName: "Barrier Load Store",
    testDescription: "The barrier load store test checks to see if the barrier works correctly",
    testParams: testParams,
    shaderCode: barrierLS,
    testState: testState,
    pseudoCode: pseudoCode
  };

  return makeTestPage(props);
}
