import { useState } from 'react';
import _ from 'lodash'

export function buildThrottle(updateFunc) {
  return _.throttle((newValue) => updateFunc(newValue), 50);
}

export function getOneOutputState(config) {
  const [seq, setSeq] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    numOutputs: 1,
    seq: {
      visibleState: seq,
      internalState: 0,
      syncUpdate: setSeq,
      throttledUpdate: buildThrottle(setSeq),
      label: config.seq.label,
      resultHandler: config.seq.handler
    },
    weak: {
      visibleState: weak,
      internalState: 0,
      syncUpdate: setWeak,
      throttledUpdate: buildThrottle(setWeak),
      label: config.weak.label,
      resultHandler: config.weak.handler
    }
  }
}

export function getTwoOutputState(config) {
  const [seq0, setSeq0] = useState(0);
  const [seq1, setSeq1] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    numOutputs: 2,
    seq0: {
      visibleState: seq0,
      internalState: 0,
      syncUpdate: setSeq0,
      throttledUpdate: buildThrottle(setSeq0),
      label: config.seq0.label,
      resultHandler: config.seq0.handler
    },
    seq1: {
      visibleState: seq1,
      internalState: 0,
      syncUpdate: setSeq1,
      throttledUpdate: buildThrottle(setSeq1),
      label: config.seq1.label,
      resultHandler: config.seq1.handler
    },
    interleaved: {
      visibleState: interleaved,
      internalState: 0,
      syncUpdate: setInterleaved,
      throttledUpdate: buildThrottle(setInterleaved),
      label: config.interleaved.label,
      resultHandler: config.interleaved.handler
    },
    weak: {
      visibleState: weak,
      internalState: 0,
      syncUpdate: setWeak,
      throttledUpdate: buildThrottle(setWeak),
      label: config.weak.label,
      resultHandler: config.weak.handler
    }
  }
}

export function getFourOutputState(config) {
  const [seq, setSeq] = useState(0);
  const [interleaved, setInterleaved] = useState(0);
  const [weak, setWeak] = useState(0);
  return {
    numOutputs: 4,
    seq: {
      visibleState: seq,
      internalState: 0,
      syncUpdate: setSeq,
      throttledUpdate: buildThrottle(setSeq),
      label: config.seq.label,
      resultHandler: config.seq.handler
    },
    interleaved: {
      visibleState: interleaved,
      internalState: 0,
      syncUpdate: setInterleaved,
      throttledUpdate: buildThrottle(setInterleaved),
      label: config.interleaved.label,
      resultHandler: config.interleaved.handler
    },
    weak: {
      visibleState: weak,
      internalState: 0,
      syncUpdate: setWeak,
      throttledUpdate: buildThrottle(setWeak),
      label: config.weak.label,
      resultHandler: config.weak.handler
    }
  }
}

// Result handlers common to many litmus tests
export const commonHandlers = {
  bothOne: function (result, memResult) {
    return result[0] == 1 && result[1] == 1;
  },
  bothZero: function (result, memResult) {
    return result[0] == 0 && result[1] == 0;
  },
  zeroOne: function (result, memResult) {
    return result[0] == 0 && result[1] == 1;
  },
  oneZero: function (result, memResult) {
    return result[0] == 1 && result[1] == 0;
  }
};