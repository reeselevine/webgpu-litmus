// Message Passing tests
import messagePassing from '../shaders/mp/message-passing.wgsl'
import messagePassingCoherency from '../shaders/mp/message-passing-coherency.wgsl'
import messagePassingBarrier from '../shaders/mp/message-passing-barrier.wgsl'
import messagePassingBarrier1 from '../shaders/mp/message-passing-barrier1.wgsl'
import messagePassingBarrier2 from '../shaders/mp/message-passing-barrier2.wgsl'
import messagePassingResults from '../shaders/mp/message-passing-results.wgsl';
import messagePassingCoherencyResults from '../shaders/mp/message-passing-coherency-results.wgsl';
import messagePassingCoherencyTuningResults from '../shaders/mp/message-passing-coherency-tuning-results.wgsl';

// Store tests
import store from '../shaders/store/store.wgsl'
import storeCoherency from '../shaders/store/store-coherency.wgsl'
import storeBarrier from '../shaders/store/store-barrier.wgsl'
import storeBarrier1 from '../shaders/store/store-barrier1.wgsl'
import storeBarrier2 from '../shaders/store/store-barrier2.wgsl'
import storeResults from '../shaders/store/store-results.wgsl';
import storeCoherencyResults from '../shaders/store/store-coherency-results.wgsl';
import storeCoherencyTuningResults from '../shaders/store/store-coherency-tuning-results.wgsl';

// Load Buffer tests
import loadBuffer from '../shaders/lb/load-buffer.wgsl'
import loadBufferCoherency from '../shaders/lb/load-buffer-coherency.wgsl'
import loadBufferBarrier from '../shaders/lb/load-buffer-barrier.wgsl'
import loadBufferBarrier1 from '../shaders/lb/load-buffer-barrier1.wgsl'
import loadBufferBarrier2 from '../shaders/lb/load-buffer-barrier2.wgsl'
import loadBufferResults from '../shaders/lb/load-buffer-results.wgsl';
import loadBufferCoherencyResults from '../shaders/lb/load-buffer-coherency-results.wgsl';
import loadBufferCoherencyTuningResults from '../shaders/lb/load-buffer-coherency-tuning-results.wgsl';

// Read tests
import readRMW from '../shaders/read/read-rmw.wgsl'
import readCoherency from '../shaders/read/read-coherency.wgsl'
import readRMWBarrier from '../shaders/read/read-rmw-barrier.wgsl'
import readRMWBarrier1 from '../shaders/read/read-rmw-barrier1.wgsl'
import readRMWBarrier2 from '../shaders/read/read-rmw-barrier2.wgsl'
import readResults from '../shaders/read/read-results.wgsl'
import readCoherencyResults from '../shaders/read/read-coherency-results.wgsl'
import readCoherencyTuningResults from '../shaders/read/read-coherency-tuning-results.wgsl'

// Store Buffer tests
import storeBufferRMW from '../shaders/sb/store-buffer-rmw.wgsl'
import storeBufferCoherency from '../shaders/sb/store-buffer-coherency.wgsl'
import storeBufferRMWBarrier from '../shaders/sb/store-buffer-rmw-barrier.wgsl'
import storeBufferRMWBarrier1 from '../shaders/sb/store-buffer-rmw-barrier1.wgsl'
import storeBufferRMWBarrier2 from '../shaders/sb/store-buffer-rmw-barrier2.wgsl'
import storeBufferResults from '../shaders/sb/store-buffer-results.wgsl'
import storeBufferCoherencyResults from '../shaders/sb/store-buffer-coherency-results.wgsl'
import storeBufferCoherencyTuningResults from '../shaders/sb/store-buffer-coherency-tuning-results.wgsl'

// 2+2 Write tests
import twoPlusTwoWriteRMW from '../shaders/2+2w/2+2-write-rmw.wgsl'
import twoPlusTwoWriteCoherency from '../shaders/2+2w/2+2-write-coherency.wgsl'
import twoPlusTwoWriteRMWBarrier from '../shaders/2+2w/2+2-write-rmw-barrier.wgsl'
import twoPlusTwoWriteRMWBarrier1 from '../shaders/2+2w/2+2-write-rmw-barrier1.wgsl'
import twoPlusTwoWriteRMWBarrier2 from '../shaders/2+2w/2+2-write-rmw-barrier2.wgsl'
import twoPlusTwoWriteResults from '../shaders/2+2w/2+2-write-results.wgsl';
import twoPlusTwoWriteCoherencyResults from '../shaders/2+2w/2+2-write-coherency-results.wgsl';
import twoPlusTwoWriteCoherencyTuningResults from '../shaders/2+2w/2+2-write-coherency-tuning-results.wgsl';

// RR tests
import rr from '../shaders/rr/rr.wgsl';
import rrMutant from '../shaders/rr/rr-mutant.wgsl';
import rrRMW from '../shaders/rr/rr-rmw.wgsl';
import rrRMWMutant from '../shaders/rr/rr-rmw-mutant.wgsl';
import rrResults from '../shaders/rr/rr-results.wgsl';

