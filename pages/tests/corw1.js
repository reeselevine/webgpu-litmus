import { defaultTestParams } from '../../components/litmus-setup.js'
import { coRW1Handlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import coRW1 from '../../shaders/corw1/corw1.wgsl'
import coRW1Workgroup from '../../shaders/corw1/corw1-workgroup.wgsl'
import coRW1StorageWorkgroup from '../../shaders/corw1/corw1-storage-workgroup.wgsl'
import coRW1Results from '../../shaders/corw1/corw1-results.wgsl'
import coRW1WorkgroupResults from '../../shaders/corw1/corw1-workgroup-results.wgsl'

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const thread0 = `0.1: let r0 = atomicLoad(x)
0.2: atomicStore(x, 1)`;

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0]),
    shader: coRW1,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0], true),
    shader: coRW1Workgroup,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0], true),
    shader: coRW1StorageWorkgroup,
    workgroup: true
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
    resultShaderCode: {
      default: coRW1Results,
      workgroup: coRW1WorkgroupResults
    },
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}