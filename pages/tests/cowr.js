import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coWR from '../../shaders/cowr/cowr.wgsl'
import coWRRMW from '../../shaders/cowr/cowr-rmw.wgsl'
import coWRWorkgroup from '../../shaders/cowr/cowr-workgroup.wgsl'
import coWRStorageWorkgroup from '../../shaders/cowr/cowr-storage-workgroup.wgsl'
import coWRResults from '../../shaders/cowr/cowr-results.wgsl'
import coWRWorkgroupResults from '../../shaders/cowr/cowr-workgroup-results.wgsl'

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const thread0 = `0.1: atomicStore(x, 1)
0.2: let r0 = atomicLoad(x)`;
const thread1 = "1.1: atomicStore(x, 2)";
const thread0RMW = `0.1: atomicExchange(x, 1)
0.2: let r0 = atomicAdd(x, 0)`;
const thread1RMW = "1.1: atomicExchange(x, 2)";

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0, thread1]),
    shader: coWR,
    workgroup: false
  },
  rmw: {
    pseudo: buildPseudoCode([thread0RMW, thread1RMW]),
    shader: coWRRMW,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: coWRWorkgroup,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: coWRStorageWorkgroup,
    workgroup: true
  }
}

export default function CoWR() {
  testParams.aliasedMemory = true;
  testParams.permuteSecond = 1;
  const thread0 = `0.1: atomicStore(x, 1)
0.2: let r0 = atomicLoad(x)`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 2 && *x == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 1 && *x == 2",
    },
    seq1: {
      label: "r0 == 1 && *x == 1",
    },
    interleaved: {
      label: "r0 == 2 && *x == 2",
    },
    weak: {
      label: "r0 == 2 && *x == 1",
    }
  };

  const props = {
    testName: "CoWR",
    testDescription: "The CoWR litmus test checks SC-per-location by ensuring that if a read observes a write from another thread, any prior writes to the same address are not re-ordered beyond the read. Variants using rmw instructions are included.",
    testParams: testParams,
    shaderCode: coWR,
    resultShaderCode: {
      default: coWRResults,
      workgroup: coWRWorkgroupResults
    },
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeTwoOutputLitmusTestPage(props);
}