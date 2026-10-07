exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: "Image recognition is not configured. Add HF_TOKEN to Netlify environment variables and redeploy.",
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const image = body.image;
    const mimeType = body.mimeType || "image/jpeg";

    if (!image || typeof image !== "string") {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Please select a photo first." }) };
    }

    const completion = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-VL-7B-Instruct",
        temperature: 0.1,
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Look at this meal photo. Identify each distinct visible food item. Estimate a typical visible serving and approximate nutrition for that serving. Return ONLY valid JSON in this exact shape: {"items":[{"name":"food name","portion":"serving estimate","cal":0,"p":0,"c":0,"f":0}]}. Use calories as whole numbers and macros in grams. Do not invent items not visible. If no food is visible, return {"items":[]}. These are estimates, not measured values.',
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${image}` },
              },
            ],
          },
        ],
      }),
    });

    const data = await completion.json().catch(() => ({}));

    if (!completion.ok) {
      const message =
        data?.error?.message ||
        (typeof data?.error === "string" ? data.error : null) ||
        data?.message ||
        `Hugging Face returned HTTP ${completion.status}.`;

      return {
        statusCode: completion.status >= 500 ? 502 : completion.status,
        headers,
        body: JSON.stringify({ error: message }),
      };
    }

    const content = data?.choices?.[0]?.message?.content || "";
    const text = typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content.map((part) => part?.text || "").join(" ")
        : "";

    const jsonText = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonText) {
      throw new Error("The recognition service returned an unreadable result. Please try again.");
    }

    const parsed = JSON.parse(jsonText);
    const items = (Array.isArray(parsed.items) ? parsed.items : [])
      .filter((x) => x && x.name)
      .slice(0, 12)
      .map((x) => ({
        name: String(x.name).slice(0, 100),
        portion: String(x.portion || "estimated serving").slice(0, 100),
        cal: Math.max(0, Math.round(Number(x.cal) || 0)),
        p: Math.max(0, Number(x.p) || 0),
        c: Math.max(0, Number(x.c) || 0),
        f: Math.max(0, Number(x.f) || 0),
      }));

    return { statusCode: 200, headers, body: JSON.stringify({ items }) };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error?.message || "Could not analyze the photo." }),
    };
  }
};
