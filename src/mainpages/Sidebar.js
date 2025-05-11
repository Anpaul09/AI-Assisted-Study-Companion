// //Modified by Aniruddah for Study Planner

// import React, { useState } from "react";
// import { FaBars, FaBell, FaBook, FaPoll, FaCog, FaSignOutAlt, FaStickyNote, FaHistory, FaGamepad, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
// import "./Sidebar.css";
// import { useNavigate } from "react-router-dom";

// function Sidebar({ userName, onGenerateSchedule }) {
//   const moves = useNavigate();
//   const [sideBarisOpen, setSideBarisOpen] = useState(false); // Start collapsed

//   const switchSidebar = () => {
//     setSideBarisOpen(!sideBarisOpen); // Toggle open/close
//   };

//   const navigationItems = [
//     {
//       name: "Summarizer",
//       icon: <FaFileAlt />,
//       path: "/Dashboard/summarizer"
//     },
//   ];

//   return (
//     <div className={`sideBarMain ${sideBarisOpen ? "open" : "close"}`}>
//       <div className={`sideBar ${sideBarisOpen ? "open" : "close"}`}>
//         <button className="switchButton" onClick={switchSidebar}>
//           <FaBars />
//         </button>
//         {sideBarisOpen && (
//           <ul className="allSideBarfunctionality">
//             <li className="sideBarfunctionality user-name">
//               <span>{userName ? `Hello, ${userName}` : "Welcome!"}</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/Dashboard")}>
//               <FaBook className="sideBarfunctionalityIcon" />
//               <span>Dashboard</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/Dashboard/flashcards")}>
//               <FaBook className="sideBarfunctionalityIcon" />
//               <span>Flashcards</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/Dashboard/summarizer")}>
//               <FaFileAlt className="sideBarfunctionalityIcon" />
//               <span>Summarizer</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/Quizzes")}>
//               <FaPoll className="sideBarfunctionalityIcon" />
//               <span>Quizzes</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/Notes")}>
//               <FaStickyNote className="sideBarfunctionalityIcon" />
//               <span>Notes</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/QuizHistory")}>
//               <FaHistory className="sideBarfunctionalityIcon" />
//               <span>Quiz History</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/Games")}>
//               <FaGamepad className="sideBarfunctionalityIcon" />
//               <span>Game</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/StudyPlanner")}>
//               <FaCalendarAlt className="sideBarfunctionalityIcon" />
//               <span>Study Planner</span>
//             </li>
//             <li className="sideBarfunctionality" onClick={() => moves("/Settings")}>
//               <FaCog className="sideBarfunctionalityIcon" />
//               <span>Settings</span>
//             </li>
//             <li className="sideBarfunctionality logout" onClick={() => moves("/Logout")}>
//               <FaSignOutAlt className="sideBarfunctionalityIcon" />
//               <span>Logout</span>
//             </li>
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Sidebar;









//Modified by Aniruddah for Study Planner

import React, { useState } from "react";
import { FaBars, FaBell, FaBook, FaPoll, FaCog, FaSignOutAlt, FaStickyNote, FaHistory, FaGamepad, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

function Sidebar({ userName, onGenerateSchedule }) {
  const moves = useNavigate();
  const [sideBarisOpen, setSideBarisOpen] = useState(false); // Start collapsed

  const switchSidebar = () => {
    setSideBarisOpen(!sideBarisOpen); // Toggle open/close
  };

  const navigationItems = [
    {
      name: "Summarizer",
      icon: <FaFileAlt />,
      path: "/Dashboard/summarizer"
    },
  ];

  return (
    <div className={`sideBarMain ${sideBarisOpen ? "open" : "close"}`}>
      <div className={`sideBar ${sideBarisOpen ? "open" : "close"}`}>
        <button className="switchButton" onClick={switchSidebar}>
          <FaBars />
        </button>
        {sideBarisOpen && (
          <ul className="allSideBarfunctionality">
            <li className="sideBarfunctionality user-name">
              <span>{userName ? `Hello, ${userName}` : "Welcome!"}</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/Dashboard")}>
              <FaBook className="sideBarfunctionalityIcon" />
              <span>Dashboard</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/Dashboard/flashcards")}>
              <FaBook className="sideBarfunctionalityIcon" />
              <span>Flashcards</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/Dashboard/summarizer")}>
              <FaFileAlt className="sideBarfunctionalityIcon" />
              <span>Summarizer</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/Quizzes")}>
              <FaPoll className="sideBarfunctionalityIcon" />
              <span>Quizzes</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/Notes")}>
              <FaStickyNote className="sideBarfunctionalityIcon" />
              <span>Notes</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/QuizHistory")}>
              <FaHistory className="sideBarfunctionalityIcon" />
              <span>Quiz History</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/Games")}>
              <FaGamepad className="sideBarfunctionalityIcon" />
              <span>Game</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/StudyPlanner")}>
              <FaCalendarAlt className="sideBarfunctionalityIcon" />
              <span>Study Planner</span>
            </li>
            <li className="sideBarfunctionality" onClick={() => moves("/Settings")}>
              <FaCog className="sideBarfunctionalityIcon" />
              <span>Settings</span>
            </li>
            <li className="sideBarfunctionality logout" onClick={() => moves("/Logout")}>
              <FaSignOutAlt className="sideBarfunctionalityIcon" />
              <span>Logout</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Sidebar;