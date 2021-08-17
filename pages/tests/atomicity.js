import { defaultTestParams } from '../../components/litmus-setup.js'
import { atomicityHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import atom from '../../shaders/atomicity.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function Atomicity() {
  testParams.memoryAliases[1] = 0;
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=0 && x=1"/>,
    code: buildPseudoCode([`0.1: r0=exchange(x, 1)`, "1.1: x=2"])
  };

  const stateConfig = {
    seq0: {
      label: "r0=0 && x=2",
      handler: atomicityHandlers.seq0
    },
    seq1: {
      label: "r0=2 && x=1",
      handler: atomicityHandlers.seq1
    },
    interleaved: {
      label: "N/A (same as weak)",
      handler: atomicityHandlers.interleaved
    },
    weak: {
      label: "r0=0 && x=1",
      handler: atomicityHandlers.weak
    }
  };

  const props = {
    testName: "Atomicity",
    testDescription: "The atomicity litmus test checks to see if a read-modify-write instruction is atomic.",
    testParams: testParams,
    shaderCode: atom,
    stateConfig: stateConfig,
    pseudoCode: pseudoCode,
  };

  return makeTwoOutputLitmusTestPage(props);
}