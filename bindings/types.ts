// Subset for caching
export enum GGMLType {
    F32 = 0,
    F16 = 1,
    Q4_0 = 2,
    Q4_1 = 3,
    // 4 and 5 were removed (Q4_2 and Q4_3)
    Q5_0 = 6,
    Q5_1 = 7,
    Q8_0 = 8,
    Q8_1 = 9,
}

export enum BindingFinishReason {
    CtxExceeded = "CtxExceeded",
    BatchDecode = "BatchDecode",
    StopToken = "StopToken",
    MaxNewTokens = "MaxNewTokens",
    StopString = "StopString",
    TokenEncode = "TokenEncode",
}

export type GenerationChunk = StreamChunk | FinishChunk;

export interface StreamChunk {
    kind: "data";
    text: string;
    token: number;
}

export type BindingStreamResponse = StreamChunk;

export interface FinishChunk {
    kind: "finish";
    text: string;
    promptTokens: number;
    genTokens: number;
    finishReason: string;
    stopToken: string;
}

export interface BindingFinishResponse extends FinishChunk {
    promptSec: number;
    genSec: number;
    genTokensPerSec: number;
    promptTokensPerSec: number;
    finishReason: BindingFinishReason;
}
