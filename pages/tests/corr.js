import { defaultTestParams } from '../../components/litmus-setup.js'
import { coRRHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coRR from '../../shaders/corr.wgsl';
import coRR_RMW from '../../shaders/corr-rmw.wgsl';
import coRR_workgroup from '../../shaders/corr-workgroup.wgsl';
import coRR_RMW_workgroup from '../../shaders/corr-rmw-workgroup.wgsl';
import coRR_RMW1 from '../../shaders/corr-rmw1.wgsl';
import coRR_RMW2 from '../../shaders/corr-rmw2.wgsl';
import coRRResults from '../../shaders/corr-results.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)`, `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicLoad(x)`]),
    shader: coRR
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)`, `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicAdd(x, 0)`]),
    shader: coRR_RMW
  },
  workgroup: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)`, `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicLoad(x)`], true),
    shader: coRR_workgroup
  },
  workgroup_rmw: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)`, `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicAdd(x, 0)`], true),
    shader: coRR_RMW_workgroup
  },
  rmw1: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)`, `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicLoad(x)`]),
    shader: coRR_RMW1
  },
  rmw2: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)`, `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicAdd(x, 0)`]),
    shader: coRR_RMW2
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
      resultShaderCode: coRRResults,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}