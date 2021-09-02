import { defaultTestParams } from '../../components/litmus-setup.js'
import { readHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import read from '../../shaders/read.wgsl'

const thread0NB = `0.1: atomicStore(x, 1)
0.2: atomicStore(y, 1)`

const thread1NB = `1.1: atomicStore(y, 2)
1.2: let r0 = atomicLoad(x)`

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: read 
  }
}

export default function Read() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="r0 == 0 && *y == 2"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 1 && *y == 2",
      handler: readHandlers.seq0
    },
    seq1: {
      label: "r0 == 0 && *y == 1",
      handler: readHandlers.seq1
    },
    interleaved: {
      label: "r0 == 1 && *y == 1",
      handler: readHandlers.interleaved
    },
    weak: {
      label: "r0 == 0 && *y == 2",
      handler: readHandlers.weak
    }
  };

  const props = {
      testName: "Read",
      testDescription: "The read litmus test checks to see if two stores in one thread can be re-ordered according to a store and a load on a second thread",
      testParams: defaultTestParams,
      shaderCode: read,
      stateConfig: stateConfig,
      pseudoCode: pseudoCode
  }

  return makeTwoOutputLitmusTestPage(props);
}