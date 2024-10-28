interface LogitBias {
    token: number;  // This corresponds to llama_token (int32_t)
    bias: number;   // This corresponds to float
}

const libInterface = {
    LoadModel: {
        parameters: [
            "pointer",  // const char *modelPath
            "i32",      // int numberGpuLayers
        ],
        result: "pointer" as const,  // void*
        nonblocking: true,
    },
    InitiateCtx: {
        parameters: [
            "pointer",  // void* llamaModel
            "u32",      // unsigned contextLength
            "u32",      // unsigned numBatches
        ],
        result: "pointer" as const,  // void*
        nonblocking: true,
    },
    MakeSampler: {
        parameters: [],
        result: "pointer" as const  // void*
    },
    DistSampler: {
        parameters: ["pointer", "u32"],  // void* sampler, uint32_t seed
        result: "pointer" as const  // void*
    },
    GrammarSampler: {
        parameters: ["pointer", "pointer", "pointer", "pointer"],  // void* sampler, const llama_model* model, const char* grammar, const char* root
        result: "pointer" as const  // void*
    },
    GreedySampler: {
        parameters: ["pointer"],  // void* sampler
        result: "pointer" as const  // void*
    },
    InfillSampler: {
        parameters: ["pointer", "pointer"],  // void* sampler, const llama_model* model
        result: "pointer" as const  // void*
    },
    LogitBiasSampler: {
        parameters: ["pointer", "pointer", "usize", "pointer"],  // void* sampler, const struct llama_model* model, size_t nBias, const llama_logit_bias* logitBias
        result: "pointer" as const  // void*
    },
    MinPSampler: {
        parameters: ["pointer", "f32", "usize"],  // void* sampler, float minP, size_t minKeep
        result: "pointer" as const  // void*
    },
    MirostatSampler: {
        parameters: ["pointer", "i32", "u32", "f32", "f32", "i32"],  // void* sampler, int nVocab, uint32_t seed, float tau, float eta, int m
        result: "pointer" as const  // void*
    },
    MirostatV2Sampler: {
        parameters: ["pointer", "u32", "f32", "f32"],  // void* sampler, uint32_t seed, float tau, float eta
        result: "pointer" as const  // void*
    },
    PenaltiesSampler: {
        parameters: ["pointer", "i32", "i32", "i32", "i32", "f32", "f32", "f32", "bool", "bool"],  // void* sampler, int nVocab, llama_token eosToken, llama_token nlToken, int penaltyLastN, float penaltyRepeat, float penaltyFreq, float penaltyPresent, bool penalizeNl, bool ignoreEos
        result: "pointer" as const  // void*
    },
    SoftmaxSampler: {
        parameters: ["pointer"],  // void* sampler
        result: "pointer" as const  // void*
    },
    TailFreeSampler: {
        parameters: ["pointer", "f32", "usize"],  // void* sampler, float z, size_t minKeep
        result: "pointer" as const  // void*
    },
    TempSampler: {
        parameters: ["pointer", "f32"],  // void* sampler, float temp
        result: "pointer" as const  // void*
    },
    TempExtSampler: {
        parameters: ["pointer", "f32", "f32", "f32"],  // void* sampler, float temp, float dynatempRange, float dynatempExponent
        result: "pointer" as const  // void*
    },
    TopKSampler: {
        parameters: ["pointer", "i32"],  // void* sampler, int topK
        result: "pointer" as const  // void*
    },
    TopPSampler: {
        parameters: ["pointer", "f32", "usize"],  // void* sampler, float topP, size_t minKeep
        result: "pointer" as const  // void*
    },
    TypicalSampler: {
        parameters: ["pointer", "f32", "usize"],  // void* sampler, float typicalP, size_t minKeep
        result: "pointer" as const  // void*
    },
    XtcSampler: {
        parameters: ["pointer", "f32", "f32", "usize", "u32"],  // void* sampler, float xtcProbability, float xtcThreshold, size_t minKeep, uint32_t seed
        result: "pointer" as const  // void*
    },
    DrySampler: {
        parameters: ["pointer", "pointer", "f32", "f32", "u64", "u64", "pointer", "u64"], // void* sampler, const llama_model* model, float multiplier, float base, size_t allowed_length, size_t penalty_last_n, const char* const* sequence_breakers, size_t n_breakers
        result: "pointer" as const // void*
    },
    Infer: {
        parameters: [
            "pointer",  // void* llamaModelPtr
            "pointer",  // void* samplerPtr
            "pointer",  // void* contextPtr
            "pointer",  // const char *prompt
            "u32",      // unsigned numberTokensToPredict
        ],
        result: "void" as const,
        nonblocking: true,
    },
    InferToReadbackBuffer: {
        parameters: [
            "pointer",  // void* llamaModelPtr
            "pointer",  // void* samplerPtr
            "pointer",  // void* contextPtr
            "pointer",  // void* readbackBufferPtr
            "pointer",  // const char* prompt
            "u32",      // const unsigned numberTokensToPredict
        ],
        result: "void" as const,
        nonblocking: true,
    },
    CreateReadbackBuffer: {
        parameters: [],
        result: "pointer" as const  // void*
    },
    ReadbackNext: {
        parameters: ["pointer"],  // void* readbackBufferPtr
        result: "pointer" as const,  // void*
        nonblocking: true,
    },
    IsReadbackBufferDone: {
        parameters: ["pointer"],  // void* readbackBufferPtr
        result: "bool" as const
    },
} as const;

