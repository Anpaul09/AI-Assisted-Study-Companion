import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchResults.css';
import { FaLayerGroup, FaQuestionCircle, FaGamepad } from 'react-icons/fa';

const SearchResults = ({ results, onClose }) => {
  const navigate = useNavigate();

  const handleResultClick = (result) => {
    console.log('Full result object:', result);
    console.log('Result ID:', result.id);
    console.log('Result type:', result.type);

    if (result.type === 'flashcard') {
      navigate(`/Dashboard/flashcards/${result.id}`);
    } else if (result.type === 'quiz') {
      navigate(`/QuizHistory?highlight=${result.id}`);
    } else if (result.type === 'game') {
      navigate(result.path);
    }
    onClose();
  };

  if (results.length === 0) return null;

  return (
    <div className="search-results-dropdown">
      {results.map((result) => (
        <div 
          key={result.id} 
          className="search-result-item"
          onClick={() => handleResultClick(result)}
        >
          <div className="result-header">
            {result.type === 'flashcard' ? (
              <FaLayerGroup className="result-icon" />
            ) : result.type === 'quiz' ? (
              <FaQuestionCircle className="result-icon" />
            ) : (
              <FaGamepad className="result-icon" />
            )}
            <div className="result-title">{result.name}</div>
          </div>
          {result.type === 'flashcard' ? (
            <>
              <div className="result-description">{result.description}</div>
              <div className="result-cards-count">
                {Object.keys(result.cards || {}).length} cards
              </div>
            </>
          ) : result.type === 'quiz' ? (
            <div className="result-quiz-info">
              Score: {result.score}% • {new Date(result.timestamp).toLocaleDateString()}
            </div>
          ) : (
            <div className="result-description">{result.description}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResults; 