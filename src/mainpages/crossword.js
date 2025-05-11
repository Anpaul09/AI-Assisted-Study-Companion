import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Crossword from '@jaredreisinger/react-crossword';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import "./crossword.css";

const Cross = () => {
  const { crosswordId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [crosswordData, setCrosswordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const crosswordRef = useRef();
  const API_KEY = 'Your OpenAI API Key'; // Replace with your actual API key

  useEffect(() => {
    const loadSharedCrossword = async () => {
      if (crosswordId) {
        try {
          const crosswordRef = ref(database, `crosswords/${crosswordId}`);
          const snapshot = await get(crosswordRef);
          if (snapshot.exists()) {
            setCrosswordData(snapshot.val());
          } else {
            navigate('/crosswords', { replace: true });
          }
        } catch (error) {
          console.error('Error loading crossword:', error);
          navigate('/crosswords', { replace: true });
        }
      }
    };
    loadSharedCrossword();
  }, [crosswordId, navigate]);

  const extractJSON = (text) => {
    try {
      const jsonString = text.match(/\{[\s\S]*\}/)[0];
      return JSON.parse(jsonString);
    } catch (e) {
      return null;
    }
  };

  const generateCrossword = async () => {
    setLoading(true);
    setError(null);
    const prompt = `Generate a valid 10x10 crossword puzzle JSON structure based on: ${input}. Follow STRICTLY:
    1. 10x10 grid with standard crossword symmetry
    2. Include black squares (blocked cells) to separate words
    3. Answers must be uppercase, 3-8 letters long
    4. Clues must be concise and relate directly to input
    5. Words must intersect at common letters
    6. No two words should be adjacent without intersecting
    7. Use traditional crossword numbering pattern
    8. Maintain 180-degree rotational symmetry for black squares
    9. Include 6-10 across clues and 6-10 down clues
    10. Use this exact format:
    {
      "across": {
        "1": {"clue": "Clue text", "answer": "ANSWER", "row": 10, "col": 10},
        "5": {"clue": "Clue text", "answer": "WORD", "row": 10, "col": 10}
      },
      "down": {
        "2": {"clue": "Clue text", "answer": "TEST", "row": 10, "col": 10},
        "6": {"clue": "Clue text", "answer": "GRID", "row": 10, "col": 10}
      }
    }
    Ensure numbering follows standard crossword conventions:
- Numbers appear only in the top-left cell of each word.
- A number should not be repeated unless the across and down word start in the same cell.
- Avoid placing numbers in the middle of words.
- Maintain a clear layout where words do not overlap incorrectly.
`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2024-07-18',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      
      const data = await res.json();
      const responseText = data.choices[0].message.content;
      const crossword = extractJSON(responseText);
      
      if (!crossword?.across || !crossword?.down) {
        throw new Error('Invalid crossword format. Please try again.');
      }

      setCrosswordData(crossword);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate. Check your input.');
    } finally {
      setLoading(false);
    }
  };

  const fillAllWords = () => {
    if (!crosswordData || !crosswordRef.current) return;

    const crossword = crosswordRef.current;
    
    // Fill across answers
    Object.values(crosswordData.across).forEach(({ row, col, answer }) => {
      answer.split('').forEach((char, index) => {
        crossword.setGuess(row, col + index, char);
      });
    });

    // Fill down answers
    Object.values(crosswordData.down).forEach(({ row, col, answer }) => {
      answer.split('').forEach((char, index) => {
        crossword.setGuess(row + index, col, char);
      });
    });
  };

  return (
    <div className="crossword-wrapper">
      {loading ? (
        <div className="loading">Generating Crossword Puzzle...</div>
      ) : crosswordData ? (
        <div className="crossword-container">
          <Crossword
            ref={crosswordRef}
            data={crosswordData}
            theme={{
              gridBackground: '#f0f0f0',
              cellBackground: '#ffffff',
              cellBorder: '#666666',
              textColor: '#000000',
              numberColor: '#666666',
              focusBackground: '#e0f0ff',
              blockBackground: '#000000',
              blockBorder: '#666666',
            }}
          />
          <div className="button-group">
            <button onClick={() => setCrosswordData(null)} className="reset-btn">
              New Puzzle
            </button>
            <button onClick={fillAllWords} className="fill-btn">
              Reveal Answers
            </button>
          </div>
        </div>
      ) : (
        <div className="input-section">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter topic or text for crossword..."
            className="crossword-input"
          />
          <button onClick={generateCrossword} className="generate-btn">
            Generate Crossword
          </button>
          {error && <div className="error">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default Cross;