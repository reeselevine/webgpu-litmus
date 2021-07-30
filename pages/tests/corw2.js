import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import coRW2 from '../../shaders/corw2.wgsl';
import coRW2_RMW from '../../shaders/corw2-rmw.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: (<>
      <TestThreadPseudoCode thread="0" code="0.1: r0=x
0.2: x=1"/>
      <TestThreadPseudoCode thread="1" code="1.1: x=2"/>
    </>),
    shader: coRW2
  },
  rmw: {
    pseudo: (<>
      <TestThreadPseudoCode thread="0" code="0.1: r0=x
0.2: x=1"/>
      <TestThreadPseudoCode thread="1" code="1.1: exchange(x, 2)"/>
    </>),
    shader: coRW2_RMW
  }
}

export default function CoRW2() {
  testParams.memoryAliases[1] = 0;
  const thread0 = `0.1: r0=x
0.2: x=1`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=2 && x=2"/>,
    code: variants.default.pseudo
  };

  const testState = getTwoOutputState({
    seq0: {
      label: "r0=0 && x=2",
      handler: function (result, memResult) {
        return result[0] == 0 && memResult[0] == 2;
      }
    },
    seq1: {
      label: "r0=2 && x=1",
      handler: function (result, memResult) {
        return result[0] == 2 && memResult[0] == 1;
      }
    },
    interleaved: {
      label: "r0=0 && x=1",
      handler: function (result, memResult) {
        return result[0] == 0 && memResult[0] == 1;
      }
    },
    weak: {
      label: "r0=2 && x=2",
      handler: function (result, memResult) {
        return result[0] == 2 && memResult[0] == 2;
      }
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