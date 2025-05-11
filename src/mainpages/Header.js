import React, { useContext, useState, useEffect, useRef } from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaHome,
  FaLayerGroup,
  FaLightbulb,
  FaClipboardList,
  FaStickyNote,
  FaHistory,
  FaGamepad,
  FaCalendarCheck,
  FaSignOutAlt,
  FaAngleDown,
  FaUserCog,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import ourlogopic from "./logo.png";
import { ProfilePictureNameChange } from "./ProfilePictureNameChange";
import SearchResults from "./SearchResults";
import { auth, database } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import TimerModal from "./TimerModal";

function Header() {
  const navigate = useNavigate();
  const { userData, profilePicture } = useContext(ProfilePictureNameChange);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allFlashcards, setAllFlashcards] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  
  // Timer states
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const flashcardsRef = ref(database, `users/${user.uid}/flashcard-lists`);
        const unsubscribeFlashcards = onValue(flashcardsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setAllFlashcards(Object.values(data));
          } else {
            setAllFlashcards([]);
          }
        });

        const quizzesRef = ref(database, `users/${user.uid}/quizResults`);
        const unsubscribeQuizzes = onValue(quizzesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const quizzes = Object.entries(data).map(([key, value]) => ({
              ...value,
              id: key,
            }));
            setAllQuizzes(quizzes);
          } else {
            setAllQuizzes([]);
          }
        });

        return () => {
          unsubscribeFlashcards();
          unsubscribeQuizzes();
        };
      } else {
        setAllFlashcards([]);
        setAllQuizzes([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load and initialize timer from localStorage
  useEffect(() => {
    const savedTimer = localStorage.getItem('studyTimer');
    if (savedTimer) {
      const timerData = JSON.parse(savedTimer);
      const currentTime = Date.now();
      
      if (timerData.endTime > currentTime) {
        setTimeRemaining(Math.floor((timerData.endTime - currentTime) / 1000));
        setTimerActive(true);
      } else if (timerData.active) {
        // Timer has expired while away
        setTimeRemaining(0);
        setTimerActive(false);
        localStorage.removeItem('studyTimer');
        // Optional: Show notification that timer has expired
        if (Notification.permission === 'granted') {
          new Notification('Study Timer', { body: 'Your timer has expired!' });
        }
      }
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            localStorage.removeItem('studyTimer');
            // Play sound or show notification when timer ends
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play error:', e));
            if (Notification.permission === 'granted') {
              new Notification('Study Timer', { body: 'Your timer has expired!' });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeRemaining]);

  // Start timer function
  const startTimer = (hours, minutes, seconds) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) return;
    
    setTimeRemaining(totalSeconds);
    setTimerActive(true);
    setShowTimerModal(false);
    
    // Save timer to localStorage for persistence across pages
    const endTime = Date.now() + totalSeconds * 1000;
    localStorage.setItem('studyTimer', JSON.stringify({
      endTime,
      active: true,
      duration: totalSeconds
    }));
    
    // Request notification permission if not already granted
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  // Cancel timer function
  const cancelTimer = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    setTimeRemaining(0);
    localStorage.removeItem('studyTimer');
  };

  // Format time for display
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const games = [
    {
      id: "category-sorting",
      name: "Category Sorting",
      type: "game",
      description: "Sort items into their correct categories",
      path: "/CategorySortingGame",
    },
    {
      id: "country-flags",
      name: "Guess the Country Flag",
      type: "game",
      description: "Test your knowledge of country flags",
      path: "/Country",
    },
    {
      id: "crossword",
      name: "CrossWord Puzzle",
      type: "game",
      description: "Classic crossword puzzle game",
      path: "/CrossWord",
    },
    {
      id: "uno",
      name: "UNO",
      type: "game",
      description: "Play the classic UNO card game",
      path: "/UNO",
    },
  ];

  // Navigation items configuration
  const navigationItems = [
    {
      id: "dashboard",
      icon: <FaHome className="nav-icon" />,
      label: "Dashboard",
      path: "/Dashboard",
      standalone: true,
    },
    {
      id: "flashcards",
      icon: <FaLayerGroup className="nav-icon" />,
      label: "Flashcards",
      path: "/Dashboard/flashcards",
      standalone: true,
    },
    {
      id: "quiz",
      icon: <FaClipboardList className="nav-icon" />,
      label: "Quiz",
      dropdown: [
        {
          icon: <FaClipboardList className="dropdown-icon" />,
          label: "Quizzes",
          path: "/Quizzes",
        },
        {
          icon: <FaStickyNote className="dropdown-icon" />,
          label: "Notes",
          path: "/Notes",
        },
        {
          icon: <FaHistory className="dropdown-icon" />,
          label: "Quiz History",
          path: "/QuizHistory",
        },
      ],
    },
    {
      id: "summarizer",
      icon: <FaLightbulb className="nav-icon" />,
      label: "Summarizer",
      path: "/Dashboard/summarizer",
      standalone: true,
    },
    {
      id: "game",
      icon: <FaGamepad className="nav-icon" />,
      label: "Game",
      path: "/Games",
      standalone: true,
    },
    {
      id: "planner",
      icon: <FaCalendarCheck className="nav-icon" />,
      label: "Study Planner",
      path: "/StudyPlanner",
      standalone: true,
    },
    {
      id: "timer",
      icon: <FaClock className="nav-icon" />,
      label: "Timer",
      action: () => setShowTimerModal(true),
      standalone: true,
    },
  ];

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filteredFlashcards = allFlashcards
      .map((list) => ({
        ...list,
        type: "flashcard",
      }))
      .filter(
        (list) =>
          list.name.toLowerCase().includes(term) ||
          (list.description && list.description.toLowerCase().includes(term))
      );

    const filteredQuizzes = allQuizzes
      .filter((quiz) => (quiz.quizTitle || "").toLowerCase().includes(term))
      .map((quiz) => ({
        ...quiz,
        type: "quiz",
        name: quiz.quizTitle || "Untitled Quiz",
      }));

    const filteredGames = games.filter(
      (game) =>
        game.name.toLowerCase().includes(term) ||
        game.description.toLowerCase().includes(term)
    );

    // Combine and sort results
    const combinedResults = [
      ...filteredFlashcards,
      ...filteredQuizzes,
      ...filteredGames,
    ].sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });

    setSearchResults(combinedResults);
    setShowResults(true);
  };

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const navigateToSettings = () => {
    navigate("/Settings");
    setActiveDropdown(null);
  };

  const navigateToLogout = () => {
    navigate("/Logout");
    setActiveDropdown(null);
  };

  return (
    <div ref={dropdownContainerRef}>
      <header className="headerdashboard-header">
        <div className="headerdashboard-ourlogoourName">
          <div className="headerdashboard-ourlogo">
            <img src={ourlogopic} alt="logo" />
          </div>
          <div className="headerdashboard-ourName">
            <button
              className="headerdashboard-ourName_button"
              onClick={() => navigate("/Dashboard")}
            >
              AI-assisted Study Companion
            </button>
          </div>
        </div>

        <div className="navigation-menu">
          {navigationItems.map((item) => (
            <div key={item.id} className="nav-item-container">
              {item.standalone ? (
                <button
                  className="nav-item"
                  onClick={item.action ? item.action : () => navigate(item.path)}
                >
                  {item.icon}
                  <span className="nav-label">{item.label}</span>
                  {item.id === "timer" && timerActive && (
                    <span className="timer-display">{formatTime(timeRemaining)}</span>
                  )}
                </button>
              ) : (
                <div className="dropdown-container">
                  <button
                    className={`nav-item ${
                      activeDropdown === item.id ? "active" : ""
                    }`}
                    onClick={() => toggleDropdown(item.id)}
                  >
                    {item.icon}
                    <span className="nav-label">{item.label}</span>
                    <FaAngleDown
                      className={`dropdown-arrow ${
                        activeDropdown === item.id ? "rotated" : ""
                      }`}
                    />
                  </button>
                  {activeDropdown === item.id && item.dropdown && (
                    <div className="dropdown-menu">
                      {item.dropdown.map((dropItem, idx) => (
                        <button
                          key={idx}
                          className="dropdown-item"
                          onClick={() => {
                            navigate(dropItem.path);
                            setActiveDropdown(null);
                          }}
                        >
                          {dropItem.icon}
                          <span>{dropItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="header-right">
          {timerActive && (
            <div className="active-timer">
              <span className="timer-countdown">{formatTime(timeRemaining)}</span>
              <button className="cancel-timer-btn" onClick={cancelTimer}>
                <FaTimes />
              </button>
            </div>
          )}
          
          <div className="mainHeaderSearchBar" ref={searchRef}>
            <input
              type="text"
              className="mainHeaderSearch"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => setShowResults(true)}
            />
            <FaSearch className="mainHeaderSearchicon" size={16} />
            {showResults && (
              <SearchResults
                results={searchResults}
                onClose={() => setShowResults(false)}
              />
            )}
          </div>

          <div className="profile-container">
            <div
              className="profilePictureMain"
              onClick={() => toggleDropdown("profile")}
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div className="profile-initial">
                  {getInitials(userData?.name || "")}
                </div>
              )}
            </div>

            {activeDropdown === "profile" && (
              <div className="profile-dropdown">
                <button
                  className="dropdown-item"
                  onClick={navigateToSettings}
                >
                  <FaUserCog className="dropdown-icon" />
                  <span>Settings</span>
                </button>
                <button
                  className="dropdown-item logout"
                  onClick={navigateToLogout}
                >
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {showTimerModal && (
        <TimerModal 
          onClose={() => setShowTimerModal(false)}
          onStartTimer={startTimer}
        />
      )}
    </div>
  );
}

export default Header;