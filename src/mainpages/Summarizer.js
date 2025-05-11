import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useNavigate } from 'react-router-dom';
import "./summarizer.css";

const Summarizer = () => {
 const API_KEY = 'Your OpenAI API Key'; // Replace with your actual API key
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryType, setSummaryType] = useState('entire');
  const [specificParts, setSpecificParts] = useState('');
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const navigate = useNavigate();

  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

  const handlePdfUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const uint = new Uint8Array(event.target.result);
      const pdf = await pdfjsLib.getDocument({ data: uint }).promise;
      let doctext = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        doctext += content.items.map(item => item.str).join(' ');
      }

      setInputText(doctext);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleVoiceToggle = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setInputText(transcript);
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    let prompt;
    
    if (summaryType === 'entire') {
      prompt = `Summarize the entire text below in a clear and concise manner:\n\n${inputText}`;
    } else {
      prompt = `Summarize the following parts of the text: ${specificParts}. Focus specifically on these sections while maintaining context:\n\n${inputText}`;
    }

    try {
      const res = await fetch('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2024-07-18',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        }),
      });

      const data = await res.json();
      setSummary(data.choices[0].message.content.trim());
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Error generating summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          if (summary) {
            setSummary(""); // If summary exists, clear it
          } else {
            window.location.href = "/Dashboard";
          }
        }}
        className="summaryback-button"
      >
        <svg
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
      <div className="summarizer-wrapper">
        <div className="summarizerName">
          <h1>Summarizer</h1>
        </div>
        {!summary ? (
          <>
            <div className="input-container">
              <textarea
                className="dynamic-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text, upload a PDF, or use voice input"
              />

              <div className="button-group">
                <input
                  id="pdfInput"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handlePdfUpload(e.target.files[0])}
                  style={{ display: "none" }}
                />
                <button
                  className="action-button"
                  onClick={() => document.getElementById("pdfInput").click()}
                  title="Upload PDF"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </button>

                <button
                  className={`action-button ${listening ? "active" : ""}`}
                  onClick={handleVoiceToggle}
                  title="Voice Input"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="summary-options">
              <label>
                <input
                  type="radio"
                  value="entire"
                  checked={summaryType === "entire"}
                  onChange={(e) => setSummaryType(e.target.value)}
                />
                Summarize Entire Text
              </label>

              <label>
                <input
                  type="radio"
                  value="specific"
                  checked={summaryType === "specific"}
                  onChange={(e) => setSummaryType(e.target.value)}
                />
                Summarize Specific Parts
              </label>

              {summaryType === "specific" && (
                <input
                  type="text"
                  value={specificParts}
                  onChange={(e) => setSpecificParts(e.target.value)}
                  placeholder="Enter specific sections to summarize (e.g., 'introduction, conclusion')"
                  className="specific-input"
                />
              )}
            </div>

            <button
              className="submit-button"
              onClick={generateSummary}
              disabled={loading || !inputText}
            >
              {loading ? (
                <span className="loading-state">Processing...</span>
              ) : (
                <>
                  <svg
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Generate Summary
                </>
              )}
            </button>

            {/* <button 
            className="dashboard-button" 
            onClick={() => navigate('/dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Back to Main
          </button> */}
          </>
        ) : (
          <div className="summary-result">
            <h2>Summary</h2>
            <div className="summary-content">{summary}</div>
            {/* <button
              onClick={() => setSummary("")}
              className="summaryback-button"
            >
              <svg
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
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer;