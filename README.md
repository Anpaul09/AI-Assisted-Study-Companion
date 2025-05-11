# AI-Assisted Study Companion 

Welcome to the AI-Assisted Study Companion, a web-based platform designed to make studying more effective, personalized, and fun! Designed for students, educators, and lifelong learners.

## ✨ Features

### 📚 Study Tools
- **AI-Generated Flashcards**: Automatically generate flashcards from uploaded text or documents (PDF/DOC) using OpenAI's GPT-4o Mini or manually.
- **AI-Generated Quizzes**: Create customized quizzes with instant explanations based on user content.
- **AI-Generated Summarizer**: Summarize long-form content into concise key points with just one click.
- **Study Planner**: Stay organized with a built-in planner tool.
- **Note-Taking**: Take, save, and manage notes during quizzes or independently.

### 🎮 Educational Games
Learn while having fun with games like:
- Category Sorting: Sort items into categories (powered by OpenAI).
- Guess the Country Flag: Test geography knowledge.
- Vocabulary Quiz: Test and expand your word knowledge.
- Fact or Cap: True/false challenges.

### 🔗 Collaboration & Sharing
- Easily share quizzes and flashcards with classmates using links or social media.

### 👤 User Management
- Secure signup/login with Firebase Authentication.
- Update profiles (name, password, profile picture).
- Delete account with data cleanup.

## 🛠️ Tech Stack
- **Frontend**: React.js, Redux (for state management)
- **Backend**: Firebase (Authentication, Realtime Database, Storage, Functions)
- **AI Integration**: OpenAI GPT-4o Mini API
- **Voice Input**: Web Speech API
- **Testing**: Jest, Cypress, Firebase Emulator Suite

## Project Structure

```
AI-Study-Companion/
├── Backend/                             # Firebase functions/emulators
│   └── node_modules/
├── Frontend/
│   ├── public/                         # Static assets
│   ├── src/
│   │   ├── LoginHome/                  # Auth-related components
│   │   ├── api/                        # API calls (OpenAI, Firebase)
│   │   ├── components/                 # Reusable UI components
│   │   ├── config/                     # Firebase/config files
│   │   ├── games/                      # Game logic/components
│   │   └── mainpages/                  # Core pages (Dashboard, Quizzes, Flashcards)
├── node_modules/
├── package-lock.json
└── package.json
```


## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Firebase CLI (`npm install -g firebase-tools`)
- OpenAI API key (for quiz/flashcard generation)

### Installation
1. Clone the repo
   ```bash
   git clone https://github.com/KToppers/AI-Study-Assistant.git
   cd AI-Study-Assistant/Frontend


2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a project in [Firebase Console](https://console.firebase.google.com)
   - Add your config in `src/config/firebase.js`

4. Start the development server
   ```bash
   npm start
   ```

### Deployment
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

## 🌟 **Future Improvements**
- Collaborative Study Groups: Real-time group study sessions
- Mobile App: React Native integration
- Offline Mode: Cache study materials for offline access
- Progress Analytics: Visualize learning trends

## 👥 **Contributors**
- **James Liu** – Documentation & QA
- **Kleant Topalli** – Team Lead / Presentation
- **Aniruddah Paul** – Backend Developer
- **Eunice Shobowale** – Frontend Developer

## **Support**
For questions or support, contact:  
📧 hq0895@wayne.edu  
📞 313-312-3680
