import { defaultTestParams } from '../../components/litmus-setup.js'
import { twoPlusTwoWriteHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import twoPlusTwoWrite from '../../shaders/2+2-write.wgsl'

const thread0NB = `0.1: atomicStore(x, 2)
0.2: atomicStore(y, 1)`

const thread1NB = `1.1: atomicStore(y, 2)
1.2: atomicStore(x, 1)`

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: twoPlusTwoWrite 
  }
}

export default function TwoPlusTwoWrite() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="*x == 2 && *y == 2"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "*x == 1 && *y == 2",
      handler: twoPlusTwoWriteHandlers.seq0
    },
    seq1: {
      label: "*x == 2 && *y == 1",
      handler: twoPlusTwoWriteHandlers.seq1
    },
    interleaved: {
      label: "*x == 1 && *y == 1",
      handler: twoPlusTwoWriteHandlers.interleaved
    },
    weak: {
      label: "*x == 2 && *y == 2",
      handler: twoPlusTwoWriteHandlers.weak
    }
  };

  const props = {
      testName: "2+2 Write",
      testDescription: "The 2+2 write litmus test checks to see if two stores in two threads can both be re-ordered.",
      testParams: defaultTestParams,
      shaderCode: twoPlusTwoWrite,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode
  }

  return makeTwoOutputLitmusTestPage(props);
}