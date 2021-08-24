import { defaultTestParams } from '../../components/litmus-setup.js'
import { barrierLoadStoreHandlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierLS from '../../shaders/barrier-load-store.wgsl';
import barrierWorkgroupLS from '../../shaders/barrier-load-store-workgroup.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  storage: {
    pseudo: buildPseudoCode([`0.1: let r0 = *x
0.2: storageBarrier()`, `1.1: storageBarrier()
1.2: *x = 1`]),
    shader: barrierLS
  },
  workgroup: {
    pseudo: buildPseudoCode([`0.1: let r0 = x
0.2: workgroupBarrier()`, `1.1: workgroupBarrier()
1.2: *x = 1`]),
    shader: barrierWorkgroupLS
  }
}

export default function BarrierLoadStore() {
  testParams.memoryAliases[1] = 0;
  testParams.numMemLocations = 2;
  testParams.numOutputs = 1;
  testParams.minWorkgroupSize = 256;
  testParams.maxWorkgroupSize = 256;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 0"/>,
    code: variants.storage.pseudo
  };

  const stateConfig = {
    seq: {
      label: "r0 == 0", 
      handler: barrierLoadStoreHandlers.seq
    },
    weak: {
      label: "r0 == 1",
      handler: barrierLoadStoreHandlers.weak
    }
  };

  const props = {
    testName: "Barrier Load Store",
    testDescription: "The barrier load store test checks to see if the barrier works correctly",
    testParams: testParams,
    shaderCode: barrierLS,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}
