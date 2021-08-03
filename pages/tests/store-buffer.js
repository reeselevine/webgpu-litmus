import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState, commonHandlers } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import storeBuffer from '../../shaders/store-buffer.wgsl'

export default function StoreBuffer() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0, y=0" finalState="r0=0 && r1=0"/>,
    code: buildPseudoCode([`0.1: x=1
0.2: r0=y`, `1.1: y=1
1.2: r1=x`]),
  };

  const testState = getTwoOutputState({
    seq0: {
      label: "r0=1 && r1=0",
      handler: commonHandlers.oneZero
    },
    seq1: {
      label: "r0=0 && r1=1",
      handler: commonHandlers.zeroOne
    },
    interleaved: {
      label: "r0=1 && r1=1",
      handler: commonHandlers.bothOne
    },
    weak: {
      label: "r0=0 && r1=0",
      handler: commonHandlers.bothZero
    }
  });

  const props = {
      testName: "Store Buffer",
      testDescription: "The store buffer litmus test checks to see if stores can be buffered and re-ordered on different threads.",
      testParams: defaultTestParams,
      shaderCode: storeBuffer,
      testState: testState,
      pseudoCode: pseudoCode
  }

  return makeTestPage(props);
}