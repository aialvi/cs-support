<?php
/**
 * AI Assistant class to generate replies using AI services.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

class AI_Assistant
{
    /**
     * Plugin instance.
     *
     * @var Plugin
     */
    protected $plugin;

    /**
     * AI settings.
     *
     * @var array
     */
    protected $ai_settings;

    /**
     * Constructor.
     *
     * @param Plugin $plugin Plugin instance.
     */
    public function __construct(Plugin $plugin)
    {
        $this->plugin = $plugin;
        $this->ai_settings = $this->get_ai_settings();

        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    /**
     * Register REST API endpoints.
     */
    public function register_rest_routes(): void
    {
        register_rest_route(
            'cs-support/v1',
            '/ai/generate-reply',
            [
                'methods' => 'POST',
                'callback' => [$this, 'generate_ai_reply'],
                'permission_callback' => [$this, 'check_reply_permission'],
                'args' => [
                    'ticket_id' => [
                        'required' => true,
                        'validate_callback' => function ($param) {
                            return is_numeric($param) && intval($param) > 0;
                        },
                    ],
                ],
            ]
        );
    }

    /**
     * Check if user can reply to tickets.
     *
     * @return bool
     */
    public function check_reply_permission(): bool
    {
        return current_user_can('reply_to_tickets') || current_user_can('manage_options');
    }

    /**
     * Get AI settings.
     *
     * @return array
     */
    protected function get_ai_settings(): array
    {
        $settings = get_option('cs_support_helpdesk_settings', []);
        return isset($settings['ai']) ? $settings['ai'] : [
            'enabled' => false,
            'provider' => 'openai',
            'apiKey' => '',
            'model' => 'gpt-4o-mini',
            'maxTokens' => 500,
            'temperature' => 0.7,
        ];
    }

    /**
     * Generate AI reply.
     *
     * @param \WP_REST_Request $request Request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function generate_ai_reply(\WP_REST_Request $request)
    {
        global $wpdb;

        // Check if AI is enabled
        if (empty($this->ai_settings['enabled']) || empty($this->ai_settings['apiKey'])) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'AI assistant is not enabled or missing API key',
            ], 400);
        }

        $ticket_id = (int) $request->get_param('ticket_id');

        // Get ticket details
        $ticket = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cs_support_tickets WHERE id = %d",
            $ticket_id
        ), ARRAY_A);

        if (!$ticket) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Ticket not found',
            ], 404);
        }

        // Get ticket replies
        $replies = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}cs_support_ticket_replies WHERE ticket_id = %d ORDER BY created_at ASC",
            $ticket_id
        ), ARRAY_A);

        // Format ticket and replies for AI context
        $context = $this->format_ticket_context($ticket, $replies);

        try {
            // Generate AI reply based on provider
            switch ($this->ai_settings['provider']) {
                case 'openai':
                    $response = $this->generate_openai_reply($context);
                    break;
                case 'gemini':
                    $response = $this->generate_gemini_reply($context);
                    break;
                case 'anthropic':
                    $response = $this->generate_claude_reply($context);
                    break;
                default:
                    return new \WP_REST_Response([
                        'success' => false,
                        'message' => 'Invalid AI provider',
                    ], 400);
            }

            return new \WP_REST_Response([
                'success' => true,
                'reply' => $response,
            ]);
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Error generating AI reply: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format ticket context for AI.
     *
     * @param array $ticket Ticket data.
     * @param array $replies Ticket replies.
     * @return string
     */
    protected function format_ticket_context(array $ticket, array $replies): string
    {
        $context = "TICKET SUBJECT: {$ticket['subject']}\n\n";
        $context .= "TICKET DESCRIPTION: {$ticket['description']}\n\n";
        $context .= "TICKET CATEGORY: {$ticket['category']}\n";
        $context .= "TICKET PRIORITY: {$ticket['priority']}\n";
        $context .= "TICKET STATUS: {$ticket['status']}\n\n";

        if (!empty($replies)) {
            $context .= "CONVERSATION HISTORY:\n\n";

            foreach ($replies as $reply) {
                $user_type = $reply['user_id'] === $ticket['user_id'] ? 'CUSTOMER' : 'SUPPORT AGENT';
                $context .= "{$user_type}: {$reply['reply']}\n\n";
            }
        }

        // Add instructions for the AI
        $context .= "INSTRUCTIONS: Please draft a helpful, professional reply to this support ticket. The reply should be empathetic, address the customer's concerns directly, and provide clear solutions or next steps. Use a friendly, supportive tone that represents our company well. Do not include any personal information or sensitive data in your response. The reply should not include any markdown or formatting, just plain text. line breaks should be used to separate paragraphs. it should be between 100 to 350 characters.\n";

        return $context;
    }

    /**
     * Generate reply using OpenAI API.
     *
     * @param string $context Formatted ticket context.
     * @return string
     * @throws \Exception
     */
    protected function generate_openai_reply(string $context): string
    {
        $api_key = $this->ai_settings['apiKey'];
        $model = $this->ai_settings['model'];
        $max_tokens = (int) $this->ai_settings['maxTokens'];
        $temperature = (float) $this->ai_settings['temperature'];

        // o1 models have different parameter requirements
        $is_o1_model = strpos($model, 'o1') === 0;

        $payload = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful support assistant. Your goal is to draft professional, empathetic responses to customer support tickets.'
                ],
                [
                    'role' => 'user',
                    'content' => $context
                ]
            ],
        ];

        // o1 models don't support temperature or system messages in the same way
        if ($is_o1_model) {
            // For o1 models, remove system message and use user message with instructions
            $payload['messages'] = [
                [
                    'role' => 'user',
                    'content' => 'You are a helpful support assistant. Your goal is to draft professional, empathetic responses to customer support tickets. ' . $context
                ]
            ];
            // o1 models use max_completion_tokens instead of max_tokens
            $payload['max_completion_tokens'] = $max_tokens;
        } else {
            // Regular models use max_tokens and temperature
            $payload['max_tokens'] = $max_tokens;
            $payload['temperature'] = $temperature;
        }

        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode($payload),
            'timeout' => 120, // Increased timeout for o1 models which can be slower
        ]);

        if (is_wp_error($response)) {
            throw new \Exception(esc_html($response->get_error_message()));
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (isset($body['error'])) {
            throw new \Exception(esc_html($body['error']['message']));
        }

        if (empty($body['choices'][0]['message']['content'])) {
            throw new \Exception('Empty response from OpenAI API');
        }

        return $body['choices'][0]['message']['content'];
    }

    /**
     * Generate reply using Google Gemini API.
     *
     * @param string $context Formatted ticket context.
     * @return string
     * @throws \Exception
     */
    protected function generate_gemini_reply(string $context): string
    {
        $api_key = $this->ai_settings['apiKey'];
        $model = $this->ai_settings['model'];
        $temperature = (float) $this->ai_settings['temperature'];

        // Format the context with system instructions for Gemini
        $formatted_context = "You are a helpful support assistant. Your goal is to draft professional, empathetic responses to customer support tickets. markdown formatting is not allowed. The reply should be between 100 to 350 characters.\n\n" . $context;

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $formatted_context
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => $temperature,
                'maxOutputTokens' => (int) $this->ai_settings['maxTokens'],
                'topP' => 0.8,
                'topK' => 40,
            ],
        ];

        // Use the v1beta API for latest models
        $api_version = strpos($model, '2.0') !== false ? 'v1beta' : 'v1beta';
        $response = wp_remote_post("https://generativelanguage.googleapis.com/{$api_version}/models/{$model}:generateContent?key={$api_key}", [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode($payload),
            'timeout' => 60,
        ]);

        if (is_wp_error($response)) {
            throw new \Exception(esc_html($response->get_error_message()));
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (isset($body['error'])) {
            throw new \Exception(esc_html($body['error']['message']));
        }

        if (empty($body['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception('Empty response from Gemini API');
        }

        return $body['candidates'][0]['content']['parts'][0]['text'];
    }

    /**
     * Generate reply using Anthropic Claude API.
     *
     * @param string $context Formatted ticket context.
     * @return string
     * @throws \Exception
     */
    protected function generate_claude_reply(string $context): string
    {
        $api_key = $this->ai_settings['apiKey'];
        $model = $this->ai_settings['model'];
        $max_tokens = (int) $this->ai_settings['maxTokens'];
        $temperature = (float) $this->ai_settings['temperature'];

        $payload = [
            'model' => $model,
            'max_tokens' => $max_tokens,
            'temperature' => $temperature,
            'system' => 'You are a helpful support assistant. Your goal is to draft professional, empathetic responses to customer support tickets. Do not include any personal information or sensitive data in your response. The reply should not include any markdown or formatting, just plain text. Line breaks should be used to separate paragraphs. The reply should be between 100 to 350 characters.',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $context
                ]
            ],
        ];

        $response = wp_remote_post('https://api.anthropic.com/v1/messages', [
            'headers' => [
                'x-api-key' => $api_key,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode($payload),
            'timeout' => 60,
        ]);

        if (is_wp_error($response)) {
            throw new \Exception(esc_html($response->get_error_message()));
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (isset($body['error'])) {
            throw new \Exception(esc_html($body['error']['message']));
        }

        if (empty($body['content'][0]['text'])) {
            throw new \Exception('Empty response from Claude API');
        }

        return $body['content'][0]['text'];
    }
}
