import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import coWR from '../../shaders/cowr.wgsl';
import coWR_RMW from '../../shaders/cowr-rmw.wgsl';

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
      handler: function (result, memResult) {
        return result[0] == 1 && memResult[0] == 2;
      }
    },
    seq1: {
      label: "r0=1 && x=1",
      handler: function (result, memResult) {
        return result[0] == 1 && memResult[0] == 1;
      }
    },
    interleaved: {
      label: "r0=2 && x=2",
      handler: function (result, memResult) {
        return result[0] == 2 && memResult[0] == 2;
      }
    },
    weak: {
      label: "r0=2 && x=1",
      handler: function (result, memResult) {
        return result[0] == 2 && memResult[0] == 1;
      }
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