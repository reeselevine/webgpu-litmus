import { defaultTestParams } from '../../components/litmus-setup.js'
import { coRRHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coRR from '../../shaders/corr/corr.wgsl'
import coRRRMW from '../../shaders/corr/corr-rmw.wgsl'
import coRRWorkgroup from '../../shaders/corr/corr-workgroup.wgsl'
import coRRStorageWorkgroup from '../../shaders/corr/corr-storage-workgroup.wgsl'
import coRRNB from '../../shaders/corr/corr-nb.wgsl'
import coRRWorkgroupNB from '../../shaders/corr/corr-workgroup-nb.wgsl'
import coRRStorageWorkgroupNB from '../../shaders/corr/corr-storage-workgroup-nb.wgsl'

import coRRResults from '../../shaders/corr/corr-results.wgsl'
import coRRWorkgroupResults from '../../shaders/corr/corr-workgroup-results.wgsl'

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const thread0 = `0.1: atomicStore(x, 1)`;
const thread1 = `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicLoad(x)`;
const thread0RMW = `0.1: atomicExchange(x, 1)`;
const thread1RMW = `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicAdd(x, 0)`;

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0, thread1]),
    shader: coRR,
    workgroup: false
  },
  rmw: {
    pseudo: buildPseudoCode([thread0RMW, thread1RMW]),
    shader: coRRRMW,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: coRRWorkgroup,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: coRRStorageWorkgroup,
    workgroup: true
  },
  defaultNoBug: {
    pseudo: buildPseudoCode([thread0, thread1]),
    shader: coRRNB,
    workgroup: false
  },
  workgroupNoBug: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: coRRWorkgroupNB,
    workgroup: true
  },
  storageWorkgroupNoBug: {
    pseudo: buildPseudoCode([thread0, thread1], true),
    shader: coRRStorageWorkgroupNB,
    workgroup: true
  }

}

export default function CoRR() {
  testParams.aliasedMemory = true;
  testParams.permuteSecond = 1;
  testParams.numMemLocations = 1;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0" finalState="r0 == 1 && r1 == 0"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 0 && r1 == 0",
      handler: coRRHandlers.seq0
    },
    seq1: {
      label: "r0 == 1 && r1 == 1",
      handler: coRRHandlers.seq1
    },
    interleaved: {
      label: "r0 == 0 && r1 == 1",
      handler: coRRHandlers.interleaved
    },
    weak: {
      label: "r0 == 1 && r1 == 0",
      handler: coRRHandlers.weak
    }
  };

  const props = {
      testName: "CoRR",
      testDescription: "The CoRR litmus test checks SC-per-location by ensuring subsequent reads of the same value cannot be re-ordered. Variants using rmw instructions are included.",
      testParams: testParams,
      shaderCode: coRR,
      resultShaderCode: {
        default: coRRResults,
        workgroup: coRRWorkgroupResults
      },
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}