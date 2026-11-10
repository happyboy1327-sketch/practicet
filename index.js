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
    text: `2026년 최신 정보를 기준으로 주제의 편중 없이 중급 난도의 상식 퀴즈 2문제를 생성하시오.

반드시 다음 규칙을 준수하시오.
1. 출력은 JSON 배열 하나로만 구성한다.
2. JSON 배열 앞뒤에 설명, 역할, 계획, 검증 결과를 출력하지 않는다.
3. 마크다운 코드 블록을 사용하지 않는다.
4. 각 객체는 question, choices, correctAnswerIndex, explanation 필드를 포함한다.
5. correctAnswerIndex는 0부터 시작한다.
6. 해설 내엔 출처를 반드시 표기한다.
예시→ [출처: ]
7. JSON 문자열 내부의 큰따옴표, 줄바꿈, 탭 등 특수문자는 반드시 JSON 표준에 따라 이스케이프한다. 문자열 내부에 이스케이프되지 않은 제어문자를 절대 포함하지 않는다.

[사실관계 및 최신성 검증 규칙]

1. 최신성 검증
- 모든 정보는 현재 날짜를 기준으로 판단한다.
- 종료·폐지·변경된 서비스, 제품, 정책을 현재 유효한 것처럼 설명하지 않으며, **반드시 구글 검색 툴(google_search)을 이용한다.**
- 과거의 사실과 현재의 사실을 명확히 구분한다.

2. 출처 신뢰성
- 공식 홈페이지, 정부기관, 공식 발표 및 기술 문서를 우선한다.
- 최신 정보는 실시간 검색을 통해 확인한다.
- 출처가 불분명하거나 검증되지 않은 정보는 사실로 단정하지 않는다.

3. 개념적 정확성
- 기술·과학·법률 개념을 서로 혼동하거나 잘못 일반화하지 않는다.
- 특정 제품의 구현 방식과 일반적인 기술 원리를 구분한다.
- 복수의 선택지가 정답이 될 수 있는 모호한 질문을 금지한다.

4. 정답 및 해설 검증
- 질문, 정답, 오답, 해설의 사실관계가 서로 일치하는지 검증한다.
- 정답은 객관적인 근거로 입증할 수 있어야 한다.
- 과거 정보, 추측, 잘못된 인과관계를 정답 근거로 사용하지 않는다.

5. 오류 차단
- 사실관계나 최신성을 확인할 수 없는 문제는 출제하지 않는다.
- 검증 과정에서 오류가 발견되면 해당 문제를 폐기하고 교체한다.
- 문제 수보다 사실적 정확성을 최우선으로 한다.


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
        tools: [{ googleSearch: {} }],
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
            console.log('[원본 응답]', JSON.stringify(cleanedJsonText));
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