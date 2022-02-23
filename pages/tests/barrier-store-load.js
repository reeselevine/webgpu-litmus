import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import barrierSLWorkgroup from '../../shaders/barrier-sl/barrier-store-load-workgroup.wgsl';
import barrierSLStorageWorkgroup from '../../shaders/barrier-sl/barrier-store-load-storage-workgroup.wgsl';
import barrierSLResults from '../../shaders/barrier-sl/barrier-store-load-workgroup-results.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: *x = 1
0.2: workgroupBarrier()`, `1.1: workgroupBarrier()
1.2: let r0 = x`], true),
    shader: barrierSLWorkgroup,
    workgroup: true
  },
  storage: {
    pseudo: buildPseudoCode([`0.1: *x = 1
0.2: storageBarrier()`, `1.1: storageBarrier()
1.2: let r0 = x`], true),
    shader: barrierSLStorageWorkgroup,
    workgroup: true
  }
}

export default function BarrierStoreLoad() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 0"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq: {
      label: "r0 == 1", 
    },
    weak: {
      label: "r0 == 0",
    }
  };

  const props = {
    testName: "Barrier Store Load",
    testDescription: "The barrier store load test checks to see if WebGPU's barriers correctly synchronize a store before the barrier on one thread and a load on another thread after the barrier.",
    testParams: testParams,
    shaderCode: barrierSLWorkgroup,
    resultShaderCode: {
      workgroup: barrierSLResults
    },
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}
