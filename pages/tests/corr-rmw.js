import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTwoOutputTest, getTwoOutputState } from '../../components/test-page-setup.js';
import { TestThreadPseudoCode, TestSetupPseudoCode } from '../../components/testPseudoCode.js'
import coRR from './corr-rmw.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function CoRR() {
  testParams.memoryAliases[1] = 0;
  const thread1 = `1.1: r0=x
1.2: r1=add(x, 0)`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=1 && r1=0" />,
    code: (<>
      <TestThreadPseudoCode thread="0" code="0.1: exchange(x, 1)" />
      <TestThreadPseudoCode thread="1" code={thread1} />
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
    testParams,
    "CoRR RMW",
    "The CoRR litmus test checks to see if memory is coherent. This version makes each memory load and store an atomic read-modify-write.",
    coRR,
    pseudoCode,
    testState,
    behaviors);
}