import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import atom from '../../shaders/atomicity.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function Atomicity() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=0 && x=1"/>,
    code: buildPseudoCode([`0.1: r0=exchange(x, 1)`, "1.1: x=2"])
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
      label: "N/A (same as weak)",
      handler: function (result, memResult) {
        return false;
      }
    },
    weak: {
      label: "r0=0 && x=1",
      handler: function (result, memResult) {
        return result[0] == 0 && memResult[0] == 1;
      }
    }
  });

  const props = {
    testName: "Atomicity",
    testDescription: "The atomicity litmus test checks to see if a read-modify-write instruction is atomic.",
    testParams: testParams,
    shaderCode: atom,
    testState: testState,
    pseudoCode: pseudoCode,
  };

  return makeTestPage(props);
}