import { defaultTestParams } from '../../components/litmus-setup.js'
import { commonHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import storeBuffer from '../../shaders/store-buffer.wgsl'

export default function StoreBuffer() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="r0 == 0 && r1 == 0"/>,
    code: buildPseudoCode([`0.1: atomicStore(x, 1)
0.2: let r0 = atomicLoad(y)`, `1.1: atomicStore(y, 1)
1.2: let r1 = atomicLoad(x)`]),
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 1 && r1 == 0",
      handler: commonHandlers.oneZero
    },
    seq1: {
      label: "r0 == 0 && r1 == 1",
      handler: commonHandlers.zeroOne
    },
    interleaved: {
      label: "r0 == 1 && r1 == 1",
      handler: commonHandlers.bothOne
    },
    weak: {
      label: "r0 == 0 && r1 == 0",
      handler: commonHandlers.bothZero
    }
  };

  const props = {
      testName: "Store Buffer",
      testDescription: "The store buffer litmus test checks to see if stores can be buffered and re-ordered on different threads. A release/acquire barrier is not enough to disallow this behavior.",
      testParams: defaultTestParams,
      shaderCode: storeBuffer,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode
  }

  return makeTwoOutputLitmusTestPage(props);
}