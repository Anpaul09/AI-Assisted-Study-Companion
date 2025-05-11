const API_KEY = "Your-OpenAI- Key-Here"; // Replace with your OpenAI API key

// Function for generating category sorting game
export const getCategorySortingGame = async (userCategory) => {
  console.log('Requested userCategory:', userCategory); // Debug: Log input
  const prompt = `Create a category sorting game based on the theme "${userCategory}". Provide categories and items that belong in each category. Return a JSON response in this format:
  {
    "categories": {
      "Category1": ["item1", "item2"],
      "Category2": ["item3", "item4"]
    },
    "items": ["item1", "item2", "item3", "item4"]
  }
  Ensure the categories and items are relevant to "${userCategory}". Return only the JSON object, without any additional text or formatting.`;

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

    console.log('HTTP Response Status:', response.status); // Debug: Log status
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', data); // Debug: Log raw response
    const content = data.choices[0].message.content.trim();
    // Remove Markdown backticks and newlines if present
    const jsonString = content.replace(/```json\n|\n```/g, '').trim();
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, jsonString);
      return null;
    }
  } catch (error) {
    console.error("Error fetching category sorting game:", error);
    return null;
  }
};

// Function for generating study schedules
export const generateStudySchedule = async (prompt) => {
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
    const content = data.choices[0].message.content.trim();
    const jsonString = content.replace(/```json\n|\n```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating study schedule:", error);
    return null;
  }
};