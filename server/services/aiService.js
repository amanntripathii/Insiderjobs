import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

/**
 * Analyzes a candidate's resume against a job description using Groq (Llama 3).
 * Forces structured JSON output via response_format.
 *
 * @param {string} resumeText     - Extracted plain text from the candidate's PDF resume
 * @param {string} jobDescription - Full job description text
 * @param {string} jobTitle       - Title of the job
 * @returns {Promise<{
 *   matchScore: number,
 *   candidateSkills: string[],
 *   requiredSkills: string[],
 *   missingSkills: string[],
 *   summary: string
 * }>}
 */
export const analyzeResumeJobMatch = async (resumeText, jobDescription, jobTitle) => {

    const prompt = `You are an expert technical recruiter AI. Analyze the candidate resume against the job description and return a JSON compatibility report.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

Return ONLY valid JSON in exactly this format (no markdown, no extra text):
{
  "matchScore": <number 0-100>,
  "candidateSkills": ["skill1", "skill2"],
  "requiredSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "summary": "<1-2 sentence explanation of the score>"
}`

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' },
            temperature: 0.3,
        })

        const responseText = completion.choices[0]?.message?.content
        if (!responseText) throw new Error('Empty response from Groq')

        const analysis = JSON.parse(responseText)

        // Validate structure
        if (
            typeof analysis.matchScore !== 'number' ||
            !Array.isArray(analysis.candidateSkills) ||
            !Array.isArray(analysis.requiredSkills) ||
            !Array.isArray(analysis.missingSkills) ||
            typeof analysis.summary !== 'string'
        ) {
            throw new Error('Invalid AI response structure')
        }

        // Clamp score 0–100
        analysis.matchScore = Math.max(0, Math.min(100, Math.round(analysis.matchScore)))

        return analysis
    } catch (error) {
        console.error('Groq AI error:', error.message)
        throw new Error(`AI analysis failed: ${error.message}`)
    }
}
