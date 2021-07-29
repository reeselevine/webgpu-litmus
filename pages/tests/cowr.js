import { defaultTestParams } from '../../components/litmus-setup.js'
import { getTwoOutputState } from '../../components/test-page-utils.js';
import { makeTestPage } from '../../components/test-page-setup.js';
import {TestThreadPseudoCode, TestSetupPseudoCode} from '../../components/testPseudoCode.js'
import coWR from '../../shaders/cowr.wgsl';

const testParams = JSON.parse(JSON.stringify(defaultTestParams));

export default function CoWR() {
  testParams.memoryAliases[1] = 0;
  const thread0 = `0.1: x=1
0.2: r0=x`
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="global x=0" finalState="r0=2 && x=1"/>,
    code: (<>
      <TestThreadPseudoCode thread="0" code={thread0}/>
      <TestThreadPseudoCode thread="1" code="1.1: x=2"/>
    </>)
  };

  const testState = getTwoOutputState({
    seq0: {
      label: "r0=1 && x=2",
      handler: function (result, memResult) {
        return result[0] == 1 && memResult[0] == 2;
      }
    },
    seq1: {
      label: "r0=1 && x=1",
      handler: function (result, memResult) {
        return result[0] == 1 && memResult[0] == 1;
      }
    },
    interleaved: {
      label: "r0=2 && x=2",
      handler: function (result, memResult) {
        return result[0] == 2 && memResult[0] == 2;
      }
    },
    weak: {
      label: "r0=2 && x=1",
      handler: function (result, memResult) {
        return result[0] == 2 && memResult[0] == 1;
      }
    }
  });

  const props = {
    testName: "CoWR",
    testDescription: "The CoWR litmus test checks to see if memory is coherent.",
    testParams: testParams,
    shaderCode: coWR,
    testState: testState,
    pseudoCode: pseudoCode
  };

  return makeTestPage(props);
}