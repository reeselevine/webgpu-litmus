import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState, commonHandlers } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import coRR from '../../shaders/corr.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function CoRR() {
  testParams.memoryAliases[1] = 0;
  const thread1 = `1.1: r0=x
1.2: r1=x`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=1 && r1=0"/>,
    code: (<>
      <TestThreadPseudoCode thread="0" code="0.1: x=1"/>
      <TestThreadPseudoCode thread="1" code={thread1}/>
    </>)
  };

  const testState = getTwoOutputState({
    seq0: {
      label: "r0=0 && r1=0",
      handler: commonHandlers.bothZero
    },
    seq1: {
      label: "r0=1 && r1=1",
      handler: commonHandlers.bothOne
    },
    interleaved: {
      label: "r0=0 && r1=1",
      handler: commonHandlers.zeroOne
    },
    weak: {
      label: "r0=1 && r1=0",
      handler: commonHandlers.oneZero
    }
  });

  const props = {
      testName: "CoRR",
      testDescription: "The CoRR litmus test checks to see if memory is coherent.",
      testParams: testParams,
      shaderCode: coRR,
      testState: testState,
      pseudoCode: pseudoCode
  }

  return makeTestPage(props);
}