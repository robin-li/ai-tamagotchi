import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

const testAiSchema = z.object({
  provider: z.enum(['openai', 'gemini', 'anthropic', 'minimax']),
  apiKey: z.string().min(1),
  model: z.string().min(1),
});

export default async function aiRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  // POST /api/ai/test — test if the API key + model combination works
  fastify.post(
    '/test',
    {
      onRequest: [],
    },
    async (request, reply) => {
      const parsed = testAiSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Validation error',
          details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
      }

      const { provider, apiKey, model } = parsed.data;

      const testMessage = '說一句話，越短越好。';

      try {
        if (provider === 'openai' || provider === 'minimax') {
          const endpoint =
            provider === 'openai'
              ? 'https://api.openai.com/v1/chat/completions'
              : 'https://api.minimax.chat/v1/chat/completions';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: testMessage }],
              // gpt-4o 以上新模型用 max_completion_tokens，舊模型用 max_tokens
              // 同時帶兩個，舊模型會忽略 max_completion_tokens，新模型會忽略 max_tokens
              max_completion_tokens: 50,
            }),
          });

          if (!res.ok) {
            const body = await res.text();
            return reply.status(200).send({
              ok: false,
              error: `${provider} API error ${res.status}: ${body.slice(0, 200)}`,
            });
          }

          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const reply_ = data.choices?.[0]?.message?.content?.trim() ?? '';
          return reply.status(200).send({ ok: true, reply: reply_ });
        }

        if (provider === 'anthropic') {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model,
              max_tokens: 50,
              messages: [{ role: 'user', content: testMessage }],
            }),
          });

          if (!res.ok) {
            const body = await res.text();
            return reply.status(200).send({
              ok: false,
              error: `Anthropic API error ${res.status}: ${body.slice(0, 200)}`,
            });
          }

          const data = (await res.json()) as { content?: { text?: string }[] };
          const reply_ = data.content?.[0]?.text?.trim() ?? '';
          return reply.status(200).send({ ok: true, reply: reply_ });
        }

        if (provider === 'gemini') {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: testMessage }] }],
            }),
          });

          if (!res.ok) {
            const body = await res.text();
            return reply.status(200).send({
              ok: false,
              error: `Gemini API error ${res.status}: ${body.slice(0, 200)}`,
            });
          }

          const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
          const reply_ = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
          return reply.status(200).send({ ok: true, reply: reply_ });
        }

        return reply.status(400).send({ ok: false, error: 'Unknown provider' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(200).send({ ok: false, error: message });
      }
    },
  );
}
