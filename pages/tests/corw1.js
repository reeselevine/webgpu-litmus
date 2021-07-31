import { defaultTestParams } from '../../components/litmus-setup.js'
import { getOneOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import coRW1 from '../../shaders/corw1.wgsl';
import coRW1_RMW1 from '../../shaders/corw1-rmw1.wgsl';
import coRW1_RMW2 from '../../shaders/corw1-rmw2.wgsl';
import coRW1_RMW3 from '../../shaders/corw1-rmw3.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: r0=x
0.2: x=1`]),
    shader: coRW1
  },
  rmw1: {
    pseudo: buildPseudoCode([`0.1: r0=add(x, 0)
0.2: x=1`]),
    shader: coRW1_RMW1 
  },
  rmw2: {
    pseudo: buildPseudoCode([`0.1: r0=x
0.2: exchange(x, 1)`]),
    shader: coRW1_RMW2
  },
  rmw3: {
    pseudo: buildPseudoCode([`0.1: r0=add(x, 0)
0.2: exchange(x, 1)`]),
    shader: coRW1_RMW3 
  }
}

export default function CoRW1() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=1"/>,
    code: variants.default.pseudo
  };

  const testState = getOneOutputState({
    seq: {
      label: "r0=0", 
      handler: function (result, memResult) {
        return result[0] == 0;
      }
    },
    weak: {
      label: "r0=1",
      handler: function (result, memResult) {
        return result[0] == 1;
      }
    }
  })

  const props = {
    testName: "CoRW1",
    testDescription: "The CoRW1 litmus test checks to see if memory is coherent.",
    testParams: testParams,
    shaderCode: coRW1,
    testState: testState,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeTestPage(props);
}