import { defaultTestParams } from '../../components/litmus-setup.js'
import { coWWHandlers, makeOneOutputLitmusTestPage } from '../../components/test-page-utils.js';
import { TestSetupPseudoCode, buildPseudoCode } from '../../components/testPseudoCode.js'
import coWW from '../../shaders/coww.wgsl';
import coWW_RMW from '../../shaders/coww-rmw.wgsl';
import coWW_RMW1 from '../../shaders/coww-rmw1.wgsl';
import coWW_RMW2 from '../../shaders/coww-rmw2.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: buildPseudoCode([`0.1: x=1
0.2: x=2`]),
    shader: coWW
  },
  rmw: {
    pseudo: buildPseudoCode([`0.1: x=1
0.2: exchange(x, 2)`]),
    shader: coWW_RMW
  },
  rmw1: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)
0.2: x=2`]),
    shader: coWW_RMW1
  },
  rmw2: {
    pseudo: buildPseudoCode([`0.1: exchange(x, 1)
0.2: exchange(x, 2)`]),
    shader: coWW_RMW2
  }
}

export default function CoWW() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="x=1"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq: {
      label: "x=2", 
      handler: coWWHandlers.seq
    },
    weak: {
      label: "x=1",
      handler: coWWHandlers.weak
    }
  };

  const props = {
    testName: "CoWW",
    testDescription: "The CoWW litmus test checks to see if memory is coherent.",
    testParams: testParams,
    shaderCode: coWW,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeOneOutputLitmusTestPage(props);
}