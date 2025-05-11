import Signup from './LoginHome/Signup';
import Home from './LoginHome/Home';
import Header from "./mainpages/Header";
import Settings from "./mainpages/Settings";
import Logout from "./mainpages/Logout";
import Dashboard from "./mainpages/Dashboard";
import Sidebar from "./mainpages/Sidebar";
import Quizzes from "./mainpages/Quizzes";
import ForgotPassword from "./LoginHome/ForgotPassword";
import Flashcards from "./mainpages/Flashcards";
import QuizHistory from "./mainpages/QuizHistory";
import Notes from "./mainpages/Notes";
import {ProfilepicNameChange}  from "./mainpages/ProfilePictureNameChange";
import Open from "./Open";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ThankYou from "./LoginHome/ThankYou";
import { auth } from './config/firebase';
import Footer from './LoginHome/Footer'; 
import Games from "./mainpages/Games";
import CategorySortingGame from "./games/CategorySortingGame";
import VocabQuiz from "./games/VocabQuiz";
import CountryGame from "./games/Country";
import AIFlashcards from "./mainpages/AIFlashcards";
import CreateFlashcards from "./mainpages/CreateFlashcards";
import ViewFlashcards from "./mainpages/ViewFlashcards";
import StudyPlanner from "./mainpages/StudyPlanner/StudyPlanner"; // Import the StudyPlanner component
import QuizDetails from "./mainpages/QuizDetails";
import PrivateRoute from "./components/PrivateRoute";
import Favorites from "./mainpages/Favorites";
import FactGame from "./games/FactGame";
import Summarizer from "./mainpages/Summarizer";
import FlashcardDetails from "./mainpages/FlashcardsDetails";


function App() {

  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await user.reload(); 
        setUserName(user.displayName || "User");
        setProfilePicture(user.photoURL || null);
        setCurrentUser(user);
        console.log("User logged in:", user.displayName);
      } else {
        setUserName('');
        setProfilePicture(null);
        setCurrentUser(null);
        console.log("No user logged in");
      }
    });
  
    return () => unsubscribe();
  }, []);

  // Function to handle schedule generation
  const handleGenerateSchedule = (syllabus, examDates, preferences) => {
    console.log("Generating schedule with:", syllabus, examDates, preferences);
    // Call the OpenAI API to generate a schedule
  };

  return (
    <Router>
      <ProfilepicNameChange>
        <ConditionalHeader />
        <div>
          {/* <div
          className={`app-container ${
            sidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
        > */}
          {/* <ConditionalSidebar
            setSidebarOpen={setSidebarOpen}
            userName={userName}
            onGenerateSchedule={handleGenerateSchedule} // Pass the function to Sidebar
          /> */}
          <div className="content">
            <Routes>
              <Route path="/Signup" element={<Signup />} />
              <Route path="/Home" element={<Home />} />
              <Route path="/ThankYou" element={<ThankYou />} />
              <Route
                path="/Settings"
                element={<Settings currentUser={currentUser} />}
              />
              <Route path="/Logout" element={<Logout />} />
              <Route path="/Open" element={<Open />} />
              {/* <Route
                path="/Dashboard"
                element={
                  <Dashboard
                    currentUser={currentUser}
                    setSidebarOpen={setSidebarOpen}
                  />
                }
              /> */}
              <Route
                path="/Dashboard/flashcards"
                element={<Flashcards currentUser={currentUser} />}
              />
              <Route
                path="/Dashboard/createflashcards"
                element={<CreateFlashcards currentUser={currentUser} />}
              />
              <Route
                path="/Dashboard/createflashcards/:listId"
                element={<CreateFlashcards currentUser={currentUser} />}
              />
              <Route
                path="/Dashboard/aiflashcards"
                element={<AIFlashcards currentUser={currentUser} />}
              />
              <Route
                path="/Dashboard/flashcards/:listId"
                element={<ViewFlashcards currentUser={currentUser} />}
              />
              <Route path="/Dashboard/summarizer" element={<Summarizer />} />
              <Route
                path="/Quizzes"
                element={<Quizzes currentUser={currentUser} />}
              />

              <Route
                path="/quizzes/:quizId?"
                element={<Quizzes currentUser={currentUser} />}
              />
              <Route path="/VocabQuiz" element={<VocabQuiz />} />
              <Route path="/ForgotPassword" element={<ForgotPassword />} />
              <Route path="/" element={<Home />} />
              <Route path="/Games" element={<Games />} />
              <Route
                path="/CategorySortingGame"
                element={<CategorySortingGame currentUser={currentUser} />}
              />
              <Route path="/Country" element={<CountryGame />} />
              <Route
                path="/CrossWord"
                element={<div>CrossWord Puzzle Coming Soon</div>}
              />
              <Route path="/FactGame" element={<FactGame />} />
              <Route
                path="/QuizHistory"
                element={<QuizHistory currentUser={currentUser} />}
              />
              <Route
                path="/Notes"
                element={<Notes currentUser={currentUser} />}
              />
              <Route
                path="/StudyPlanner"
                element={
                  currentUser ? (
                    <StudyPlanner userId={currentUser.uid} />
                  ) : (
                    <div>Please log in to use the Study Planner.</div>
                  )
                }
              />
              <Route
                path="/favorites"
                element={
                  <PrivateRoute currentUser={currentUser}>
                    <Favorites currentUser={currentUser} />
                  </PrivateRoute>
                }
              />
              <Route path="/quizzesdetails/:id" element={<QuizDetails />} />
              <Route
                path="/flashcardsdetails/:id"
                element={<FlashcardDetails />}
              />
            </Routes>
          </div>
          <ConditionalFooter />
        </div>
      </ProfilepicNameChange>
    </Router>
  );
}

