import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState, commonHandlers } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import loadBuffer from '../../shaders/load-buffer.wgsl'

export default function LoadBuffer() {
  const thread0 = `0.1: r0=y
0.2: x=1`
  const thread1 = `1.1: r1=x
1.2: y=1`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0, y=0" finalState="r0=1 && r1=1"/>,
    code: (<>
      <TestThreadPseudoCode thread="0" code={thread0}/>
      <TestThreadPseudoCode thread="1" code={thread1}/>
    </>)
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
      label: "r0=0 && r1=0",
      handler: commonHandlers.bothZero
    },
    weak: {
      label: "r0=1 && r1=1",
      handler: commonHandlers.bothOne
    }
  });

  const props = {
      testName: "Load Buffer",
      testDescription: "The load buffer litmus test checks to see if loads can be buffered and re-ordered on different threads.",
      testParams: defaultTestParams,
      shaderCode: loadBuffer,
      testState: testState,
      pseudoCode: pseudoCode
  }

  return makeTestPage(props);
}