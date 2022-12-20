import Ajv from "ajv"

const ajv = new Ajv();

const submitSchema = {
  type: "object",
  patternProperties: {
    "\\d+": {
      type: "object",
      properties: {
        params: {
          type: "object",
          properties: {
            testingWorkgroups: {type: "integer"},
            maxWorkgroups: {type: "integer"},
            workgroupSize: {type: "integer"},
            shufflePct: {type: "integer"},
            barrierPct: {type: "integer"},
            memStressPct: {type: "integer"},
            preStressPct: {type: "integer"},
            scratchMemorySize: {type: "integer"},
            memStride: {type: "integer"},
            stressLineSize: {type: "integer"},
            stressTargetLines: {type: "integer"},
            memStressIterations: {type: "integer"},
            preStressIterations: {type: "integer"},
            stressStrategyBalancePct: {type: "integer"},
            memStressStoreFirstPct: {type: "integer"},
            memStressStoreSecondPct: {type: "integer"},
            preStressStoreFirstPct: {type: "integer"},
            preStressStoreSecondPct: {type: "integer"},
            iterations: {type: "integer"}
          },
          required: ["testingWorkgroups", "maxWorkgroups", "workgroupSize", "shufflePct", "barrierPct",
                     "memStressPct", "preStressPct", "scratchMemorySize", "memStride", "stressLineSize",
                     "stressTargetLines", "memStressIterations", "preStressIterations", "stressStrategyBalancePct",
                     "memStressStoreFirstPct", "memStressStoreSecondPct", "preStressStoreFirstPct", "preStressStoreSecondPct",
                     "iterations"],
          additionalProperties: false
        }
      },
      patternProperties: {
        "^((?!(params)).)*$": {
          type: "object",
          properties: {
            seq: {type: "integer"},
            interleaved: {type: "integer"},
            weak: {type: "integer"},
            durationSeconds: {type: "number"}
          },
          required: ["seq", "interleaved", "weak", "durationSeconds"],
          additionalProperties: false
        }
      },
      required: ["params"],
      additionalProperties: false
    }
  },
  properties: {
    platformInfo: {
      type: "object",
      properties: {
        gpu: {
          type: "object",
          properties: {
            vendor: {type: "string"},
            architecture: {type: "string"},
            device: {type: "string"},
            description: {type: "string"}
          },
          required: ["vendor"],
          additionalProperties: false
        },
        browser: {
          type: "object",
          properties: {
            vendor: {type: "string"},
            version: {type: "string"}
          },
          required: ["vendor"],
          additionalProperties: false
        },
        os: {
          type: "object",
          properties: {
            vendor: {type: "string"},
            version: {type: "string"},
            mobile: {type: "boolean"}
          },
          required: ["vendor"],
          additionalProperties: false
        }
      },
      required: ["gpu", "browser", "os"],
      additionalProperties: false
    },
    randomSeed: {type: "string"},
    userInfo: {type: "object"}
  },
  required: ["platformInfo", "randomSeed"],
  additionalProperties: false
}

export const validateSubmit = ajv.compile(submitSchema)