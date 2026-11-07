const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemma-4-26b-a4b-it';

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function askGemma(promptText) {
    const requestData = {
        contents: [
            {
                role: 'user',
                parts: [{ text: promptText }]
            }
        ]
    };

    try {
        console.log('[Gemma] API 호출 시작');

        const response = await axios.post(url, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            timeout: 60000
        });

        const parts = response.data?.candidates?.[0]?.content?.parts;

        if (!parts) {
            console.error('[Gemma] 응답에 생성 결과가 없음:',
                JSON.stringify(response.data, null, 2));
            return null;
        }

        const answer = parts
            .filter(part => typeof part.text === 'string')
            .map(part => part.text)
            .join('');

        console.log('[Gemma] API 호출 성공');
        return answer;

    } catch (error) {
        console.error('[Gemma] API 호출 실패');

        if (error.response) {
            console.error('HTTP 상태:', error.response.status);
            console.error('오류 내용:',
                JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }

        return null;
    }
}

askGemma('안녕하세요')
    .then(answer => {
        console.log('응답:', answer);
    });