export class SamplerBuilder {
    private sampler: Deno.PointerValue;
    private readonly model: Deno.PointerValue;

    constructor(private lib: Deno.DynamicLibrary<typeof libInterface>, model: Deno.PointerValue) {
        this.sampler = this.lib.symbols.MakeSampler();
        this.model = model;
    }

    distSampler(seed: number): this {
        this.sampler = this.lib.symbols.DistSampler(this.sampler, seed);
        return this;
    }

    grammarSampler(model: Deno.PointerValue, grammar: string, root: string): this {
        const grammarPtr = new TextEncoder().encode(grammar + "\0");
        const rootPtr = new TextEncoder().encode(root + "\0");
        this.sampler = this.lib.symbols.GrammarSampler(
            this.sampler, model, Deno.UnsafePointer.of(grammarPtr), Deno.UnsafePointer.of(rootPtr)
        );
        return this;
    }

    greedy(): this {
        this.sampler = this.lib.symbols.GreedySampler(this.sampler);
        return this;
    }

    infillSampler(model: Deno.PointerValue): this {
        this.sampler = this.lib.symbols.InfillSampler(this.sampler, model);
        return this;
    }

    logitBiasSampler(logitBias: LogitBias[]): this {
        const nBias = logitBias.length;

        // Create a buffer to hold the llama_logit_bias structures
        const bufferSize = nBias * 8;  // 4 bytes for token (int32) + 4 bytes for bias (float)
        const buffer = new ArrayBuffer(bufferSize);
        const view = new DataView(buffer);

        // Fill the buffer with the logit bias data

        // only works for little endian rn
        logitBias.forEach((bias, index) => {
            view.setInt32(index * 8, bias.token, true);
            view.setFloat32(index * 8 + 4, bias.bias, true);
        });

        // Get a pointer to the buffer
        const ptr = Deno.UnsafePointer.of(buffer);

        this.sampler = this.lib.symbols.LogitBiasSampler(this.sampler, this.model, BigInt(nBias), ptr);
        return this;
    }

    drySampler(
        multiplier: number,
        base: number,
        allowedLength: number,
        penaltyLastN: number,
        sequenceBreakers: string[] = []
    ): this {
        //cstring
        const nullTerminatedBreakers = sequenceBreakers.map(str => str + '\0');

        //breakers
        const encodedBreakers = nullTerminatedBreakers.map(str =>
            new TextEncoder().encode(str)
        );

        //make a pointer for each breakers e.g. char*
        const breakerPtrs = encodedBreakers.map(encoded =>
            Deno.UnsafePointer.of(encoded)
        );

        // make a char[]* buffer
        const ptrArrayBuffer = new ArrayBuffer(breakerPtrs.length * 8);
        const ptrArray = new BigUint64Array(ptrArrayBuffer);

        // Put each pointer into an array, e.g: char[]*
        breakerPtrs.forEach((ptr, index) => {
            ptrArray[index] = BigInt(Deno.UnsafePointer.value(ptr));
        });

        this.sampler = this.lib.symbols.DrySampler(
            this.sampler,
            this.model,
            multiplier,
            base,
            BigInt(allowedLength),
            BigInt(penaltyLastN),
            Deno.UnsafePointer.of(ptrArrayBuffer),
            BigInt(sequenceBreakers.length)
        );

        return this;
    }

    minPSampler(minP: number, minKeep: number): this {
        this.sampler = this.lib.symbols.MinPSampler(this.sampler, minP, BigInt(minKeep));
        return this;
    }

