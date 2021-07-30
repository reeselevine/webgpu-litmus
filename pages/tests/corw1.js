import { defaultTestParams } from '../../components/litmus-setup.js'
import { getOneOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import coRW1 from '../../shaders/corw1.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function CoRW1() {
  testParams.memoryAliases[1] = 0;
  const thread = `0.1: r0=x
0.2: x=1`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=1"/>,
    code: (<>
      <TestThreadPseudoCode thread="0" code={thread}/>
    </>)
  };

  const testState = getOneOutputState({
    seq: {
      label: "r0=0", 
      handler: function (result, memResult) {
        return result[0] == 0;
      }
    },
    weak: {
      label: "r0=1",
      handler: function (result, memResult) {
        return result[0] == 1;
      }
    }
  })

  const props = {
    testName: "CoRW1",
    testDescription: "The CoRW1 litmus test checks to see if memory is coherent.",
    testParams: testParams,
    shaderCode: coRW1,
    testState: testState,
    pseudoCode: pseudoCode
  };

  return makeTestPage(props);
}