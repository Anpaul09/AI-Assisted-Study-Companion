
// src/api/studyPlannerApi.js
const API_KEY = "Your-OpenAI-API-Key-Here"; // Replace with your OpenAI API key

export const generateStudyPlan = async (plan) => {
  const prompt = `Create a structured study plan for the subject "${plan.subject}" covering topics "${plan.topics}" from today until ${plan.examDate}. The user has ${plan.studyHours} hours per day. Break it down by day, specifying what to study and how long to practice.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const schedule = data.choices[0].message.content.trim();
    return { ...plan, schedule };
  } catch (error) {
    console.error("Error generating study plan:", error);
    return { ...plan, schedule: "Failed to generate schedule." };
  }
};
