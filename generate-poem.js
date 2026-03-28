module.exports = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { imageBase64, model } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64' });
    }

    const apiKey = process.env.DOUBAO_API_KEY;
    const endpointId = process.env.ENDPOINT_ID || 'ep-20260328145254-6svwm';
    const apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: endpointId,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: '请根据这张图片的内容创作一首诗，可以是五言、七言或现代诗，要求内容与图片相关，富有诗意和美感。'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.8
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`API请求失败: ${response.status} - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('API返回数据格式不正确');
        }
        const poem = data.choices[0].message.content;
        res.status(200).json({ poem });
    })
    .catch(error => {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    });
};
