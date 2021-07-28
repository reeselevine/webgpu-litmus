import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTwoOutputTest, getTwoOutputState } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import loadBuffer from './load-buffer.wgsl'


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

  const testState = getTwoOutputState();

  const behaviors = {
    sequential: [
      testState.oneZero,
      testState.zeroOne
    ],
    interleaved: testState.bothZero,
    weak: testState.bothOne
  };

  return makeTwoOutputTest(
    defaultTestParams, 
    "Load Buffer",
    "The load buffer litmus test checks to see if loads can be buffered and re-ordered on different threads.",
    loadBuffer,
    pseudoCode,
    testState,
    behaviors);
}