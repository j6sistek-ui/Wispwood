import { createServerFn } from "@tanstack/react-start";
import type { CraftedSpell, CraftExtra, CraftShape } from "./engine";

const SHAPES: CraftShape[] = ["single", "triple", "weave", "orb", "beam", "nova", "wave", "meteor", "shard", "homing"];
const EXTRAS: CraftExtra[] = ["none", "burn", "slow", "stun"];

function asShape(v: unknown): CraftShape {
  return SHAPES.includes(v as CraftShape) ? (v as CraftShape) : "orb";
}
function asExtra(v: unknown): CraftExtra {
  return EXTRAS.includes(v as CraftExtra) ? (v as CraftExtra) : "none";
}

export const inventSpell = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => ({
    prompt: String(input?.prompt ?? "").trim().slice(0, 160),
  }))
  .handler(async ({ data }): Promise<{ ok: true; spell: CraftedSpell } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "AI is not available" };

    const wish = data.prompt || "Invent a brand new lantern spell for an autumn forest night";
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 1.05,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content:
              "You invent unique Wispwood spells. Reply with ONLY compact JSON, no markdown: " +
              '{"name":"Max10chars","color":"#rrggbb","damage":4-28,"shape":"single|triple|weave|orb|beam|nova|wave|meteor|shard|homing","extra":"none|burn|slow|stun","cooldown":0.35-1.8}. ' +
              "Name must be a new invented word, not Ember Ice Bolt Void. Match the player's wish.",
          },
          { role: "user", content: wish },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `xAI API error ${res.status}` };

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const jsonText = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonText) return { ok: false, error: "No spell" };
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText) as Record<string, unknown>;
    } catch {
      return { ok: false, error: "Bad spell" };
    }

    const name = String(parsed.name ?? "Rune")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);
    const color = /^#[0-9a-fA-F]{6}$/.test(String(parsed.color)) ? String(parsed.color) : "#9a7ab8";
    const damage = Math.max(4, Math.min(28, Math.round(Number(parsed.damage) || 14)));
    const cooldown = Math.max(0.35, Math.min(1.8, Number(parsed.cooldown) || 0.6));
    return {
      ok: true,
      spell: {
        name: name || "Rune",
        color,
        damage,
        shape: asShape(parsed.shape),
        extra: asExtra(parsed.extra),
        cooldown,
        rarity: damage >= 24 ? "legendary" : damage >= 20 ? "epic" : damage >= 16 ? "rare" : damage >= 12 ? "uncommon" : "common",
        shots: Math.max(1, Math.min(10, Math.round(Number(parsed.shots) || 1))),
        ability: "seek",
      },
    };
  });
