import { defaultTestParams } from '../../components/litmus-setup.js'
import { coWWHandlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import coWW from '../../shaders/coww/coww.wgsl'
import coWWWorkgroup from '../../shaders/coww/coww-workgroup.wgsl'
import coWWStorageWorkgroup from '../../shaders/coww/coww-storage-workgroup.wgsl'
import coWWResults from '../../shaders/coww/coww-results.wgsl'
import coWWWorkgroupResults from '../../shaders/coww/coww-workgroup-results.wgsl'

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const thread0 = `0.1: atomicStore(x, 1)
0.2: atomicStore(x, 2)`;

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0]),
    shader: coWW,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0], true),
    shader: coWWWorkgroup,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0], true),
    shader: coWWStorageWorkgroup,
    workgroup: true
  }
}

export default function CoWW() {
  testParams.aliasedMemory = true;
  testParams.permuteSecond = 1;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="*x == 1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq: {
      label: "*x == 2", 
      handler: coWWHandlers.seq
    },
    weak: {
      label: "*x == 1",
      handler: coWWHandlers.weak
    }
  };

  const props = {
    testName: "CoWW",
    testDescription: "The CoWW litmus test checks SC-per-location by ensuring two writes to the same address on the same thread cannot be re-ordered.",
    testParams: testParams,
    shaderCode: coWW,
    resultShaderCode: {
      default: coWWResults,
      workgroup: coWWWorkgroupResults
    },
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}