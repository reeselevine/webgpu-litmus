import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState, coWRHandlers } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coWR from '../../shaders/cowr.wgsl';
import coWR_RMW from '../../shaders/cowr-rmw.wgsl';
import coWR_RMW1 from '../../shaders/cowr-rmw1.wgsl';
import coWR_RMW2 from '../../shaders/cowr-rmw2.wgsl';
import coWR_RMW3 from '../../shaders/cowr-rmw3.wgsl';
import coWR_RMW4 from '../../shaders/cowr-rmw4.wgsl';
import coWR_RMW5 from '../../shaders/cowr-rmw5.wgsl';
import coWR_RMW6 from '../../shaders/cowr-rmw6.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: x=1
0.2: r0=x`, "1.1: x=2"]),
    shader: coWR
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)
0.2: r0=add(x, 0)`, "1.1: exchange(x, 2)"]),
    shader: coWR_RMW
  },
  rmw1: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)
0.2: r0=x`, "1.1: x=2"]),
    shader: coWR_RMW1
  },
  rmw2: {
    pseudo: buildPseudoCode([`0.1: x=1
0.2: r0=add(x, 0)`, "1.1: x=2"]),
    shader: coWR_RMW2
  },
  rmw3: {
    pseudo: buildPseudoCode([`0.1: x=1
0.2: r0=x`, "1.1: exchange(x, 2)"]),
    shader: coWR_RMW3
  },
  rmw4: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)
0.2: r0=x`, "1.1: exchange(x, 2)"]),
    shader: coWR_RMW4
  },
  rmw5: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)
0.2: r0=add(x, 0)`, "1.1: x=2"]),
    shader: coWR_RMW5
  },
  rmw6: {
    pseudo: buildPseudoCode([`0.1: x=1
0.2: r0=add(x, 0)`, "1.1: exchange(x, 2)"]),
    shader: coWR_RMW6
  }
}

export default function CoWR() {
  testParams.memoryAliases[1] = 0;
  const thread0 = `0.1: x=1
0.2: r0=x`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=2 && x=1"/>,
    code: variants.default.pseudo
  };

  const testState = getTwoOutputState({
    seq0: {
      label: "r0=1 && x=2",
      handler: coWRHandlers.seq0
    },
    seq1: {
      label: "r0=1 && x=1",
      handler: coWRHandlers.seq1
    },
    interleaved: {
      label: "r0=2 && x=2",
      handler: coWRHandlers.interleaved
    },
    weak: {
      label: "r0=2 && x=1",
      handler: coWRHandlers.weak
    }
  });

  const props = {
    testName: "CoWR",
    testDescription: "The CoWR litmus test checks to see if memory is coherent.",
    testParams: testParams,
    shaderCode: coWR,
    testState: testState,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeTestPage(props);
}