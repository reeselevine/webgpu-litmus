import { defaultTestParams } from '../../components/litmus-setup.js'
import { storeHandlers, makeTwoOutputLitmusTestPage } from '../../components/test-page-utils.js';
import {TestSetupPseudoCode, buildPseudoCode} from '../../components/testPseudoCode.js'
import store from '../../shaders/store.wgsl'
import barrierStore from '../../shaders/barrier-store.wgsl'
import barrier1Store from '../../shaders/barrier1-store.wgsl'
import barrier2Store from '../../shaders/barrier2-store.wgsl'
import barrierStoreNA from '../../shaders/barrier-store-na.wgsl';

const thread0B = `0.1: atomicStore(x, 2)
0.2: storageBarrier()
0.3: atomicStore(y, 1)`;

const thread1B = `1.1: let r0 = atomicLoad(y)
1.2: storageBarrier()
1.3: atomicStore(x, 1)`;

const thread0NB = `0.1: atomicStore(x, 2)
0.2: atomicStore(y, 1)`

const thread1NB = `1.1: let r0 = atomicLoad(y)
1.2: atomicStore(x, 1)`

const variants = {
  default: {
    pseudo: buildPseudoCode([thread0NB, thread1NB]),
    shader: store 
  },
  barrier: {
    pseudo: buildPseudoCode([thread0B, thread1B]),
    shader: barrierStore
  },
  barrier1: {
    pseudo: buildPseudoCode([thread0B, thread1NB]),
    shader: barrier1Store
  },
  barrier2: {
    pseudo: buildPseudoCode([thread0NB, thread1B]),
    shader: barrier2Store
  },
  nonatomic: {
    pseudo: buildPseudoCode([`0.1: *x = 2
0.2: storageBarrier()
0.3: atomicStore(y, 1)`, `1.1: let r0 = atomicLoad(y)
1.2: storageBarrier()
1.3: if (r0 == 1):
1.4:   *x = 1`]),
    shader: barrierStoreNA
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
      stateConfig: stateConfig,
      pseudoCode: pseudoCode,
      variants: variants
  }

  return makeTwoOutputLitmusTestPage(props);
}