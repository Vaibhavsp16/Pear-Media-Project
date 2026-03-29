async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  return payload;
}

export const api = {
  enhancePrompt: (body) => postJson("/api/text/enhance", body),
  generateFromPrompt: (body) => postJson("/api/text/generate", body),
  analyzeImage: (body) => postJson("/api/image/analyze", body),
  generateVariations: (body) => postJson("/api/image/variations", body),
};
