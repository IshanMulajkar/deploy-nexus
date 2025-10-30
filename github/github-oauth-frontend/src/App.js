import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchRepos(token);
      return; // Don't process callback if already logged in
    }

    // Handle GitHub callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // Check if we've already processed this code
    const processedCode = sessionStorage.getItem('processedCode');
    
    if (code && code !== processedCode) {
      // Mark this code as processed to prevent duplicate attempts
      sessionStorage.setItem('processedCode', code);
      handleGithubCallback(code);
    } else if (code && code === processedCode) {
      // Code already processed, just clean up URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Handle GitHub Sign In
  const handleGithubSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/auth/github');
      const data = await response.json();
      
      // Redirect to GitHub OAuth
      window.location.href = data.url;
    } catch (err) {
      setError('Failed to initiate GitHub sign in');
      setLoading(false);
    }
  };

  // Handle GitHub OAuth callback
  const handleGithubCallback = async (code) => {
    try {
      setLoading(true);
      setError('');

      console.log('Sending code to backend:', code);

      const response = await fetch('http://localhost:5000/api/auth/github/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // Fetch repositories
        await fetchRepos(data.token);

        // Clean up URL and session storage
        window.history.replaceState({}, document.title, '/');
        
        // Clear the error message
        setError('');
      } else {
        console.error('Authentication failed:', data);
        // Only show error if we're not already logged in
        const token = localStorage.getItem('token');
        if (!token) {
          setError(data.message || 'Authentication failed. Check console for details.');
        } else {
          // Already logged in, ignore this error
          window.history.replaceState({}, document.title, '/');
        }
      }
    } catch (err) {
      console.error('Callback error:', err);
      // Only show error if we're not already logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError(`Failed to complete authentication: ${err.message}`);
      } else {
        // Already logged in, ignore this error
        window.history.replaceState({}, document.title, '/');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's repositories
  const fetchRepos = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/github/repos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setRepos(data.repos);
      } else {
        setError('Failed to fetch repositories');
      }
    } catch (err) {
      setError('Failed to fetch repositories');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('processedCode');
    setUser(null);
    setRepos([]);
    setError('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - Show sign in button
  if (!user) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>GitHub Repository Viewer</h1>
          <p>Sign in with GitHub to view your repositories</p>
          {error && <div className="error">{error}</div>}
          <button onClick={handleGithubSignIn} className="github-button">
            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  // Logged in - Show repositories
  return (
    <div className="App">
      <header className="header">
        <div className="user-info">
          <img src={user.avatarUrl} alt={user.username} className="avatar" />
          <div>
            <h2>{user.username}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="main">
        <h1>Your GitHub Repositories</h1>
        {error && <div className="error">{error}</div>}
        
        {repos.length === 0 ? (
          <p>No repositories found</p>
        ) : (
          <div className="repos-grid">
            {repos.map((repo) => (
              <div key={repo.id} className="repo-card">
                <h3>
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    {repo.name}
                  </a>
                </h3>
                <p className="repo-description">
                  {repo.description || 'No description'}
                </p>
                <div className="repo-meta">
                  <span className="repo-language">
                    {repo.language && (
                      <>
                        <span className="language-dot" style={{backgroundColor: getLanguageColor(repo.language)}}></span>
                        {repo.language}
                      </>
                    )}
                  </span>
                  <span className="repo-stars">⭐ {repo.stargazers_count}</span>
                  <span className="repo-forks">🔱 {repo.forks_count}</span>
                </div>
                <div className="repo-footer">
                  <span className="repo-visibility">
                    {repo.private ? '🔒 Private' : '🌐 Public'}
                  </span>
                  <span className="repo-updated">
                    Updated: {new Date(repo.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function for language colors
function getLanguageColor(language) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
  };
  return colors[language] || '#808080';
}

export default App;