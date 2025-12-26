# ThinkCode-AI 🚀

ThinkCode-AI is a next-generation, collaborative IDE built for the modern developer. It integrates a powerful code editor with real-time AI assistance and multi-user collaboration features to make coding more efficient and social.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)

---

## ✨ Features

-   **🤖 Integrated AI Assistant**: A built-in chat interface powered by AI to help you generate code, debug errors, and explain logic without leaving your editor.
-   **👥 Real-Time Collaboration**: Create collaboration sessions using **Yjs** and **WebSockets**. Work with your team on the same file with real-time cursor tracking and synchronized editing.
-   **💻 Pro-Grade Editor**: Powered by the **Monaco Editor** (the engine behind VS Code), providing high-quality syntax highlighting, IntelliSense, and multi-language support.
-   **🔐 Secure Authentication**: Integrated **Firebase Auth** for secure user login and project management.
-   **💾 Cloud Persistence**: Automatically saves and retrieves your recent code snippets using Firebase Firestore.
-   **🛡️ Content Safety**: Uses **DOMPurify** to ensure that all AI-generated markdown is rendered safely without XSS risks.

---

## 🛠️ Technical Stack

-   **Frontend**: React.js
-   **Editor**: Monaco Editor
-   **Backend & DB**: Firebase (Authentication, Firestore)
-   **Collaboration Engine**: Yjs (CRDTs) & y-websocket
-   **Markdown Rendering**: Marked & DOMPurify

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v14.0.0 or higher)
-   **npm** or **yarn**
-   A **Firebase Project** (for Auth and Database)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/gopipradeep/thinkcode-ai-frontend.git](https://github.com/gopipradeep/thinkcode-ai-frontend.git)
    cd thinkcode-ai-frontend/frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Firebase Configuration**
    Create a `src/firebase.js` file and add your Firebase credentials:
    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "your-app.firebaseapp.com",
      projectId: "your-app",
      storageBucket: "your-app.appspot.com",
      messagingSenderId: "...",
      appId: "..."
    };
    ```

4.  **Launch the App**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── ThinkCodeAI.js    # Core IDE component & AI integration
│   ├── CollabSession.js  # Yjs-based collaboration logic
│   ├── LoginPage.js      # User Authentication UI
│   ├── firebase.js       # Cloud service configuration
│   └── App.js            # Main application routing
├── public/               # Static assets
└── package.json          # Project dependencies