// RR tests
import rw from '../shaders/rw/rw.wgsl';
import rwMutant from '../shaders/rw/rw-mutant.wgsl';
import rwRMW from '../shaders/rw/rw-rmw.wgsl';
import rwRMWMutant from '../shaders/rw/rw-rmw-mutant.wgsl';
import rwResults from '../shaders/rw/rw-results.wgsl';

// WR tests
import wr from '../shaders/wr/wr.wgsl';
import wrMutant from '../shaders/wr/wr-mutant.wgsl';
import wrRMW from '../shaders/wr/wr-rmw.wgsl';
import wrRMWMutant from '../shaders/wr/wr-rmw-mutant.wgsl';
import wrResults from '../shaders/wr/wr-results.wgsl';

// WW tests
import ww from '../shaders/ww/ww.wgsl';
import wwMutant from '../shaders/ww/ww-mutant.wgsl';
import wwRMW from '../shaders/ww/ww-rmw.wgsl';
import wwRMWMutant from '../shaders/ww/ww-rmw-mutant.wgsl';
import wwResults from '../shaders/ww/ww-results.wgsl';

export const conformanceTests = {
  messagePassingCoherency: {
    testName: "message_passing_coherency",
    shader: messagePassingCoherency,
    resultShader: messagePassingCoherencyResults,
    coherency: true 
  },
  messagePassingBarrier: {
    testName: "message_passing_barrier",
    shader: messagePassingBarrier,
    resultShader: messagePassingResults,
    coherency: false
  },
  messagePassingBarrier1: {
    testName: "message_passing_barrier1",
    shader: messagePassingBarrier1,
    resultShader: messagePassingResults,
    coherency: false
  },
  messagePassingBarrier2: {
    testName: "message_passing_barrier2",
    shader: messagePassingBarrier2,
    resultShader: messagePassingResults,
    coherency: false
  },

  loadBufferCoherency: {
    testName: "load_buffer_coherency",
    shader: loadBufferCoherency,
    resultShader: loadBufferCoherencyResults,
    coherency: true 
  },
  loadBufferBarrier: {
    testName: "load_buffer_barrier",
    shader: loadBufferBarrier,
    resultShader: loadBufferResults,
    coherency: false
  },
  loadBufferBarrier1: {
    testName: "load_buffer_barrier1",
    shader: loadBufferBarrier1,
    resultShader: loadBufferResults,
    coherency: false
  },
  loadBufferBarrier2: {
    testName: "load_buffer_barrier2",
    shader: loadBufferBarrier2,
    resultShader: loadBufferResults,
    coherency: false
  },

  storeCoherency: {
    testName: "store_coherency",
    shader: storeCoherency,
    resultShader: storeCoherencyResults,
    coherency: true 
  },
  storeBarrier: {
    testName: "store_barrier",
    shader: storeBarrier,
    resultShader: storeResults,
    coherency: false
  },
  storeBarrier1: {
    testName: "store_barrier1",
    shader: storeBarrier1,
    resultShader: storeResults,
    coherency: false
  },
  storeBarrier2: {
    testName: "store_barrier2",
    shader: storeBarrier2,
    resultShader: storeResults,
    coherency: false
  },

  readCoherency: {
    testName: "read_coherency",
    shader: readCoherency,
    resultShader: readCoherencyResults,
    coherency: true 
  },
  readRMWBarrier: {
    testName: "read_rmw_barrier",
    shader: readRMWBarrier,
    resultShader: readResults,
    coherency: false
  },
  readRMWBarrier1: {
    testName: "read_rmw_barrier1",
    shader: readRMWBarrier1,
    resultShader: readResults,
    coherency: false
  },
  readRMWBarrier2: {
    testName: "read_rmw_barrier2",
    shader: readRMWBarrier2,
    resultShader: readResults,
    coherency: false
  },

  storeBufferCoherency: {
    testName: "store_buffer_coherency",
    shader: storeBufferCoherency,
    resultShader: storeBufferCoherencyResults,
    coherency: true 
  },
  storeBufferRMWBarrier: {
    testName: "store_buffer_rmw_barrier",
    shader: storeBufferRMWBarrier,
    resultShader: storeBufferResults,
    coherency: false
  },
  storeBufferRMWBarrier1: {
    testName: "store_buffer_rmw_barrier1",
    shader: storeBufferRMWBarrier1,
    resultShader: storeBufferResults,
    coherency: false
  },
  storeBufferRMWBarrier2: {
    testName: "store_buffer_rmw_barrier2",
    shader: storeBufferRMWBarrier2,
    resultShader: storeBufferResults,
    coherency: false
  },

  twoPlusTwoWriteCoherency: {
    testName: "write_22_coherency",
    shader: twoPlusTwoWriteCoherency,
    resultShader: twoPlusTwoWriteCoherencyResults,
    coherency: true 
  },
  twoPlusTwoWriteRMWBarrier: {
    testName: "write_22_rmw_barrier",
    shader: twoPlusTwoWriteRMWBarrier,
    resultShader: twoPlusTwoWriteResults,
    coherency: false
  },
  twoPlusTwoWriteRMWBarrier1: {
    testName: "write_22_rmw_barrier1",
    shader: twoPlusTwoWriteRMWBarrier1,
    resultShader: twoPlusTwoWriteResults,
    coherency: false
  },
  twoPlusTwoWriteRMWBarrier2: {
    testName: "write_22_rmw_barrier2",
    shader: twoPlusTwoWriteRMWBarrier2,
    resultShader: twoPlusTwoWriteResults,
    coherency: false
  },

  rr: {
    testName: "rr",
    shader: rr,
    resultShader: rrResults,
    coherency: true
  },
  rrRMW: {
    testName: "rr_rmw",
    shader: rrRMW,
    resultShader: rrResults,
    coherency: true
  },

  rw: {
    testName: "rw",
    shader: rw,
    resultShader: rwResults,
    coherency: true
  },
  rwRMW: {
    testName: "rw_rmw",
    shader: rwRMW,
    resultShader: rwResults,
    coherency: true
  },

  wr: {
    testName: "wr",
    shader: wr,
    resultShader: wrResults,
    coherency: true
  },
  wrRMW: {
    testName: "wr_rmw",
    shader: wrRMW,
    resultShader: wrResults,
    coherency: true
  },

  ww: {
    testName: "ww",
    shader: ww,
    resultShader: wwResults,
    coherency: true
  },
  wwRMW: {
    testName: "ww_rmw",
    shader: wwRMW,
    resultShader: wwResults,
    coherency: true
  }
}

