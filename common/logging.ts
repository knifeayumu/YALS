import winston from "winston";
import colors from "yoctocolors";
import { config } from "@/common/config.ts";
import { BaseSamplerRequest } from "@/common/sampling.ts";

const customFormat = winston.format.printf(({ timestamp, level, message }) => {
    const coloredTimestamp = colors.dim(timestamp as string);
    const upperLevel = level.toUpperCase();

    // Set colored log level
    let coloredLevel = upperLevel;
    switch (level) {
        case "error":
            coloredLevel = colors.red(upperLevel);
            break;
        case "warn":
            coloredLevel = colors.yellow(upperLevel);
            break;
        case "info":
            coloredLevel = colors.green(upperLevel);
            break;
        case "debug":
            coloredLevel = colors.cyan(upperLevel);
            break;
        default:
            coloredLevel = colors.dim(upperLevel);
    }
    coloredLevel = colors.bold(coloredLevel);

    const coloredPrefix = colors.dim("YALS");

    return `${coloredTimestamp} ${coloredLevel} ${coloredPrefix}: ${message}`;
});

export const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        customFormat,
    ),
    transports: [new winston.transports.Console({ level: "info" })],
});

export function logPrompt(prompt: string) {
    // Log prompt to console
    // Prompts can be very large, so make the newline log a console.log instead
    if (config.logging.log_prompt) {
        logger.info(`Prompt:`);
        console.log(prompt);
    }
}

export function logGenParams(requestId: string, params: BaseSamplerRequest) {
    if (config.logging.log_generation_params) {
        const samplerParams = BaseSamplerRequest.parse(params);
        const formattedParams = Deno.inspect(samplerParams, {
            depth: 2,
            compact: true,
            breakLength: Infinity,
        });

        logger.info(
            `Generation Parameters (ID: ${requestId}): ${
                colors.green(formattedParams)
            }`,
        );
    }
}
