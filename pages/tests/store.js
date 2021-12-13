import { defaultTestParams } from '../../components/litmus-setup.js'
import { storeHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import store from '../../shaders/store/store.wgsl'
import barrierStore from '../../shaders/store/store-barrier.wgsl'
import workgroupStore from '../../shaders/store/store-workgroup.wgsl'
import storageWorkgroupStore from '../../shaders/store/store-storage-workgroup.wgsl'
import barrierWorkgroupStore from '../../shaders/store/store-workgroup-barrier.wgsl'
import barrierStorageWorkgroupStore from '../../shaders/store/store-storage-workgroup-barrier.wgsl'
import storeResults from '../../shaders/store/store-results.wgsl';
import storeWorkgroupResults from '../../shaders/store/store-workgroup-results.wgsl';

const thread0B = `0.1: atomicStore(x, 2)
0.2: storageBarrier()
0.3: atomicStore(y, 1)`;

const thread1B = `1.1: let r0 = atomicLoad(y)
1.2: storageBarrier()
1.3: atomicStore(x, 1)`;

const thread0WB = `0.1: atomicStore(x, 2)
0.2: workgroupBarrier()
0.3: atomicStore(y, 1)`;

const thread1WB = `1.1: let r0 = atomicLoad(y)
1.2: workgroupBarrier()
1.3: atomicStore(x, 1)`;

const thread0NB = `0.1: atomicStore(x, 2)
0.2: atomicStore(y, 1)`

const thread1NB = `1.1: let r0 = atomicLoad(y)
1.2: atomicStore(x, 1)`

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: store,
    workgroup: false
  },
  barrier: {
    pseudo: buildPseudoCode([thread0B, thread1B]),
    shader: barrierStore,
    workgroup: false
  },
  workgroup: {
    pseudo: buildPseudoCode([thread0NB, thread1NB], true),
    shader: workgroupStore,
    workgroup: true
  },
  workgroupBarrier: {
    pseudo: buildPseudoCode([thread0WB, thread1WB], true),
    shader: barrierWorkgroupStore,
    workgroup: true
  },
  storageWorkgroup: {
    pseudo: buildPseudoCode([thread0NB, thread1NB], true),
    shader: storageWorkgroupStore,
    workgroup: true
  },
  storageWorkgroupBarrier: {
    pseudo: buildPseudoCode([thread0B, thread1B], true),
    shader: barrierStorageWorkgroupStore,
    workgroup: true
  }
}

export default function Store() {
  const pseudoCode = {
    setup: <TestSetupPseudoCode init="*x = 0, *y = 0" finalState="r0 == 1 && *x == 2"/>,
    code: variants.default.pseudo
  };

  const stateConfig = {
    seq0: {
      label: "r0 == 1 && *x == 1",
      handler: storeHandlers.seq0
    },
    seq1: {
      label: "r0 == 0 && *x == 2",
      handler: storeHandlers.seq1
    },
    interleaved: {
      label: "r0 == 0 && *x == 1",
      handler: storeHandlers.interleaved
    },
    weak: {
      label: "r0 == 1 && *x == 2",
      handler: storeHandlers.weak
    }
  };

  const props = {
      testName: "Store",
      testDescription: "The store litmus test checks to see if two stores in one thread can be re-ordered according to a store and a load on a second thread. Variants using the release/acquire workgroup control barrier are also included.",
      testParams: defaultTestParams,
      shaderCode: store,
      resultShaderCode: {
        default: storeResults,
        workgroup: storeWorkgroupResults
      },
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}