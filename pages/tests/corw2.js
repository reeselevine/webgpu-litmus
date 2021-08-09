import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState, coRW2Handlers } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coRW2 from '../../shaders/corw2.wgsl';
import coRW2_RMW from '../../shaders/corw2-rmw.wgsl';
import coRW2_RMW1 from '../../shaders/corw2-rmw1.wgsl';
import coRW2_RMW2 from '../../shaders/corw2-rmw2.wgsl';
import coRW2_RMW3 from '../../shaders/corw2-rmw3.wgsl';
import coRW2_RMW4 from '../../shaders/corw2-rmw4.wgsl';
import coRW2_RMW5 from '../../shaders/corw2-rmw5.wgsl';
import coRW2_RMW6 from '../../shaders/corw2-rmw6.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: r0=x
0.2: x=1`, "1.1: x=2"]),
    shader: coRW2
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: r0=x
0.2: x=1`, "1.1: exchange(x, 2)"]),
    shader: coRW2_RMW
  },
  rmw1: {
    pseudo: buildPseudoCode([`0.1: r0=add(x, 0)
0.2: x=1`, "1.1: x=2"]),
    shader: coRW2_RMW1
  },
  rmw2: {
    pseudo: buildPseudoCode([`0.1: r0=x
0.2: exchange(x, 1)`, "1.1: x=2"]),
    shader: coRW2_RMW2
  },
  rmw3: {
    pseudo: buildPseudoCode([`0.1: r0=add(x, 0)
0.2: exchange(x, 1)`, "1.1: x=2"]),
    shader: coRW2_RMW3
  },
  rmw4: {
    pseudo: buildPseudoCode([`0.1: r0=add(x, 0)
0.2: x=1`, "1.1: exchange(x, 2)"]),
    shader: coRW2_RMW4
  },
  rmw5: {
    pseudo: buildPseudoCode([`0.1: r0=x
0.2: exchange(x, 1)`, "1.1: exchange(x, 2)"]),
    shader: coRW2_RMW5
  },
  rmw6: {
    pseudo: buildPseudoCode([`0.1: r0=add(x, 0)
0.2: exchange(x, 1)`, "1.1: exchange(x, 2)"]),
    shader: coRW2_RMW6
  }
}

export default function CoRW2() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=2 && x=2"/>,
    code: variants.default.pseudo
  };

  const testState = getTwoOutputState({
    seq0: {
      label: "r0=0 && x=2",
      handler: coRW2Handlers.seq0
    },
    seq1: {
      label: "r0=2 && x=1",
      handler: coRW2Handlers.seq1
    },
    interleaved: {
      label: "r0=0 && x=1",
      handler: coRW2Handlers.interleaved
    },
    weak: {
      label: "r0=2 && x=2",
      handler: coRW2Handlers.weak
    }
  });

  const props = {
    testName: "CoRW2",
    testDescription: "The CoRW2 litmus test checks to see if memory is coherent.",
    testParams: testParams,
    shaderCode: coRW2,
    testState: testState,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeTestPage(props);
}