    mirostatSampler(nVocab: number, seed: number, tau: number, eta: number, m: number): this {
        this.sampler = this.lib.symbols.MirostatSampler(this.sampler, nVocab, seed, tau, eta, m);
        return this;
    }

    mirostatV2Sampler(seed: number, tau: number, eta: number): this {
        this.sampler = this.lib.symbols.MirostatV2Sampler(this.sampler, seed, tau, eta);
        return this;
    }

    penaltiesSampler(nVocab: number, eosToken: number, nlToken: number, penaltyLastN: number, penaltyRepeat: number, penaltyFreq: number, penaltyPresent: number, penalizeNl: boolean, ignoreEos: boolean): this {
        this.sampler = this.lib.symbols.PenaltiesSampler(this.sampler, nVocab, eosToken, nlToken, penaltyLastN, penaltyRepeat, penaltyFreq, penaltyPresent, penalizeNl, ignoreEos);
        return this;
    }

    softmaxSampler(): this {
        this.sampler = this.lib.symbols.SoftmaxSampler(this.sampler);
        return this;
    }

    tailFreeSampler(z: number, minKeep: number): this {
        this.sampler = this.lib.symbols.TailFreeSampler(this.sampler, z, BigInt(minKeep));
        return this;
    }

    tempSampler(temp: number): this {
        this.sampler = this.lib.symbols.TempSampler(this.sampler, temp);
        return this;
    }

    tempExtSampler(temp: number, dynatempRange: number, dynatempExponent: number): this {
        this.sampler = this.lib.symbols.TempExtSampler(this.sampler, temp, dynatempRange, dynatempExponent);
        return this;
    }

    topK(num: number): this {
        this.sampler = this.lib.symbols.TopKSampler(this.sampler, num);
        return this;
    }

    topP(p: number, minKeep: number): this {
        this.sampler = this.lib.symbols.TopPSampler(this.sampler, p, BigInt(minKeep));
        return this;
    }

    typicalSampler(typicalP: number, minKeep: number): this {
        this.sampler = this.lib.symbols.TypicalSampler(this.sampler, typicalP, BigInt(minKeep));
        return this;
    }

    xtcSampler(xtcProbability: number, xtcThreshold: number, minKeep: number, seed: number): this {
        this.sampler = this.lib.symbols.XtcSampler(this.sampler, xtcProbability, xtcThreshold, BigInt(minKeep), seed);
        return this;
    }

    build(): Deno.PointerValue {
        return this.sampler;
    }
}

export class ReadbackBuffer {
  private lib: Deno.DynamicLibrary<typeof libInterface>;
  public bufferPtr: Deno.PointerValue;

  constructor(lib: Deno.DynamicLibrary<typeof libInterface>) {
    this.lib = lib;
    this.bufferPtr = this.lib.symbols.CreateReadbackBuffer();
  }

  private async readNext(): Promise<string | null> {
    const stringPtr = await this.lib.symbols.ReadbackNext(this.bufferPtr);
    if (stringPtr === null) {
      return null;
    }
    const cString = new Deno.UnsafePointerView(stringPtr);
    return cString.getCString();
  }

  private isDone(): boolean {
    return this.lib.symbols.IsReadbackBufferDone(this.bufferPtr);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async *read(): AsyncGenerator<string, void, unknown> {
    do {
      const nextString = await this.readNext();
      if (nextString === null) {
        await ReadbackBuffer.sleep(10);
        continue;
      }
      yield nextString;
    } while (!this.isDone());
  }
}

function setup() {
    const libName = "deno_cpp_binding";

    const libDir = `${Deno.cwd()}/bindings/lib/`;
    let libPath = libDir;

    switch (Deno.build.os) {
        case "windows":
            Deno.env.set("PATH", `${Deno.env.get("PATH")};${libDir}`);
            libPath += `${libName}.dll`;
            break;
        case "linux":
            Deno.env.set("LD_LIBRARY_PATH", `${Deno.env.get("LD_LIBRARY_PATH")}:${libDir}`);
            libPath += `${libName}.so`;
            break;
        case "darwin":
            Deno.env.set("DYLD_LIBRARY_PATH", `${Deno.env.get("DYLD_LIBRARY_PATH")}:${libDir}`);
            libPath += `${libName}.dylib`;
            break;
        default:
            throw new Error(`Unsupported operating system: ${Deno.build.os}`);
    }

    return Deno.dlopen(libPath, libInterface);
}

export const lib = setup();