// Conditional rendering of the header based on location
function ConditionalHeader() {
  const location = useLocation();
  const dontShow = [
    "/Signup",
    "/Logout",
    "/Home",
    "/ThankYou",
    "/ForgotPassword",
    "/signup",
  ];
  return !dontShow.includes(location.pathname) ? <Header /> : null;
}

// // Conditional rendering of the sidebar based on location
// function ConditionalSidebar({ setSidebarOpen, userName, onGenerateSchedule }) {
//   const location = useLocation();
//   const showSidebarPaths = [
//     "/Dashboard",
//     "/Games",
//     "/CategorySortingGame",
//     "/Country",
//     "/CrossWord",
//     "/UNO",
//     "/QuizHistory",
//     "/Quizzes",
//     "/Notes",
//     "/StudyPlanner",
//     "/Dashboard/summarizer",
//     "/Dashboard/flashcards",
//     "/Dashboard/createflashcards",
//     "/Dashboard/aiflashcards",
//     "/quizzes",
//     "/Settings",
//     "/PaymentHistory",
//   ];

  // Also add a check for dynamic routes
  // const shouldShowSidebar = 
  //   showSidebarPaths.includes(location.pathname) || 
  //   location.pathname.startsWith('/Dashboard/flashcards/') ||  
  //   location.pathname.startsWith('/quizzes/');  

  // return shouldShowSidebar ? (
  //   <Sidebar 
  //     setSidebarOpen={setSidebarOpen} 
  //     userName={userName} 
  //     onGenerateSchedule={onGenerateSchedule}
  //   />
  // ) : null;
//}

// Conditional rendering of the footer based on location
function ConditionalFooter() {
  const location = useLocation();
  const dontShow = [
    "/Signup",
    "/Logout",
    "/ForgotPassword",
    "/Country",
    "/Games",
    "/Dashboard",
    "/ThankYou",
    "/Quizzes",
    "/Dashboard/summarizer",
    "/Dashboard/flashcards",
    "/Dashboard/aiflashcards",
    "/Notes",
    "/StudyPlanner",
    "/QuizHistory",
    "/Dashboard/flashcards/",
    "/CategorySortingGame",
    "/Dashboard/createflashcards",
    "/Favorites",
    "/FactGame",
    "/VocabQuiz",
  ];
  return !dontShow.includes(location.pathname) ? <Footer /> : null;
}

export default App;





