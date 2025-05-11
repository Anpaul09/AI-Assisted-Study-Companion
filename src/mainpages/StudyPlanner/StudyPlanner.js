

//modified code based on the feedback 


import React, { useState, useEffect } from "react";
import "./plan.css";
import { useNavigate } from "react-router-dom";

const StudyPlanner = () => {
  // API key for OpenAI (Note: In production, this should be handled server-side)
  const API_KEY = "Your-OpenAI-API-Key-Here"; // Replace with your OpenAI API key
  
  // State declarations
  const [plans, setPlans] = useState([]); // Stores all study plans
  const [activeTab, setActiveTab] = useState("create"); // Controls which tab is active
  const [formData, setFormData] = useState({ // Form data for new plans
    topic: "",
    hours: 2,
    days: 3,
    focus: "",
    instructions: ""
  });
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(""); // Error messages
  const [editingPlan, setEditingPlan] = useState(null); // Currently edited plan
  const [notification, setNotification] = useState({ show: false, message: "", type: "" }); // Notification system
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Delete confirmation modal
  const [planToDelete, setPlanToDelete] = useState(null); // Plan marked for deletion
  const navigate = useNavigate();

  // Load saved plans from localStorage when component mounts
  useEffect(() => {
    const saved = localStorage.getItem("studyPlans");
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      setPlans(parsed.map(plan => ({
        ...plan,
        schedule: Array.isArray(plan?.schedule) ? plan.schedule : [],
        days: plan?.days || 1,
        hours: plan?.hours || 2,
        focus: plan?.focus || "",
        createdAt: plan?.createdAt || new Date().toISOString()
      })));
    } catch (e) {
      setPlans([]);
    }
  }, []);

  // Show a temporary notification message
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Convert minutes to human-readable format (e.g., 90 => "1h 30m")
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  /**
   * Parse the AI-generated content into a structured schedule
   * @param {string} content - Raw text from AI response
   * @param {number} totalHours - Total hours per day
   * @returns {Array} Structured schedule data
   */
  const parseSchedule = (content, totalHours) => {
    const totalMinutes = totalHours * 60;
    const maxChunkSize = 90; // Maximum study session length in minutes
    
    try {
      if (!content || typeof content !== 'string') return defaultSchedule(totalHours);
      
      const schedule = [];
      const dayBlocks = content.split(/(Day \d+:)/gi); // Split content by day headings
      
      // Process each day block
      for (let i = 1; i < dayBlocks.length; i += 2) {
        const dayHeader = dayBlocks[i]?.trim();
        const dayContent = dayBlocks[i + 1]?.trim() || "";
        
        if (dayHeader?.startsWith("Day ")) {
          const tasks = [];
          const taskLines = dayContent.split('\n').filter(l => l?.trim());
          let remainingMinutes = totalMinutes;
          
          // Process each task line in the day's content
          taskLines.forEach(line => {
            // Extract time allocation (e.g., [30m] or [1h])
            const timeMatch = line?.match(/\[(\d+m|\d+h)\]/i);
            let minutes = 0;
            
            if (timeMatch) {
              const timeStr = timeMatch[1].toLowerCase();
              minutes = timeStr.includes('h') 
                ? parseInt(timeStr) * 60 
                : parseInt(timeStr);
            }
            
            // Validate time allocation
            if (minutes <= 0 || minutes > maxChunkSize) {
              minutes = Math.min(maxChunkSize, remainingMinutes);
            }
            
            // Add valid tasks to the day's schedule
            if (minutes > 0 && minutes <= remainingMinutes) {
              tasks.push({
                minutes: minutes,
                description: line?.replace(/\[\d+[mh]\]/i, '')?.trim() || "Study session",
                time: formatTime(minutes)
              });
              remainingMinutes -= minutes;
            }
          });

          // Fill remaining time with default study sessions
          while (remainingMinutes > 0) {
            const chunk = Math.min(maxChunkSize, remainingMinutes);
            tasks.push({
              minutes: chunk,
              description: "Focused study session",
              time: formatTime(chunk)
            });
            remainingMinutes -= chunk;
          }

          // Fallback if no tasks were created
          if (tasks.length === 0) {
            let remaining = totalMinutes;
            while (remaining > 0) {
              const chunk = Math.min(maxChunkSize, remaining);
              tasks.push({
                minutes: chunk,
                description: "Structured study session",
                time: formatTime(chunk)
              });
              remaining -= chunk;
            }
          }

          // Add the completed day to the schedule
          schedule.push({
            day: schedule.length + 1,
            title: `Day ${schedule.length + 1}`,
            tasks: tasks,
            totalMinutes: totalMinutes
          });
        }
      }
      return schedule.length > 0 ? schedule : defaultSchedule(totalHours);
    } catch {
      return defaultSchedule(totalHours);
    }
  };

  // Create a default schedule when parsing fails
  const defaultSchedule = (hours) => {
    const totalMinutes = hours * 60;
    const maxChunkSize = 90;
    const tasks = [];
    let remaining = totalMinutes;
    
    // Create evenly distributed study sessions
    while (remaining > 0) {
      const chunk = Math.min(maxChunkSize, remaining);
      tasks.push({
        minutes: chunk,
        description: "Structured study session",
        time: formatTime(chunk)
      });
      remaining -= chunk;
    }
    
    return [{
      day: 1,
      title: "Day 1",
      tasks: tasks,
      totalMinutes
    }];
  };

  /**
   * Create a new study plan using AI
   * @param {Event} e - Form submit event
   */
  const createPlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Validate form inputs
      if (!formData.topic?.trim()) {
        throw new Error("Please enter a study topic to continue");
      }
      if (formData.hours * formData.days > 50) {
        throw new Error("Total study time cannot exceed 50 hours for better learning results");
      }

      // Construct the prompt for the AI
      let prompt = `Create a ${formData.days}-day study plan about ${formData.topic} with exactly ${formData.hours} hours daily.
Break each day into manageable sessions of 30-90 minutes each.
STRICT FORMAT RULES:
1. Each day must start with "Day X:" 
2. Every task must begin with [Xm] or [Xh] time allocation (e.g., [30m] or [1h])
3. Total daily time must equal exactly ${formData.hours} hours
4. No single session should be longer than 90 minutes
5. Example format: [30m] Introduction to topic`;
      
      // Add optional fields to the prompt
      if (formData.focus) {
        prompt += `\nFocus areas: ${formData.focus}.`;
      }
      
      if (formData.instructions) {
        prompt += `\nAdditional instructions: ${formData.instructions}`;
      }

      // Call OpenAI API to generate the plan
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "We couldn't create your schedule. Please check your connection and try again.");
      }

      // Process the AI response
      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      // Create new plan object
      const newPlan = {
        id: Date.now(),
        title: formData.topic.trim(),
        duration: `${formData.days} days, ${formData.hours} hours/day`,
        schedule: parseSchedule(content, formData.hours),
        focus: formData.focus?.trim(),
        createdAt: new Date().toISOString()
      };

      // Update state and localStorage
      setPlans(prev => {
        const updated = [newPlan, ...prev];
        localStorage.setItem("studyPlans", JSON.stringify(updated));
        return updated;
      });
      
      // Reset form
      setFormData({
        topic: "",
        hours: 2,
        days: 3,
        focus: "",
        instructions: ""
      });
      setActiveTab("plans");
      showNotification("Study schedule created successfully!");
    } catch (error) {
      // Handle errors with user-friendly messages
      const friendlyErrors = {
        "Failed to generate plan": "We couldn't create your schedule. Please check your connection and try again.",
        "AI response format invalid": "The schedule format wasn't quite right. We're trying again automatically..."
      };
      
      setError(friendlyErrors[error.message] || error.message || "Something unexpected happened. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation dialog
  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteConfirm(true);
  };

  // Confirm and execute plan deletion
  const confirmDelete = () => {
    if (!planToDelete) return;
    
    setPlans(prev => {
      const updated = prev.filter(p => p.id !== planToDelete.id);
      localStorage.setItem("studyPlans", JSON.stringify(updated));
      return updated;
    });
    
    showNotification(`"${planToDelete.title}" schedule has been deleted.`);
    setShowDeleteConfirm(false);
    setPlanToDelete(null);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPlanToDelete(null);
  };

  // Start editing a plan
  const startEditing = (plan) => {
    setEditingPlan(JSON.parse(JSON.stringify(plan))); // Deep copy
  };

  // Cancel editing mode
  const cancelEditing = () => {
    setEditingPlan(null);
  };

  // Save edited changes
  const saveEdits = () => {
    if (!editingPlan) return;
    
    setPlans(prev => {
      const updated = prev.map(p => p.id === editingPlan.id ? editingPlan : p);
      localStorage.setItem("studyPlans", JSON.stringify(updated));
      return updated;
    });
    setEditingPlan(null);
    showNotification("Changes saved successfully!");
  };

  // Handle changes to plan metadata during editing
  const handleEditChange = (field, value) => {
    setEditingPlan(prev => ({ ...prev, [field]: value }));
  };

  // Handle changes to individual tasks during editing
  const handleTaskChange = (dayIndex, taskIndex, value) => {
    setEditingPlan(prev => {
      const updatedSchedule = [...prev.schedule];
      updatedSchedule[dayIndex].tasks[taskIndex].description = value;
      return { ...prev, schedule: updatedSchedule };
    });
  };

  /**
   * Render a schedule's day-by-day breakdown
   * @param {Array} schedule - The schedule data to render
   * @returns {JSX} Rendered schedule component
   */
  const renderSchedule = (schedule) => (
    <div className="schedule-details">
      {(schedule || []).map((day, dayIndex) => (
        <div key={dayIndex} className="day-schedule">
          <div className="day-header">
            <h4>{day?.title || "Untitled Day"}</h4>
            <div className="day-total">Total: {formatTime(day?.totalMinutes || 0)}</div>
          </div>
          <ul className="task-list">
            {(day?.tasks || []).map((task, taskIndex) => (
              <li key={taskIndex} className="task-item">
                <div className="time-badge">{task?.time || "0m"}</div>
                <div className="task-content">
                  {editingPlan ? (
                    <input
                      value={task?.description || ""}
                      onChange={(e) => handleTaskChange(dayIndex, taskIndex, e.target.value)}
                      className="task-edit-input"
                    />
                  ) : (
                    task?.description || "No description"
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    window.location.href = '/Dashboard';
  };

  return (
    <div className="study-planner">
      {/* Notification system */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && planToDelete && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the schedule for "{planToDelete.title}"?</p>
            <div className="delete-confirm-buttons">
              <button onClick={cancelDelete} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="confirm-delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with navigation tabs */}
      <header className="planner-header">
        <h1>AI Study Schedule Generator</h1>
        <nav className="nav-tabs">
          <button 
            className={`tab ${activeTab === "create" ? "active" : ""}`} 
            onClick={() => setActiveTab("create")}
          >
            New Schedule
          </button>
          <button 
            className={`tab ${activeTab === "plans" ? "active" : ""}`} 
            onClick={() => setActiveTab("plans")}
          >
            My Schedules ({plans.length})
          </button>
        </nav>
      </header>

      {/* Main content area */}
      <main className="planner-main">
        <div className="back-button-container">
          <button className="back-button" onClick={handleBackToDashboard}>
            ← Back 
          </button>
        </div>

        {/* Conditional rendering based on active tab */}
        {activeTab === "create" ? (
          // New schedule creation form
          <form className="creation-form" onSubmit={createPlan}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Main Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Python Programming"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Study Days *</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: Math.max(1, e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hours/Day *</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: Math.max(1, e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Focus Areas</label>
              <input
                type="text"
                value={formData.focus}
                onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                placeholder="e.g., Data Structures, Algorithms"
              />
            </div>

            <div className="form-group">
              <label>Additional Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Include any specific instructions for the schedule"
                rows="3"
              />
            </div>

            <button type="submit" className="generate-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                "Generate Schedule"
              )}
            </button>
          </form>
        ) : (
          // Plans list view
          <div className="plans-grid">
            {plans.length === 0 ? (
              <div className="empty-state">
                <p>No study schedules created yet!</p>
                <button onClick={() => setActiveTab("create")} className="cta-btn">
                  Create First Schedule
                </button>
              </div>
            ) : plans.map(plan => (
              <div key={plan.id} className="plan-card">
                <div className="card-header">
                  {editingPlan?.id === plan.id ? (
                    <input
                      className="edit-title"
                      value={editingPlan.title}
                      onChange={(e) => handleEditChange('title', e.target.value)}
                    />
                  ) : (
                    <h3>{plan.title}</h3>
                  )}
                  <div className="card-meta">
                    {editingPlan?.id === plan.id ? (
                      <div className="edit-meta">
                        <input
                          type="number"
                          value={editingPlan.duration.split(' ')[0]}
                          onChange={(e) => handleEditChange('duration', `${e.target.value} days`)}
                        />
                        <input
                          type="number"
                          value={editingPlan.duration.split(' ')[3]}
                          onChange={(e) => handleEditChange(
                            'duration',
                            `${editingPlan.duration.split(' ')[0]} days, ${e.target.value} hours/day`
                          )}
                        />
                      </div>
                    ) : (
                      <>
                        <span className="duration">{plan.duration}</span>
                        {plan.focus && <span className="focus">{plan.focus}</span>}
                      </>
                    )}
                    <div className="card-actions">
                      {editingPlan?.id === plan.id ? (
                        <>
                          <button className="save-btn" onClick={saveEdits}>
                            💾 Save
                          </button>
                          <button className="cancel-btn" onClick={cancelEditing}>
                            ✖ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="edit-btn" onClick={() => startEditing(plan)}>
                            ✏️ Edit
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteClick(plan)}>
                            × Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {renderSchedule(editingPlan?.id === plan.id ? editingPlan?.schedule : plan?.schedule)}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPlanner;


