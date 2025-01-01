import * as z from "@/common/myZod.ts";
import { CommonCompletionRequest } from "@/api/OAI/types/completions.ts";
import { BaseSamplerRequest } from "@/common/sampling.ts";

const ChatCompletionImageUrl = z.object({
    url: z.string(),
});

const ChatCompletionMessagePart = z.object({
    type: z.string().nullish().coalesce("text"),
    text: z.string().nullish(),
    image_url: ChatCompletionImageUrl.nullish(),
});

export type ChatCompletionMessagePart = z.infer<
    typeof ChatCompletionMessagePart
>;

export const ChatCompletionMessage = z.object({
    role: z.string().default("user"),
    content: z.union([z.string(), z.array(ChatCompletionMessagePart)]),
});

const ChatCompletionResponseFormat = z.object({
    type: z.string().default("text"),
});

export const ChatCompletionRequest = z.object({
    messages: z.array(ChatCompletionMessage).nullish().coalesce([]),
    response_format: ChatCompletionResponseFormat.nullish().coalesce(
        ChatCompletionResponseFormat.parse({}),
    ),
    add_generation_prompt: z.boolean().nullish().coalesce(true),
    prompt_template: z.string().nullish(),
    template_vars: z.record(z.unknown()).nullish().coalesce({}),
})
    .merge(CommonCompletionRequest)
    .and(BaseSamplerRequest);

export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequest>;

export const ChatCompletionRespChoice = z.object({
    index: z.number().default(0),
    finish_reason: z.string().optional(),
    message: ChatCompletionMessage,
});

export const ChatCompletionResponse = z.object({
    id: z.string().default(
        `chatcmpl-${crypto.randomUUID().replaceAll("-", "")}`,
    ),
    choices: z.array(ChatCompletionRespChoice),
    created: z.number().default((new Date()).getSeconds()),
    model: z.string(),
    object: z.string().default("chat.completion"),
});

export const ChatCompletionStreamChoice = z.object({
    index: z.number().default(0),
    finish_reason: z.string().optional(),
    delta: z.union([ChatCompletionMessage, z.record(z.unknown())]),
});

export const ChatCompletionStreamChunk = z.object({
    id: z.string().default(
        `chatcmpl-${crypto.randomUUID().replaceAll("-", "")}`,
    ),
    choices: z.array(ChatCompletionStreamChoice),
    created: z.number().default((new Date()).getSeconds()),
    model: z.string(),
    object: z.string().default("chat.completion.chunk"),
});
