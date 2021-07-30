import { defaultTestParams } from '../../components/litmus-setup.js'
import { getOneOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import coWW from '../../shaders/coww.wgsl';
import coWW_RMW from '../../shaders/coww-rmw.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

const variants = {
  default: {
    pseudo: (<>
      <TestThreadPseudoCode thread="0" code="0.1: x=1
0.2: x=2"/>
    </>),
    shader: coWW
  },
  rmw: {
    pseudo: (<>
      <TestThreadPseudoCode thread="0" code="0.1: x=1
0.2: exchange(x, 2)"/>
    </>),
    shader: coWW_RMW
  }
}

export default function CoWW() {
  testParams.memoryAliases[1] = 0;
  const thread = `0.1: x=1
0.2: x=2`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="x=1"/>,
    code: variants.default.pseudo
  };

  const testState = getOneOutputState({
    seq: {
      label: "x=2", 
      handler: function (result, memResult) {
        return memResult[0] == 2;
      }
    },
    weak: {
      label: "x=1",
      handler: function (result, memResult) {
        return memResult[0] == 1;
      }
    }
  })

  const props = {
    testName: "CoWW",
    testDescription: "The CoWW litmus test checks to see if memory is coherent.",
    testParams: testParams,
    shaderCode: coWW,
    testState: testState,
    pseudoCode: pseudoCode,
    variants: variants
  };

  return makeTestPage(props);
}