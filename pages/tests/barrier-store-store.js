import { defaultTestParams } from '../../components/litmus-setup.js'
import { barrierStoreStoreHandlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierSSWorkgroup from '../../shaders/barrier-ss/barrier-store-store-workgroup.wgsl';
import barrierSSStorageWorkgroup from '../../shaders/barrier-ss/barrier-store-store-storage-workgroup.wgsl';
import barrierSSResults from '../../shaders/barrier-ss/barrier-store-store-workgroup-results.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: *x = 1
0.2: workgroupBarrier()`, `1.1: workgroupBarrier()
1.2: *x = 2`], true),
    shader: barrierSSWorkgroup,
    workgroup: true,
  },
  storage: {
    pseudo: buildPseudoCode([`0.1: *x = 1
0.2: storageBarrier()`, `1.1: storageBarrier()
1.2: *x = 2`], true),
    shader: barrierSSStorageWorkgroup,
    workgroup: true
  }
}

export default function BarrierStoreStore() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="*x == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq: {
      label: "*x == 2", 
      handler: barrierStoreStoreHandlers.seq
    },
    weak: {
      label: "*x ==1",
      handler: barrierStoreStoreHandlers.weak
    }
  };

  const props = {
    testName: "Barrier Store Store",
    testDescription: "The barrier store store test checks to see if WebGPU's barriers correctly synchronize a store before the barrier on one thread and a store on another thread after the barrier.",
    testParams: testParams,
    shaderCode: barrierSSWorkgroup,
    resultShaderCode: {
      workgroup: barrierSSResults
    },
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}
