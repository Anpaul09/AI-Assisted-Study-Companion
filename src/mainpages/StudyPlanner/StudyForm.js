// src/mainpages/StudyPlanner/StudyForm.js
import React, { useState } from "react";
import "./plan.css";

const StudyForm = ({ addStudyPlan }) => {
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState("");
  const [examDate, setExamDate] = useState("");
  const [studyHours, setStudyHours] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !topics || !examDate || !studyHours) return;
    const newPlan = { subject, topics, examDate, studyHours };
    addStudyPlan(newPlan);
    setSubject("");
    setTopics("");
    setExamDate("");
    setStudyHours("");
  };

  return (
    <form className="study-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <input
        type="text"
        placeholder="Topics (comma-separated)"
        value={topics}
        onChange={(e) => setTopics(e.target.value)}
      />
      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
      />
      <input
        type="number"
        placeholder="Study Hours per Day"
        value={studyHours}
        onChange={(e) => setStudyHours(e.target.value)}
      />
      <button className="planbutton" type="submit">Generate Study Plan</button>
    </form>
  );
};

export default StudyForm;












