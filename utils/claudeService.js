const { client, MODEL } = require('../config/claude');

/**
 * Helper: call OpenRouter and parse the JSON response
 */
const askAI = async (prompt) => {
    const completion = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.7,
    });

    const text = completion.choices[0].message.content.trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI returned invalid JSON. Raw: ' + text.slice(0, 200));
    return JSON.parse(jsonMatch[0]);
};

const generateInterviewQuestion = async ({ role, experienceLevel, mode, resumeData, previousQuestions = [], questionNumber = 1 }) => {
    const resumeContext = resumeData
        ? `Resume Skills: ${resumeData.skills?.join(', ') || 'Not provided'}
Experience: ${resumeData.experience?.map(e => `${e.role} at ${e.company}`).join(', ') || 'Not provided'}
Projects: ${resumeData.projects?.map(p => p.name).join(', ') || 'Not provided'}`
        : 'No resume provided.';

    const prevQText = previousQuestions.length > 0
        ? `Previously asked:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
        : 'This is the first question.';

    const prompt = `You are an expert technical interviewer for a ${mode} interview. The candidate is a ${experienceLevel} level ${role}.

${resumeContext}

${prevQText}

Generate interview question #${questionNumber}. Do NOT repeat previous questions. Match difficulty to ${experienceLevel} level.
- Technical: deep concepts, architecture, problem solving
- HR: behavioral, soft skills, situational
- Coding: coding problem with example input/output
- Mixed: alternate technical and behavioral

Reply ONLY with this JSON (no markdown fences):
{"question":"...","type":"technical|behavioral|coding|situational","difficulty":"easy|medium|hard","topic":"...","expectedKeywords":["kw1","kw2"]}`;

    return await askAI(prompt);
};

const evaluateAnswer = async ({ question, answer, role, experienceLevel, mode }) => {
    const prompt = `You are an expert interviewer. Score this interview answer.

Role: ${role} (${experienceLevel})  Mode: ${mode}
Question: ${question}
Answer: ${answer}

Reply ONLY with this JSON (no markdown fences):
{"scores":{"relevance":<0-25>,"technicalDepth":<0-25>,"clarity":<0-25>,"communication":<0-25>},"total":<0-100>,"feedback":{"overall":"<2-3 sentences>","strengths":["..."],"improvements":["..."]},"nextDifficulty":"easier|same|harder"}`;

    return await askAI(prompt);
};

const generateFinalReport = async ({ role, experienceLevel, mode, questionsAndAnswers, scores }) => {
    const qaText = questionsAndAnswers
        .map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}\nScore: ${qa.score}/100`)
        .join('\n\n');

    const prompt = `You are an HR director. Generate a full interview performance report.

Role: ${role} (${experienceLevel})  Mode: ${mode}  Avg Score: ${scores.average}/100

Q&A:
${qaText}

Reply ONLY with this JSON (no markdown fences):
{"strengths":["...","..."],"weaknesses":["..."],"skillGaps":[{"skill":"...","severity":"low|medium|high","recommendation":"..."}],"learningRecommendations":[{"topic":"...","resources":["..."],"priority":"low|medium|high"}],"performanceSummary":"<3-4 sentences>","hiringRecommendation":"Strong Hire|Hire|Maybe|No Hire"}`;

    return await askAI(prompt);
};

const parseResumeWithClaude = async (resumeText) => {
    const prompt = `Extract structured info from this resume.

${resumeText.substring(0, 8000)}

Reply ONLY with this JSON (no markdown fences):
{"skills":["..."],"experience":[{"company":"...","role":"...","duration":"...","description":"..."}],"projects":[{"name":"...","description":"...","technologies":["..."]}],"education":[{"institution":"...","degree":"...","year":"..."}],"summary":"..."}`;

    return await askAI(prompt);
};

const evaluateCodingSolution = async ({ problem, solution, testCases }) => {
    const prompt = `You are a senior engineer. Evaluate this JS solution.

Problem: ${problem}
\`\`\`javascript
${solution}
\`\`\`
Test cases: ${JSON.stringify(testCases)}

Reply ONLY with this JSON (no markdown fences):
{"passed":true,"score":<0-100>,"testResults":[{"input":"...","expectedOutput":"...","passed":true}],"feedback":{"overall":"...","timeComplexity":"O(...)","spaceComplexity":"O(...)","improvements":["..."]}}`;

    return await askAI(prompt);
};

module.exports = {
    generateInterviewQuestion,
    evaluateAnswer,
    generateFinalReport,
    parseResumeWithClaude,
    evaluateCodingSolution
};
