import { useLocation } from "react-router-dom";
import { FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa"; // import icons
import "./QuizDetails.css"; // import the css file  


export default function QuizDetails() {

  const { state } = useLocation(); // get the state from the page before

  // the quiz data is gotten from the state
  const quiz = state?.quiz || state?.quizData;


  // If there is no quiz data found in the location state, the error message should show
  if (!quiz) {
    return (
      <div className="quiz-error">
        <h2>Quiz is not Found</h2>
        <p>The quiz could not be loaded.</p>{" "}
        {/* This will be the error message */}
        <div>
          {/* This is the button to navigate back to previous page */}
          <button
            onClick={() => {
              window.history.back(); // go the previous page
            }}
            className="quizdetailback-button"
          >
            <svg //this is the back button design
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "8px" }}
            >
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            </svg>
            Back
          </button>
        </div>
      </div>
    );
  }

  // check for the correct answer
  const theCorrectAnswer = (question) => {
    // get the correctAnswer from the database
    const rawValue = question.correctAnswer;

    // the answer from the database it is a number but in this format "1" not 1
    if (typeof rawValue === "number" && question.answers[rawValue]) {
      return rawValue;
    }

    // converting the number from "1" to  1
    const numericValue =
      typeof rawValue === "string" ? parseInt(rawValue, 10) : rawValue;

    // the answer is like this 1 = means first is the answer, 2 = means second is the answer and it goes on
    if (numericValue > 0 && question.answers[numericValue - 1]) {
      return numericValue - 1;
    }

    return 0;
  };

  // The quiz details
  return (
    <div className="quiz-detail-container">
      {/* This is the button to navigate back to previous page */}
      <span>
        <button
          onClick={() => {
            window.history.back(); // go the previous page
          }}
          className="quizdetailback-button"
        >
          <svg //this is the back button design
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "8px" }}
          >
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
          </svg>
          Back
        </button>
      </span>
      {/* The quiz header has the title and a synopsis gotten from the database */}
      <div className="quiz-detail-header">
        <h1>{quiz.title}</h1>
        {/* the synopsis is also displayed if it is saved in the database */}
        {quiz.synopsis && (
          <p className="quiz-detail-synopsis">
            <FaInfoCircle className="info-icon" /> {quiz.synopsis}
          </p>
        )}
      </div>

      {/* The questions are displayed */}
      <div className="quiz-detail-questions-container">
        {quiz.questions?.length > 0 ? (
          // show each question in the quiz
          quiz.questions.map((question, qIndex) => {
            // show the correct answer for the question
            const correctAnswer = theCorrectAnswer(question);

            return (
              <div key={qIndex} className="quiz-detail-question-card">
                <h3 className="quiz-detail-question-title">
                  Question {qIndex + 1}: {question.questionText}
                </h3>

                {/* also show the answer options for the quiz question */}
                <ul className="quiz-detail-answers-list">
                  {question.answers?.map((answer, aIndex) => {
                    // check for the correct answer
                    const isCorrect = aIndex === correctAnswer;
                    return (
                      <li
                        key={aIndex}
                        className={`quiz-detail-answer-item ${
                          isCorrect ? "quiz-detail-correct" : ""
                        }`}
                      >
                        <div className="quiz-detail-answer-marker">
                          {isCorrect ? (
                            <FaCheck className="icon quiz-detail-correct-icon" />
                          ) : (
                            <FaTimes className="icon quiz-detail-incorrect-icon" />
                          )}
                        </div>
                        {/* The answer */}
                        <div className="quiz-detail-answer-content">
                          {answer}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* the explanation to the correctAnswer will be also displayed with the questions */}
                {question.explanation && (
                  <div className="quiz-detail-explanation-box">
                    <div className="quiz-detail-explanation-header">
                      <FaInfoCircle /> Explanation
                    </div>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // if the quizzes do not have questions
          <div className="quiz-detail-no-questions">
            This quiz do not have questions.
          </div>
        )}
      </div>
    </div>
  );
}
