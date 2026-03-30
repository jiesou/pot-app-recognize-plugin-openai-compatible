async function recognize(base64, lang, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;
    let { apiKey, requestPath, model, customPrompt, thinkMode } = config;

    const url = new URL(requestPath);
    if (!/https?:\/\/.+/.test(requestPath)) {
        requestPath = `https://${requestPath}`;
    }
    if (requestPath.endsWith('/')) {
        requestPath = requestPath.slice(0, -1);
    }
    if (!url.pathname.includes('/chat/completions')) {
        url.pathname = basePath + '/chat/completions';
    }
    requestPath = url.toString();

    if (!customPrompt) {
        customPrompt = "Just recognize the text in the image. Do not offer unnecessary explanations.";
    } else {
        customPrompt = customPrompt.replaceAll("$lang", lang);
    }

    const body = {
        model,
        messages: [
            { "role": "system", "content": customPrompt },
            { "role": "user", "content": [
                { "type": "text", "text": "Text Recognition: " },
                { "type": "image_url", "image_url": { "url": `data:image/png;base64,${base64}`, "detail": "high" } }
            ]}
        ],
        stream: false,
        think: thinkMode !== "disable"
    };

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
        let res = await fetch(requestPath, {
            method: 'POST',
            url: requestPath,
            headers,
            body: { type: "Json", payload: body },
            timeout: 120000
        });

        if (res.ok) {
            let result = res.data;
            let content = result.choices[0].message.content || "";
            return content;
        } else {
            throw new Error(`Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`);
        }
    } catch (error) {
        throw new Error(`Request failed: ${error.message}\nURL: ${requestPath}`);
    }
}
