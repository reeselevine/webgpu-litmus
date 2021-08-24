import { defaultTestParams } from '../../components/litmus-setup.js'
import { coRRHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coRR from '../../shaders/corr.wgsl';
import coRR_RMW from '../../shaders/corr-rmw.wgsl';
import coRR_RMW1 from '../../shaders/corr-rmw1.wgsl';
import coRR_RMW2 from '../../shaders/corr-rmw2.wgsl';
import coRR_RMW3 from '../../shaders/corr-rmw3.wgsl';
import coRR_RMW4 from '../../shaders/corr-rmw4.wgsl';
import coRR_RMW5 from '../../shaders/corr-rmw5.wgsl';
import coRR_RMW6 from '../../shaders/corr-rmw6.wgsl';

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
  rmw1: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)`, `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicLoad(x)`]),
    shader: coRR_RMW1
  },
  rmw2: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)`, `1.1: let r0 = atomicLoad(x)
1.2: let r1 = atomicAdd(x, 0)`]),
    shader: coRR_RMW2
  },
  rmw3: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)`, `1.1: let r0 = atomicAdd(x, 0)
1.2: let r1 = atomicLoad(x)`]),
    shader: coRR_RMW3
  },
  rmw4: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)`, `1.1: let r0 = atomicAdd(x, 0)
1.2: let r1 = atomicLoad(x)`]),
    shader: coRR_RMW4
  },
  rmw5: {
    pseudo: buildPseudoCode([`0.1: atomicStore(x, 1)`, `1.1: let r0 = atomicAdd(x, 0)
1.2: let r1 = atomicAdd(x, 0)`]),
    shader: coRR_RMW5
  },
  rmw6: {
    pseudo: buildPseudoCode([`0.1: atomicExchange(x, 1)`, `1.1: let r0 = atomicAdd(x, 0)
1.2: let r1 = atomicAdd(x, 0)`]),
    shader: coRR_RMW6
  }
}

export default function CoRR() {
  testParams.memoryAliases[1] = 0;
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
      testDescription: "The CoRR litmus test checks to see if memory is coherent.",
      testParams: testParams,
      shaderCode: coRR,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}