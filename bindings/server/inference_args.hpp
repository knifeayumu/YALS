#ifndef INFERENCE_ARGS_HPP
#define INFERENCE_ARGS_HPP

#include <vector>
#include <string>
#include <llama.h>

/*
 *  A lightweight data struct of inference args.
 *
 *  Provides
 *  Automatic conversion from c-style null-terminated string arrays with length and token arrays with count to vectors
 */

class InferenceArgs {
public:
    llama_sampler* sampler;
    int max_tokens_to_gen;
    int min_tokens_to_gen;
    uint32_t max_slot_n_ctx;
    unsigned seed;
    std::vector<std::string> rewind_strings;
    std::vector<std::string> stopping_strings;
    std::vector<int32_t> stopping_tokens;
    const char* grammar;

    InferenceArgs(): sampler(nullptr), max_tokens_to_gen(0), min_tokens_to_gen(0), max_slot_n_ctx(std::numeric_limits<uint32_t>::max()), seed(0),
                     grammar(nullptr) {
    };

    explicit InferenceArgs(
        llama_sampler* sampler,
        const int max_tokens = 50,
        const int min_tokens = 10,
        const uint32_t max_slot_n_ctx = std::numeric_limits<uint32_t>::max(),
        const unsigned seed = 1337,
        const char** rewind_strings = nullptr,
        const unsigned num_rewind_strings = 0,
        const char** stopping_strings = nullptr,
        const unsigned num_stopping_strings = 0,
        const int32_t* stopping_tokens = nullptr,
        const unsigned num_stopping_tokens = 0,
        const char* grammar = nullptr)

    :   sampler(sampler),
        max_tokens_to_gen(max_tokens),
        min_tokens_to_gen(min_tokens),
        max_slot_n_ctx(max_slot_n_ctx),
        seed(seed),
        grammar(grammar)
    {
        if (rewind_strings != nullptr && num_rewind_strings > 0) {
            this->rewind_strings.reserve(num_rewind_strings);
            for (unsigned i = 0; i < num_rewind_strings; ++i) {
                if (rewind_strings[i]) {
                    this->rewind_strings.emplace_back(rewind_strings[i]);
                }
            }
        }

        if (stopping_strings != nullptr && num_stopping_strings > 0) {
            this->stopping_strings.reserve(num_stopping_strings);
            for (unsigned i = 0; i < num_stopping_strings; ++i) {
                if (stopping_strings[i]) {
                    this->stopping_strings.emplace_back(stopping_strings[i]);
                }
            }
        }

        if (stopping_tokens != nullptr && num_stopping_tokens > 0) {
            this->stopping_tokens.assign(stopping_tokens,
                                         stopping_tokens + num_stopping_tokens);
        }
    }
};

#endif //INFERENCE_ARGS_HPP
