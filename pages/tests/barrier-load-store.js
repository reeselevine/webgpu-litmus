import { defaultTestParams } from '../../components/litmus-setup.js'
import { barrierLoadStoreHandlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierLSWorkgroup from '../../shaders/barrier-ls/barrier-load-store-workgroup.wgsl';
import barrierLSStorageWorkgroup from '../../shaders/barrier-ls/barrier-load-store-storage-workgroup.wgsl';
import barrierLSResults from '../../shaders/barrier-ls/barrier-load-store-workgroup-results.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: let r0 = x
0.2: workgroupBarrier()`, `1.1: workgroupBarrier()
1.2: *x = 1`], true),
    shader: barrierLSWorkgroup,
    workgroup: true
  },
  storage: {
    pseudo: buildPseudoCode([`0.1: let r0 = *x
0.2: storageBarrier()`, `1.1: storageBarrier()
1.2: *x = 1`], true),
    shader: barrierLSStorageWorkgroup,
    workgroup: true
  }
}

export default function BarrierLoadStore() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 1"/>,
    code: variants.default.pseudo
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
    testDescription: "The barrier load store test checks to see if WebGPU's barriers correctly synchronize a load before the barrier on one thread and a store on another thread after the barrier.",
    testParams: testParams,
    shaderCode: barrierLSWorkgroup,
    resultShaderCode: {
      workgroup: barrierLSResults,
    },
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}
