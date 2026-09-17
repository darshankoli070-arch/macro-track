// Netlify serverless function: proxies chat requests to the Anthropic API.
// The API key lives only here, in a server-side environment variable
// (ANTHROPIC_API_KEY), and is never sent to or visible from the browser.
//
// The response is passed through as close to Anthropic's raw shape as
// possible, so the client's existing error-handling (rate limits, etc.)
// keeps working unchanged.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: { message: "Method not allowed" } }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { type: "config_error", message: "Server is missing ANTHROPIC_API_KEY. Set it in Netlify > Site configuration > Environment variables." } }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: { message: "Invalid JSON body" } }) };
  }

  const { system, messages, max_tokens } = payload;
  if (!messages) {
    return { statusCode: 400, body: JSON.stringify({ error: { message: "Missing messages" } }) };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 700,
        system,
        messages,
      }),
    });
    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: { type: "network_error", message: "Could not reach Anthropic's API from the server." } }),
    };
  }
};
