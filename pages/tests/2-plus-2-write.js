import { defaultTestParams } from '../../components/litmus-setup.js'
import { makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import twoPlusTwoWrite from '../../shaders/2+2w/2+2-write.wgsl'
import twoPlusTwoWriteWorkgroup from '../../shaders/2+2w/2+2-write-workgroup.wgsl'
import twoPlusTwoWriteStorageWorkgroup from '../../shaders/2+2w/2+2-write-storage-workgroup.wgsl'
import twoPlusTwoWriteResults from '../../shaders/2+2w/2+2-write-results.wgsl'
import twoPlusTwoWriteWorkgroupResults from '../../shaders/2+2w/2+2-write-workgroup-results.wgsl'
import twoPlusTwoWriteRMWBarrier from '../../shaders/2+2w/2+2-write-rmw-barrier.wgsl'
import twoPlusTwoWriteWorkgroupRMWBarrier from '../../shaders/2+2w/2+2-write-workgroup-rmw-barrier.wgsl'
import twoPlusTwoWriteStorageWorkgroupRMWBarrier from '../../shaders/2+2w/2+2-write-storage-workgroup-rmw-barrier.wgsl'

const thread0NB = `0.1: atomicStore(x, 2)
0.2: atomicStore(y, 1)`
const thread1NB = `1.1: atomicStore(y, 2)
1.2: atomicStore(x, 1)`
const thread0B = `0.1: atomicStore(x, 2)
0.2: storageBarrier()
0.3: atomicExchange(y, 1)`
const thread1B = `1.1: atomicExchange(y, 2)
1.2: storageBarrier()
1.3: atomicStore(x, 1)`

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: twoPlusTwoWrite,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0NB, thread1NB], true),
    shader: twoPlusTwoWriteWorkgroup,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0NB, thread1NB], true),
    shader: twoPlusTwoWriteStorageWorkgroup,
    workgroup: true
  },
  rmwBarrier: {
    pseudo: buildPseudoCode([thread0B, thread1B]),
    shader: twoPlusTwoWriteRMWBarrier,
    workgroup: false
  },
  workgroupRmwBarrier: {
    pseudo: buildPseudoCode([thread0B, thread1B], true),
    shader: twoPlusTwoWriteWorkgroupRMWBarrier,
    workgroup: true
  },
  storageWorkgroupRmwBarrier: {
    pseudo: buildPseudoCode([thread0B, thread1B], true),
    shader: twoPlusTwoWriteStorageWorkgroupRMWBarrier,
    workgroup: true
  }
}

export default function TwoPlusTwoWrite() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="*x == 2 && *y == 2"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "*x == 1 && *y == 2"
    },
    seq1: {
      label: "*x == 2 && *y == 1"
    },
    interleaved: {
      label: "*x == 1 && *y == 1"
    },
    weak: {
      label: "*x == 2 && *y == 2"
    }
  };

  const props = {
      testName: "2+2 Write",
      testDescription: "The 2+2 write litmus test checks to see if two stores in two threads can both be re-ordered.",
      testParams: defaultTestParams,
      shaderCode: twoPlusTwoWrite,
      resultShaderCode: {
        default: twoPlusTwoWriteResults,
        workgroup: twoPlusTwoWriteWorkgroupResults
      },
      stateConfig: stateConfig,
      variants: variants,
      pseudoCode: pseudoCode
  }

  return makeTwoOutputLitmusTestPage(props);
}