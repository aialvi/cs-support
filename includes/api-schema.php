<?php
/**
 * API schema class.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

/**
 * Schema for API endpoints.
 */
class API_Schema {
    /**
     * Schema for AI generate reply endpoint.
     *
     * @return array
     */
    public static function ai_generate_reply_schema(): array {
        return [
            'ticket_id' => [
                'description' => __('Ticket ID to generate AI reply for', 'cs-support'),
                'type' => 'integer',
                'required' => true,
            ],
        ];
    }

    /**
     * Schema for AI settings.
     *
     * @return array
     */
    public static function ai_settings_schema(): array {
        return [
            'enabled' => [
                'description' => __('Enable AI assistant', 'cs-support'),
                'type' => 'boolean',
                'default' => false,
            ],
            'provider' => [
                'description' => __('AI provider', 'cs-support'),
                'type' => 'string',
                'enum' => ['openai', 'gemini', 'anthropic'],
                'default' => 'openai',
            ],
            'apiKey' => [
                'description' => __('API key for AI provider', 'cs-support'),
                'type' => 'string',
                'default' => '',
                'sanitize_callback' => function ($value) {
                    return sanitize_text_field($value);
                }
            ],
            'model' => [
                'description' => __('AI model to use', 'cs-support'),
                'type' => 'string',
                'default' => 'gpt-4o-mini',
                'sanitize_callback' => function ($value) {
                    return sanitize_text_field($value);
                }
            ],
            'maxTokens' => [
                'description' => __('Maximum tokens (length) for AI response', 'cs-support'),
                'type' => 'integer',
                'default' => 500,
                'minimum' => 100,
                'maximum' => 2000,
            ],
            'temperature' => [
                'description' => __('Temperature (creativity) for AI response', 'cs-support'),
                'type' => 'number',
                'default' => 0.7,
                'minimum' => 0,
                'maximum' => 1,
            ],
        ];
    }
}
