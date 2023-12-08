import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeFourOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import iriw from '../../shaders/iriw/iriw.wgsl'
import iriwResults from '../../shaders/iriw/iriw-results.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const thread0 = '0.1: atomicStore(x, 1)';
const thread1 = '1.1: atomicStore(y, 1)';
const thread2 = `2.1: let r0 = atomicLoad(x)
2.2: let r1 = atomicLoad(y)`;
const thread3 = `3.1: let r2 = atomicLoad(y)
3.2: let r3 = atomicLoad(x)`;

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0, thread1, thread2, thread3]),
    shader: iriw,
    workgroup: false
  }
};

export default function IRIW() {
  testParams.numOutputs = 4;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="r0 == 1 && r1 == 0 && r2 == 1 && r3 == 0"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq: {
      label: "r0 == r1 && r2 == r3"
    },
    interleaved: {
      label: "interleaved"
    },
    weak: {
      label: "r0 == 1 && r1 == 0 && r2 == 1 && r3 == 0"
    }
  };

  const props = {
      testName: "IRIW",
      testDescription: "Checks if an implementation is multi-copy atomic",
      testParams: testParams,
      shaderCode: iriw,
      resultShaderCode: {
        default: iriwResults,
        workgroup: iriwResults 
      },
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeFourOutputLitmusTestPage(props);
}