// src/App.js
import React, { useState, useEffect } from 'react';
import ThinkCodeAI from './ThinkCodeAI';
import LoginPage from './LoginPage';
import CollabSession from './CollabSession'; // NEW IMPORT
import { auth, onAuthStateChanged, signOut } from './firebase';

// Helper function to get the current route path
const getPath = () => window.location.pathname;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // NEW STATE for routing: listens for changes
  const [path, setPath] = useState(getPath());

  const handleLoginSuccess = (currentUser) => {
    // If the login result gives us a user, set it.
    if (currentUser) {
      setUser(currentUser);
    }
    // Always set loading to false to force the App to render past the loading screen.
    setLoading(false);
  };
  
  // NEW EFFECT: Listen for hash changes (crude routing for single-page app)
  useEffect(() => {
      const handleHashChange = () => {
          setPath(getPath());
      };
      
      // We will listen to the popstate event for back/forward buttons
      window.addEventListener('popstate', handleHashChange);

      return () => {
          window.removeEventListener('popstate', handleHashChange);
      };
  }, []);


  useEffect(() => {
    // This remains the official listener for initial hydration and external state changes (like token expiry).
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Reverting the explicit photoURL sanitization here, letting ThinkCodeAI handle rendering
      setUser(currentUser);
      setLoading(false); // This resolves the loading state on initial load/refresh.
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      // NOTE: Using a custom modal/message box instead of alert()
      console.error("Failed to log out. Please try again.");
    }
  };

  if (loading) {
    // Show a loading screen while checking auth status
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.5rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Authenticating...
      </div>
    );
  }

  // Render login page if not authenticated
  if (!user) {
    // MODIFIED: Removed onLoginSuccess prop as it's not used in LoginPage.js logic
    return <LoginPage />;
  }
  
  // NEW ROUTING LOGIC: Check for /collab/{sessionId}
  if (path.startsWith('/collab/')) {
      const collabId = path.substring('/collab/'.length);
      if (collabId && collabId.length > 5) { // Basic length check for ID
          return (
              <CollabSession 
                  collabId={collabId}
                  user={user}
                  onLogout={handleLogout}
              />
          );
      }
  }


  // Render main application if authenticated (or fallback to basic path)
  return (
    <>
      <ThinkCodeAI 
        onLogout={handleLogout} 
        user={user}
        // Pass user.uid for persistence logic
        uid={user.uid} 
      />
    </>
  );
}

export default App;