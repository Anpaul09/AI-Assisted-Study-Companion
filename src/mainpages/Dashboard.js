







///new dashboard 




import React, { useEffect, useState } from "react";
import "./Dashboard.css"; // Import the updated CSS
import CrossWordImage from "./crosswordPuzzle.jpg";
import CountryFlagImage from "./worldmap.jpg";
import CategorySortingImage from "./sortinggame.jpg";
import TrueFalseImage from "./factORFiction.jpg";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaPoll,
  FaStickyNote,
  FaEye,
  FaCrown,
  FaChartLine,
  FaCalendarAlt,
  FaPlus,
  FaTrophy,
  FaFire,
  FaStar,
  FaGamepad,
  FaHistory,
  FaClock,
  FaUser,
  FaBullseye,
} from "react-icons/fa";
import {
  getDatabase,
  ref,
  get,
  set,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { database } from "../config/firebase";
import { v4 as uuidv4 } from "uuid";

function Dashboard() {
  const navigate = useNavigate();
  const [popularQuizzes, setPopularQuizzes] = useState([]);
  const [popularFlashcards, setPopularFlashcards] = useState([]);
  const [recentUserQuizzes, setRecentUserQuizzes] = useState([]);
  const [recentUserFlashcards, setRecentUserFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [dynamicGreeting, setDynamicGreeting] = useState("");
  const [dynamicMessage, setDynamicMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  const motivationalMessages = [
    "Knowledge is power! Let's unlock your potential.",
    "Every question you answer brings you closer to mastery!",
    "You're doing amazing! Keep up the great work!",
    "Progress, not perfection. Every step counts!",
    "Your brain is a muscle - keep exercising it!",
    "Take a deep breath. You've got this!",
    "Celebrate every small victory along the way!",
    "Learning is a journey. Enjoy the process!",
  ];

  const getTimeBasedMessages = () => {
    const hour = new Date().getHours();
    const messages = [...motivationalMessages];

    if (hour >= 1 && hour < 5) {
      messages.push(
        "It's late! Remember to rest when you need to.",
        "Quality learning requires quality rest!",
        "Your health is important - consider taking a break soon."
      );
    } else if (hour >= 5 && hour < 12) {
      messages.unshift(
        "Good morning! Fresh start for new achievements!",
        "Rise and shine! Perfect time to learn something new!"
      );
    } else if (hour >= 12 && hour < 17) {
      messages.unshift(
        "Afternoon power! Let's conquer those challenges!",
        "You're in the zone! Keep that momentum going!"
      );
    } else {
      messages.unshift(
        "Evening dedication! Proud of your commitment!",
        "Great work today! Finish strong!"
      );
    }
    return messages;
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Late night studies? Remember to rest";
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchPopularQuizzes();
        fetchPopularFlashcards();
        fetchRecentUserQuizzes(user.uid);
        fetchRecentUserFlashcards(user.uid);
        fetchLeaderboardData();
        setDynamicGreeting(getTimeBasedGreeting());
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const messages = getTimeBasedMessages();
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messages = getTimeBasedMessages();
    setDynamicMessage(messages[messageIndex]);
  }, [messageIndex]);

  const fetchPopularQuizzes = async () => {
    try {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const twoWeeksAgoTimestamp = twoWeeksAgo.getTime();

      const dbRef = ref(database, "quizzes");
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const quizzesData = snapshot.val();
        const quizzesArray = Object.keys(quizzesData).map((key) => ({
          id: key,
          ...quizzesData[key],
        }));
        const recentQuizzes = quizzesArray.filter((quiz) => {
          const createdAt = quiz.createdAt ? new Date(quiz.createdAt).getTime() : 0;
          return createdAt >= twoWeeksAgoTimestamp;
        });
        const sortedQuizzes = recentQuizzes
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 5);
        setPopularQuizzes(sortedQuizzes);
      } else {
        setPopularQuizzes([]);
      }
    } catch (error) {
      setError("Error fetching popular quizzes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularFlashcards = async () => {
    try {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const twoWeeksAgoTimestamp = twoWeeksAgo.getTime();

      const dbRef = ref(database, "flashcards");
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const flashcardsData = snapshot.val();
        const flashcardsArray = Object.keys(flashcardsData).map((key) => ({
          id: key,
          ...flashcardsData[key],
        }));
        const recentFlashcards = flashcardsArray.filter((flashcard) => {
          const createdAt = flashcard.createdAt ? new Date(flashcard.createdAt).getTime() : 0;
          return createdAt >= twoWeeksAgoTimestamp;
        });
        const sortedFlashcards = recentFlashcards
          .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 5);
        setPopularFlashcards(sortedFlashcards);
      } else {
        setPopularFlashcards([]);
      }
    } catch (error) {
      setError("Error fetching popular flashcards.");
    }
  };

  const fetchRecentUserQuizzes = async (userId) => {
    try {
      const userResultsRef = query(
        ref(database, `users/${userId}/quizResults`),
        orderByChild("timestamp"),
        limitToLast(5)
      );
      const snapshot = await get(userResultsRef);
      if (snapshot.exists()) {
        const resultsData = snapshot.val();
        const quizzesArray = Object.keys(resultsData)
          .map((key) => ({
            id: key,
            ...resultsData[key],
            createdAt: resultsData[key].timestamp,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        quizzesArray.forEach((quiz) => {
          if (quiz.questions) {
            quiz.questions = quiz.questions.map((q) => {
              const answers = q.answers || q.allAnswers || [];
              let correctIndex = 1;
              if (answers.length) {
                const idx = answers.indexOf(q.correctAnswer);
                correctIndex = idx !== -1 ? idx + 1 : 1;
              }
              return { ...q, answers, correctAnswer: correctIndex.toString() };
            });
          }
        });
        setRecentUserQuizzes(quizzesArray);
      } else {
        setRecentUserQuizzes([]);
      }
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
      setRecentUserQuizzes([]);
    }
  };

  const fetchRecentUserFlashcards = async (userId) => {
    try {
      const userFlashcardsRef = query(
        ref(database, `users/${userId}/flashcard-lists`),
        orderByChild("createdAt"),
        limitToLast(5)
      );
      const snapshot = await get(userFlashcardsRef);
      if (snapshot.exists()) {
        const flashcardsData = snapshot.val();
        const flashcardsArray = Object.keys(flashcardsData)
          .map((key) => ({
            id: key,
            ...flashcardsData[key],
          }))
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        setRecentUserFlashcards(flashcardsArray);
      } else {
        setRecentUserFlashcards([]);
      }
    } catch (error) {
      console.error("Error fetching user flashcards:", error);
      setRecentUserFlashcards([]);
    }
  };

  const fetchLeaderboardData = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;
  
    try {
      const usersRef = ref(database, "users");
      const quizzesRef = ref(database, "quizzes");
      const [usersSnapshot, quizzesSnapshot] = await Promise.all([
        get(usersRef),
        get(quizzesRef),
      ]);
  
      if (usersSnapshot.exists() && quizzesSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        const quizzesData = quizzesSnapshot.val();
  
        // Count public quizzes per user
        const publicQuizCounts = {};
        Object.values(quizzesData).forEach((quiz) => {
          if (quiz.public) {
            publicQuizCounts[quiz.createdBy] = (publicQuizCounts[quiz.createdBy] || 0) + 1;
          }
        });
  
        // Calculate accuracy per user
        const userAccuracy = {};
        Object.entries(usersData).forEach(([userId, userData]) => {
          let totalCorrect = 0;
          let totalQuestions = 0;
        
          if (userData.quizResults) {
            Object.values(userData.quizResults).forEach(r => {
              totalCorrect   += r.correctAnswers  || 0;
              totalQuestions += r.totalQuestions  || 0;
            });
          }
          else if (userData.stats) {
            totalCorrect   = userData.stats.totalCorrectAnswers || 0;
            totalQuestions = userData.stats.totalQuestionsAnswered || 0;
          }
        
          if (totalQuestions > 0) {
            userAccuracy[userId] = { totalCorrect, totalQuestions };
          }
        });
  
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentQuizzes = Object.entries(quizzesData)
          .filter(([_, quiz]) => quiz.createdAt && new Date(quiz.createdAt) > sevenDaysAgo)
          .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
          .slice(0, 3);

          const accuracyList = Object.entries(userAccuracy)
          .map(([uid, { totalCorrect, totalQuestions }]) => ({
            id: uid,
            // prefer the new displayName, fall back to the legacy name, then uid
            name: usersData[uid]?.displayName || usersData[uid]?.name || uid,
            ratio: totalCorrect / totalQuestions,
            value: (totalCorrect / totalQuestions * 100).toFixed(1),
            secondaryValue: `(${totalCorrect}/${totalQuestions})`
          }))
          .sort((a, b) => b.ratio - a.ratio);
        
  const top3 = accuracyList.slice(0, 3);

// if current user isn’t in top3 but has a result, append them
const me = accuracyList.find(entry => entry.id === currentUser.uid);
if (me && !top3.some(entry => entry.id === currentUser.uid)) {
  top3.push(me);
}
  
        const leaderboardDataArray = [
          {
            id: 1,
            title: "Most Shared Quizzes",
            icon: <FaCrown size={20} />,
            items: Object.entries(publicQuizCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([userId, count]) => {
                const userQuiz = Object.values(quizzesData).find(
                  (q) => q.createdBy === userId
                );
                return {
                  id: userId,
                  name: userQuiz?.creatorName || (usersData[userId]?.displayName || "Quiz Master"),
                  value: count,
                };
              }),
            metric: "quizzes",
            isCount: true,
          },
          {
            id: 2,
            title: "Recent Quizzes",
            icon: <FaCalendarAlt size={20} />,
            items: recentQuizzes.map(([quizId, quiz]) => ({
              id: quizId,
              name: quiz.quizTitle,
              value: new Date(quiz.createdAt).toLocaleDateString(),
            })),
            isDate: true,
          },
          {
            id: 3,
            title: "Highest Accuracy",
            icon: <FaBullseye size={20} />,
            items: top3.map(({ id, name, value, secondaryValue }) => ({
              id,
              name,
              value,
              secondaryValue
            })),
            metric: "%",
            isPercentage: true,
          },
          {
            id: 4,
            title: "Your Stats",
            icon: <FaUser size={20} />,
            items: (() => {
              let personalQuizCount = 0;
              let personalAccuracy = "0";
              const you = usersData[currentUser.uid];
              if (you) {
                const yourResults = you.quizResults ? Object.values(you.quizResults) : [];
                const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                const recent = yourResults.filter(r => new Date(r.timestamp) >= twoWeeksAgo);
                personalQuizCount = recent.length;
                let correct = 0, total = 0;
                yourResults.forEach(r => {
                  correct += r.correctAnswers || 0;
                  total += r.totalQuestions || 0;
                });
                if (total > 0) personalAccuracy = ((correct / total) * 100).toFixed(1);
              }
              return [
                { id: "completed", name: "Quizzes Completed (Past 2 Weeks)", value: personalQuizCount },
                { id: "accuracy", name: "Avg Accuracy", value: personalAccuracy, metric: "%" },
              ];
            })(),
          },
        ];
  
        setLeaderboardData(leaderboardDataArray);
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  };
  

  const handleQuizClick = (quiz) => {
    // Navigate to the quiz details page instead of the plain quiz page.
    navigate(`/quizzesdetails/${quiz.id}`, { state: { quiz } });
  };

  const handleFlashcardClick = (flashcard) => {
    navigate(`/Dashboard/flashcards/${flashcard.id}`, { state: { flashcard } });
  };

  const games = [
    // { name: "CrossWord Puzzle", image: CrossWordImage, path: "/CrossWord" },
    { 
      name: "Vocab Quiz", 
      image: require("../mainpages/vocabulary.png"),  // Direct path to image
       path: "/VocabQuiz" 
    },

    { name: "Guess the Country Flag", image: CountryFlagImage, path: "/Country" },
    { name: "Category Sorting", image: CategorySortingImage, path: "/CategorySortingGame" },
    { name: "Fact or Caps", image: TrueFalseImage, path: "/FactGame" },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{dynamicGreeting}, {user?.displayName || "Learner"}!</h1>
        <p className="dynamic-message">{dynamicMessage}</p>
      </div>

      <div className="dashboard-top-section">
        <div className="leaderboard-container">
          {leaderboardData.map((category) => (
            <div key={category.id} className="leaderboard-category">
              <div className="category-header">
                <div className="category-icon">{category.icon}</div>
                <h4>{category.title}</h4>
              </div>
              <div className="top-users">
                {category.items.length > 0 ? (
                  category.items.map((item, index) => (
                    <div key={item.id} className="user-row">
                      <span className="user-rank">
                        {index === 0 ? (
                          <FaTrophy className="gold" />
                        ) : index === 1 ? (
                          <FaTrophy className="silver" />
                        ) : index === 2 ? (
                          <FaTrophy className="bronze" />
                        ) : (
                          `${index + 1}.`
                        )}
                      </span>
                      {category.isPercentage ? (
                        <>
                          <span className="dashboarduser-name">
                            {item.name}
                            {item.secondaryValue && <small> {item.secondaryValue}</small>}
                          </span>
                          <span className="user-metric">
                            {item.value}{category.metric}
                          </span>
                        </>
                      ) : category.isDate ? (
                        <>
                          <span className="dashboarduser-name">{item.name}</span>
                          <span className="user-metric">{item.value}</span>
                        </>
                      ) : (
                        <>
                          <span className="dashboarduser-name">{item.name}</span>
                          <span className="user-metric">
                            {item.value} {category.metric}
                          </span>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-data">No data available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-bottom-section">
        {/* Recent Quizzes Section */}
        <div className="recent-quizzes-section">
          <div className="section-header">
            <h3>
              <FaHistory className="section-icon" /> Recently Completed Quizzes
            </h3>
            <button
              className="add-quiz-button"
              onClick={() => navigate("/Quizzes")}
              aria-label="Create new quiz"
            >
              <FaPlus style={{ color: "white", fontSize: "14px" }} />
            </button>
          </div>
          <div className="quizzes-grid scrollable">
            {recentUserQuizzes.length > 0 ? (
              recentUserQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="quiz-card"
                  onClick={() =>
                    navigate(`/quizzesdetails/${quiz.id}`, {
                      state: {
                        quiz: {
                          id: quiz.id,
                          title: quiz.quizTitle,
                          synopsis: quiz.quizSynopsis,
                          questions: quiz.questions?.map((q) => ({
                            questionText: q.question,
                            answers: q.answers,
                            correctAnswer: parseInt(q.correctAnswer) - 1,
                            explanation: q.explanation,
                          })) || [],
                        },
                      },
                    })
                  }
                >
                  <div className="card-badge">View Quiz Details</div>
                  <h4>{quiz.quizTitle}</h4>
                  <p>{quiz.quizSynopsis}</p>
                  <div className="card-footer">
                    <span className="card-stats">
                      <FaClock /> {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>You haven't created any quizzes yet. Create your first quiz!</p>
                <button onClick={() => navigate("/Quizzes")}>Create Quiz</button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Flashcards Section */}
        <div className="recent-flashcards-section">
          <div className="section-header">
            <h3>
              <FaUser className="section-icon" /> Your Recent Flashcards
            </h3>
            <button
              className="add-flashcard-button"
              onClick={() => navigate("/Dashboard/flashcards")}
              aria-label="Create new flashcard set"
            >
              <FaPlus style={{ color: "white", fontSize: "14px" }} />
            </button>
          </div>
          <div className="flashcards-grid scrollable">
            {recentUserFlashcards.length > 0 ? (
              recentUserFlashcards.map((flashcard) => (
                <div
                  key={flashcard.id}
                  className="flashcard-card"
                  onClick={() => handleFlashcardClick(flashcard)}
                >
                  <div className="card-badge">Your Set</div>
                  <h4>{flashcard.name}</h4>
                  <p>{flashcard.description}</p>
                  <div className="card-footer">
                    <span className="card-stats">
                      <FaClock /> {new Date(flashcard.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>You haven't created any flashcard sets yet. Create your first set!</p>
                <button onClick={() => navigate("/Dashboard/flashcards")}>
                  Create Flashcards
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="games-section">
          <h3>
            <FaGamepad className="section-icon" /> Games
          </h3>
          <div className="games-grid">
            {games.map((game, index) => (
              <div
                key={index}
                className="game-card"
                onClick={() => navigate(game.path)}
              >
                <div className="game-image-container">
                  <img src={game.image} alt={game.name} className="game-image" />
                  <div className="game-overlay">
                    <button className="play-button">Play Now</button>
                  </div>
                </div>
                <h4>{game.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
