import { defaultTestParams } from '../../components/litmus-setup.js'
import { coRW1Handlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import coRW1 from '../../shaders/corw1.wgsl';
import coRW1_workgroup from '../../shaders/corw1-workgroup.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: let r0 = atomicLoad(x)
0.2: atomicStore(x, 1)`]),
    shader: coRW1
  },
  workgroup: {
    pseudo: buildPseudoCode([`0.1: let r0 = atomicLoad(x)
0.2: atomicStore(x, 1)`], true),
    shader: coRW1_workgroup
  }
}

export default function CoRW1() {
  testParams.aliasedMemory = true;
  testParams.permuteSecond = 1;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq: {
      label: "r0 == 0", 
      handler: coRW1Handlers.seq
    },
    weak: {
      label: "r0 == 1",
      handler: coRW1Handlers.weak
    }
  };

  const props = {
    testName: "CoRW1",
    testDescription: "The CoRW1 litmus test checks SC-per-location by ensuring a read and a write to the same address cannot be re-ordered on one thread.",
    testParams: testParams,
    shaderCode: coRW1,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}