
// src/mainpages/StudyPlanner/StudySchedule.js
import React from "react";
import "./plan.css";

const StudySchedule = ({ studyPlans }) => {
  return (
    <div className="study-schedule">
      <h2>Study Schedule</h2>
      {studyPlans.length === 0 ? (
        <p>No study plans available.</p>
      ) : (
        <ul>
          {studyPlans.map((plan, index) => (
            <li key={index} className="study-plan-item">
              <strong>{plan.subject}</strong> - {plan.topics}
              <br /> Exam Date: {plan.examDate}
              <br /> Study {plan.studyHours} hours/day
              <br /> {plan.schedule}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudySchedule;
