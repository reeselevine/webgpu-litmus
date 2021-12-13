import { defaultTestParams } from '../../components/litmus-setup.js'
import { coRW2Handlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coRW2 from '../../shaders/corw2/corw2.wgsl'
import coRW2Workgroup from '../../shaders/corw2/corw2-workgroup.wgsl'
import coRW2StorageWorkgroup from '../../shaders/corw2/corw2-storage-workgroup.wgsl'
import coRW2Results from '../../shaders/corw2/corw2-results.wgsl'
import coRW2WorkgroupResults from '../../shaders/corw2/corw2-workgroup-results.wgsl'

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const thread0 = `0.1: let r0 = atomicLoad(x)
0.2: atomicStore(x, 1)`;

const thread1 = "1.1: atomicStore(x, 2)";

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0, thread1]),
    shader: coRW2,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: coRW2Workgroup,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: coRW2StorageWorkgroup,
    workgroup: true
  }
}

export default function CoRW2() {
  testParams.aliasedMemory = true;
  testParams.permuteSecond = 1;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 2 && *x == 2"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 0 && *x == 2",
      handler: coRW2Handlers.seq0
    },
    seq1: {
      label: "r0 == 2 && *x == 1",
      handler: coRW2Handlers.seq1
    },
    interleaved: {
      label: "r0 == 0 && *x == 1",
      handler: coRW2Handlers.interleaved
    },
    weak: {
      label: "r0 == 2 && *x == 2",
      handler: coRW2Handlers.weak
    }
  };

  const props = {
    testName: "CoRW2",
    testDescription: "The CoRW2 litmus test checks SC-per-location by ensuring that if a write from one thread is visible to a read on another thread, any subsequent writes are not re-ordered. Variants using rmw instructions are included.",
    testParams: testParams,
    shaderCode: coRW2,
    resultShaderCode: {
      default: coRW2Results,
      workgroup: coRW2WorkgroupResults
    },
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeTwoOutputLitmusTestPage(props);
}