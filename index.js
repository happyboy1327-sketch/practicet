const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemma-4-26b-a4b-it';

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function askGemma(){
    const requestData = {
        contents: [
            {
                role: 'user',
                parts: [{
    text: `상식 퀴즈 3문제를 생성하시오.

반드시 다음 규칙을 준수하시오.
1. 출력은 JSON 배열 하나로만 구성한다.
2. JSON 배열 앞뒤에 설명, 역할, 계획, 검증 결과를 출력하지 않는다.
3. 마크다운 코드 블록을 사용하지 않는다.
4. 각 객체는 question, choices, correctAnswerIndex, explanation 필드를 포함한다.
5. correctAnswerIndex는 0부터 시작한다.

출력 형식:
[
  {
    "question": "질문",
    "choices": ["보기1", "보기2", "보기3", "보기4"],
    "correctAnswerIndex": 0,
    "explanation": "해설"
  }
]`
}]
        }
    ],
        generationConfig: { 
        responseMimeType: "application/json",
        thinkingConfig: {
            thinkingLevel: "minimal"
        },
        temperature: 0.3
        }
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

            
            /*if (generatedContent.candidates && generatedContent.candidates.length > 0) {
                quizJsonText = generatedContent.candidates[0].content.parts[0].text;
            } else {
                 throw new Error("Gemini API 응답에서 유효한 후보를 찾을 수 없습니다.");
            }*/

            const cleanedJsonText = answer.trim();
const newQuizData = JSON.parse(cleanedJsonText);

if (!Array.isArray(newQuizData)) {
    throw new Error('JSON 배열 형식이 아닙니다.');
}

        console.log('[Gemma] API 호출 성공');
        return newQuizData;

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

askGemma()
    .then(data => {
        if (data !== null) {
                process.stdout.write(
                    JSON.stringify(data, null, 2) + '\n'
                     );
                   }
            });