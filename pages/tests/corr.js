import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState, commonHandlers } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
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
    pseudo: buildPseudoCode([`0.1: x=1`, `1.1: r0=x
1.2: r1=x`]),
    shader: coRR
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)`, `1.1: r0=x
1.2: r1=add(x, 0)`]),
    shader: coRR_RMW
  },
  rmw1: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)`, `1.1: r0=x
1.2: r1=x`]),
    shader: coRR_RMW1
  },
  rmw2: {
    pseudo: buildPseudoCode([`0.1: x=1`, `1.1: r0=x
1.2: r1=add(x, 0)`]),
    shader: coRR_RMW2
  },
  rmw3: {
    pseudo: buildPseudoCode([`0.1: x=1`, `1.1: r0=add(x, 0)
1.2: r1=x`]),
    shader: coRR_RMW3
  },
  rmw4: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)`, `1.1: r0=add(x, 0)
1.2: r1=x`]),
    shader: coRR_RMW4
  },
  rmw5: {
    pseudo: buildPseudoCode([`0.1: x=1`, `1.1: r0=add(x, 0)
1.2: r1=add(x, 0)`]),
    shader: coRR_RMW5
  },
  rmw6: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)`, `1.1: r0=add(x, 0)
1.2: r1=add(x, 0)`]),
    shader: coRR_RMW6
  }
}

export default function CoRR() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=1 && r1=0"/>,
    code: variants.default.pseudo
  };

  const testState = getTwoOutputState({
    seq0: {
      label: "r0=0 && r1=0",
      handler: commonHandlers.bothZero
    },
    seq1: {
      label: "r0=1 && r1=1",
      handler: commonHandlers.bothOne
    },
    interleaved: {
      label: "r0=0 && r1=1",
      handler: commonHandlers.zeroOne
    },
    weak: {
      label: "r0=1 && r1=0",
      handler: commonHandlers.oneZero
    }
  });

  const props = {
      testName: "CoRR",
      testDescription: "The CoRR litmus test checks to see if memory is coherent.",
      testParams: testParams,
      shaderCode: coRR,
      testState: testState,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTestPage(props);
}