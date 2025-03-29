import * as z from "@/common/myZod.ts";
import { forcedSamplerOverrides } from "@/common/samplerOverrides.ts";

// Sampling schemas
const GenerationOptionsSchema = z.aliasedObject(
    z.object({
        max_tokens: z.number().gte(0).nullish()
            .samplerOverride("max_tokens", 0)
            .openapi({
                description: "Aliases: max_length",
            }),
        min_tokens: z.number().gte(0).nullish()
            .samplerOverride("min_tokens", 0)
            .openapi({
                description: "Aliases: min_length",
            }),
        stop: z.union([
            z.string().transform((str) => [str]),
            z.array(z.union([z.string(), z.number()])),
        ])
            .nullish()
            .samplerOverride("stop", [])
            .openapi({
                description: "Aliases: stop_sequence",
            }),
        add_bos_token: z.boolean().nullish()
            .samplerOverride("add_bos_token", true),
        ban_eos_token: z.boolean().nullish()
            .samplerOverride("ban_eos_token", false)
            .openapi({
                description: "Aliases: ignore_eos",
            }),
        skip_special_tokens: z.boolean().nullish()
            .samplerOverride("skip_special_tokens", false),
        seed: z.number().nullish()
            .samplerOverride("seed"),
        logit_bias: z.record(z.string(), z.number()).nullish()
            .samplerOverride("logit_bias", {}),
        grammar_string: z.string().nullish()
            .samplerOverride("grammar_string"),
        banned_tokens: z.union([
            z.array(z.number()),
            z.string()
                .transform((str) =>
                    str.replaceAll(" ", "")
                        .split(",")
                        .filter((x) => /^\d+$/.test(x))
                        .map((x) => parseInt(x))
                ),
        ])
            .nullish()
            .samplerOverride("banned_tokens", [])
            .openapi({
                description: "Aliases: custom_token_bans",
            }),
        banned_strings: z.union([
            z.string().transform((str) => [str]),
            z.array(z.string()),
        ])
            .nullish()
            .samplerOverride("banned_strings", []),
    }),
    [
        { field: "max_tokens", aliases: ["max_length"] },
        { field: "min_tokens", aliases: ["min_length"] },
        { field: "ban_eos_token", aliases: ["ignore_eos"] },
        { field: "stop", aliases: ["stop_sequence"] },
        { field: "banned_tokens", aliases: ["custom_token_bans"] },
    ],
)
    .openapi({
        description: "Generation options",
    });

const TemperatureSamplerSchema = z.object({
    temperature: z.number().gte(0).nullish()
        .samplerOverride("temperature", 1),
    temperature_last: z.boolean().nullish()
        .samplerOverride("temperature_last", false),
})
    .openapi({
        description: "Temperature options",
    });

const AlphabetSamplerSchema = z.aliasedObject(
    z.object({
        top_k: z.number().gte(-1).transform((top_k) => top_k == -1 ? 0 : top_k)
            .nullish()
            .samplerOverride("top_k", 0),
        top_p: z.number().gte(0).lte(1).nullish()
            .samplerOverride("top_p", 1),
        min_p: z.number().gte(0).lte(1).nullish()
            .samplerOverride("min_p", 0),
        typical: z.number().gt(0).lte(1).nullish()
            .samplerOverride("typical", 1),
        nsigma: z.number().gte(0).nullish()
            .samplerOverride("nsigma", 0),
    }),
    [{ field: "typical", aliases: ["typical_p"] }],
)
    .openapi({
        description: "Alphabet samplers",
    });

