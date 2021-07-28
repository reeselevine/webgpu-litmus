import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTwoOutputTest, getTwoOutputState } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import storeBuffer from './store-buffer.wgsl'

export default function StoreBuffer() {
  const thread0 = `0.1: x=1
0.2: r0=y`
  const thread1 = `1.1: y=1
1.2: r1=x`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0, y=0" finalState="r0=0 && r1=0"/>,
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
    interleaved: testState.bothOne,
    weak: testState.bothZero
  };

  return makeTwoOutputTest(
    defaultTestParams, 
    "Store Buffer",
    "The store buffer litmus test checks to see if stores can be buffered and re-ordered on different threads.",
    storeBuffer,
    pseudoCode,
    testState,
    behaviors);
}