const MODEL = "Qwen/Qwen2.5-VL-7B-Instruct";

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function extractJson(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return JSON.parse(cleaned.slice(start, end + 1));
  }

  throw new Error("Invalid model JSON");
}

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .slice(0, 12)
    .map((item) => ({
      name: String(item?.name || "Unknown food")
        .trim()
        .slice(0, 100),

      portion: String(item?.portion || "estimated portion")
        .trim()
        .slice(0, 100),

      cal: Math.max(0, Math.round(Number(item?.cal) || 0)),
      p: Math.max(0, Math.round(Number(item?.p) || 0)),
      c: Math.max(0, Math.round(Number(item?.c) || 0)),
      f: Math.max(0, Math.round(Number(item?.f) || 0)),
    }))
    .filter(
      (x) =>
        x.name &&
        (x.cal || x.p || x.c || x.f)
    );
}

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, {
      error: "Method not allowed.",
    });
  }

  const token = process.env.HF_TOKEN;

  if (!token) {
    return jsonResponse(500, {
      error:
        "Food scanning is not configured yet. Add HF_TOKEN to Netlify.",
    });
  }

  let body;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, {
      error: "Invalid request body.",
    });
  }

  const image = body?.image;
  const mediaType = body?.mediaType || "image/jpeg";

  if (!image || typeof image !== "string") {
    return jsonResponse(400, {
      error: "No image was provided.",
    });
  }

  if (
    !new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]).has(mediaType)
  ) {
    return jsonResponse(400, {
      error: "Unsupported image type.",
    });
  }

  if (image.length > 6000000) {
    return jsonResponse(413, {
      error:
        "Image is too large. Please choose a smaller photo.",
    });
  }

  const prompt = `You are a food-photo nutrition estimator for a calorie and macro tracking app.

Identify each distinct visible food item and estimate the portion actually shown. Give approximate calories, protein, carbohydrates, and fat for that portion.

Rules:
- Estimate only what is visibly present; do not invent foods.
- For Indian food, use typical Indian preparation assumptions.
- If a dish is ambiguous, use the most likely common dish and keep the estimate reasonable.
- Separate distinct foods.
- Drinks only if they contain meaningful calories.
- These are estimates, not laboratory measurements.
- Return ONLY valid JSON, exactly:
{"items":[{"name":"...","portion":"...","cal":0,"p":0,"c":0,"f":0}]}
All numeric fields must be numbers, not strings.`;

  const hf = await fetch(
    "https://router.huggingface.co/v1/chat/completions",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: `${MODEL}:fastest`,

        messages: [
          {
            role: "user",

            content: [
              {
                type: "text",
                text: prompt,
              },

              {
                type: "image_url",

                image_url: {
                  url: `data:${mediaType};base64,${image}`,
                },
              },
            ],
          },
        ],

        max_tokens: 700,
        temperature: 0.1,
        stream: false,
      }),
    }
  );

  const raw = await hf.text();

  if (!hf.ok) {
    let detail = raw;

    try {
      const parsed = JSON.parse(raw);

      detail =
        parsed?.error ||
        parsed?.message ||
        raw;
    } catch {}

    console.error(
      "Hugging Face food scan error:",
      hf.status,
      detail
    );

    if (hf.status === 429) {
      return jsonResponse(429, {
        error:
          "The free AI limit is temporarily reached. Please try again later.",
      });
    }

    return jsonResponse(502, {
      error:
        "The food AI is temporarily unavailable. Please try again.",
    });
  }

  try {
    const result = JSON.parse(raw);

    const content =
      result?.choices?.[0]?.message?.content;

    const parsed = extractJson(content);

    const items = sanitizeItems(parsed?.items);

    if (!items.length) {
      throw new Error("No food detected");
    }

    return jsonResponse(200, {
      items,
    });
  } catch (err) {
    console.error(
      "Food scan parse error:",
      err,
      raw
    );

    return jsonResponse(502, {
      error:
        "The food AI returned an invalid nutrition estimate.",
    });
  }
};