const PenaltySamplerSchema = z.aliasedObject(
    z.object({
        frequency_penalty: z.number().gte(0).nullish()
            .samplerOverride("frequency_penalty", 0),
        presence_penalty: z.number().gte(0).nullish()
            .samplerOverride("presence_penalty", 0),
        repetition_penalty: z.number().gt(0).nullish()
            .samplerOverride("repetition_penalty", 1)
            .openapi({
                description: "Aliases: rep_pen",
            }),
        penalty_range: z.number().nullish()
            .samplerOverride("penalty_range", -1)
            .openapi({
                description:
                    "Aliases: repetition_range, repetition_penalty_range, rep_pen_range",
            }),
    }),
    [
        { field: "repetition_penalty", aliases: ["rep_pen"] },
        {
            field: "penalty_range",
            aliases: [
                "repetition_range",
                "repetition_penalty_range",
                "rep_pen_range",
            ],
        },
    ],
)
    .openapi({
        description: "Penalty samplers",
    });

const DrySchema = z.aliasedObject(
    z.object({
        dry_multiplier: z.number().nullish()
            .samplerOverride("dry_multiplier", 0),
        dry_base: z.number().nullish()
            .samplerOverride("dry_base", 0),
        dry_allowed_length: z.number().nullish()
            .samplerOverride("dry_allowed_length", 0),
        dry_sequence_breakers: z.union([
            z.string()
                .transform((str) => {
                    if (!str.startsWith("[")) {
                        str = `[${str}]`;
                    }

                    // Parse can fail, so return a default value if it does
                    try {
                        return JSON.parse(str);
                    } catch {
                        return [];
                    }
                }),
            z.array(z.string()),
        ])
            .nullish()
            .samplerOverride("dry_sequence_breakers", []),
        dry_range: z.number().nullish()
            .samplerOverride("dry_range", 0)
            .openapi({
                description: "Aliases: dry_penalty_last_n",
            }),
    }),
    [{ field: "dry_range", aliases: ["dry_penalty_last_n"] }],
)
    .openapi({
        description: "DRY options",
    });

const XtcSchema = z.object({
    xtc_probability: z.number().nullish()
        .samplerOverride("xtc_probability", 0),
    xtc_threshold: z.number().nullish()
        .samplerOverride("xtc_threshold", 0.1),
})
    .openapi({
        description: "XTC options",
    });

const DynatempSchema = z.aliasedObject(
    z.object({
        max_temp: z.number().gte(0).nullish()
            .samplerOverride("max_temp", 1)
            .openapi({
                description: "Aliases: dynatemp_high",
            }),
        min_temp: z.number().gte(0).nullish()
            .samplerOverride("min_temp", 1)
            .openapi({
                description: "Aliases: dynatemp_low",
            }),
        temp_exponent: z.number().gte(0).nullish()
            .samplerOverride("temp_exponent", 1)
            .openapi({
                description: "Aliases: dynatemp_exponent",
            }),
    }),
    [
        { field: "max_temp", aliases: ["dynatemp_high"] },
        { field: "min_temp", aliases: ["dynatemp_low"] },
        { field: "temp_exponent", aliases: ["dynatemp_exponent"] },
    ],
)
    .openapi({
        description: "DynaTemp options",
    });

const MirostatSchema = z.object({
    mirostat_mode: z.number().nullish()
        .samplerOverride("mirostat_mode", 0),
    mirostat_tau: z.number().nullish()
        .samplerOverride("mirostat_tau", 1),
    mirostat_eta: z.number().nullish()
        .samplerOverride("mirostat_eta", 0),
})
    .openapi({
        description: "Mirostat options",
    });

// Define the schema
const BaseSamplerRequestSchema = GenerationOptionsSchema
    .and(TemperatureSamplerSchema)
    .and(AlphabetSamplerSchema)
    .and(PenaltySamplerSchema)
    .and(DrySchema)
    .and(XtcSchema)
    .and(DynatempSchema)
    .and(MirostatSchema);

// Define the type from the schema
export type BaseSamplerRequest = z.infer<typeof BaseSamplerRequestSchema>;

// Apply transforms and expose the type
export const BaseSamplerRequest = BaseSamplerRequestSchema
    .transform((obj) => {
        return forcedSamplerOverrides(obj);
    });
