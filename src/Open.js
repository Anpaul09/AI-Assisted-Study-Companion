import React, { useState } from "react";

const Open = () => {
  const API_KEY = "censored for github, will add ignore later here";
  const [input, userprompt] = useState("");
  const [response, output] = useState("");

  const handler = async () => {
    const requestBody = {
      model: "gpt-4o-mini-2024-07-18",
      messages: [{ role: "user", content: input }],
      temperature: 0.7,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    output(data.choices[0].message.content);
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => userprompt(e.target.value)}
        rows="10"
        cols="100"
      />
      <button onClick={handler}>Enter</button>
      <p>{response}</p>
    </div>
  );
};

export default Open;
