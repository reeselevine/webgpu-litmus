import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTwoOutputTest, getTwoOutputState } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import messagePassing from './message-passing.wgsl'

export default function MessagePassing() {
  const thread0 = `0.1: x=1
0.2: y=1`
  const thread1 = `1.1: r0=y
1.2: r1=x`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0, y=0" finalState="r0=1 && r1=0"/>,
    code: (<>
      <TestThreadPseudoCode thread="0" code={thread0}/>
      <TestThreadPseudoCode thread="1" code={thread1}/>
    </>)
  };
  const testState = getTwoOutputState();

  const behaviors = {
    sequential: [
      testState.bothZero,
      testState.bothOne
    ],
    interleaved: testState.zeroOne,
    weak: testState.oneZero
  };

  return makeTwoOutputTest(
    defaultTestParams, 
    "Message Passing",
    "The message passing litmus test checks to see if two stores in one thread can be re-ordered according to loads on a second thread.",
    messagePassing,
    pseudoCode,
    testState,
    behaviors);
}