export const tuningTests = {
  messagePassing: {
    testName: "message_passing",
    shader: messagePassing,
    resultShader: messagePassingResults,
    coherency: false
  },
  messagePassingCoherencyTuning: {
    testName: "message_passing_coherency_tuning",
    shader: messagePassingCoherency,
    resultShader: messagePassingCoherencyTuningResults,
    coherency: false 
  },

  loadBuffer: {
    testName: "load_buffer",
    shader: loadBuffer,
    resultShader: loadBufferResults,
    coherency: false
  },
  loadBufferCoherencyTuning: {
    testName: "load_buffer_coherency_tuning",
    shader: loadBufferCoherency,
    resultShader: loadBufferCoherencyTuningResults,
    coherency: false 
  },

  store: {
    testName: "store",
    shader: store,
    resultShader: storeResults,
    coherency: false
  },
  storeCoherencyTuning: {
    testName: "store_coherency_tuning",
    shader: storeCoherency,
    resultShader: storeCoherencyTuningResults,
    coherency: false 
  },

  readRMW: {
    testName: "read_rmw",
    shader: readRMW,
    resultShader: readResults,
    coherency: false
  },
  readCoherencyTuning: {
    testName: "read_coherency_tuning",
    shader: readCoherency,
    resultShader: readCoherencyTuningResults,
    coherency: false 
  },

  storeBufferRMW: {
    testName: "store_buffer_rmw",
    shader: storeBufferRMW,
    resultShader: storeBufferResults,
    coherency: false
  },
  storeBufferCoherencyTuning: {
    testName: "store_buffer_coherency_tuning",
    shader: storeBufferCoherency,
    resultShader: storeBufferCoherencyTuningResults,
    coherency: false 
  },

  twoPlusTwoWriteRMW: {
    testName: "write_22_rmw",
    shader: twoPlusTwoWriteRMW,
    resultShader: twoPlusTwoWriteResults,
    coherency: false
  },
  twoPlusTwoWriteCoherencyTuning: {
    testName: "write_22_coherency_tuning",
    shader: twoPlusTwoWriteCoherency,
    resultShader: twoPlusTwoWriteCoherencyTuningResults,
    coherency: false 
  },

  rrMutant: {
    testName: "rr_mutant",
    shader: rrMutant,
    resultShader: rrResults,
    coherency: true
  },
  rrRMWMutant: {
    testName: "rr_rmw_mutant",
    shader: rrRMWMutant,
    resultShader: rrResults,
    coherency: true
  },

  rwMutant: {
    testName: "rw_mutant",
    shader: rwMutant,
    resultShader: rwResults,
    coherency: true
  },
  rwRMWMutant: {
    testName: "rw_rmw_mutant",
    shader: rwRMWMutant,
    resultShader: rwResults,
    coherency: true
  },

  wrMutant: {
    testName: "wr_mutant",
    shader: wrMutant,
    resultShader: wrResults,
    coherency: true
  },
  wrRMWMutant: {
    testName: "wr_rmw_mutant",
    shader: wrRMWMutant,
    resultShader: wrResults,
    coherency: true
  },

  wwMutant: {
    testName: "ww_mutant",
    shader: wwMutant,
    resultShader: wwResults,
    coherency: true
  },
  wwRMWMutant: {
    testName: "ww_rmw_mutant",
    shader: wwRMWMutant,
    resultShader: wwResults,
    coherency: true
  }
}


