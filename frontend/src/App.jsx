import "./App.css";

function App() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">V</div>
          <span>Viva<span className="logo-highlight">AI</span></span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <button className="nav-button">
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <main id="home" className="hero">
        <div className="hero-content">
          <div className="badge">
            <span className="status-dot"></span>
            AI-Powered Viva Platform
          </div>

          <h1>
            Your Personal
            <br />
            <span>AI Viva Examiner</span>
          </h1>

          <p className="hero-description">
            Experience intelligent viva examinations with an AI examiner
            that asks questions, understands your answers, and adapts
            to your knowledge.
          </p>

          <div className="hero-buttons">
            <button className="primary-button">
              Start Your Viva
              <span className="arrow">→</span>
            </button>

            <button className="secondary-button">
              Explore Features
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <strong>AI</strong>
              <span>Powered</span>
            </div>

            <div className="stat-divider"></div>

            <div className="stat">
              <strong>Real-time</strong>
              <span>Interaction</span>
            </div>

            <div className="stat-divider"></div>

            <div className="stat">
              <strong>Adaptive</strong>
              <span>Questioning</span>
            </div>
          </div>
        </div>

        {/* Interview Preview */}
        <div className="hero-visual">
          <div className="glow"></div>

          <div className="interview-card">
            <div className="interview-header">
              <div>
                <span className="live-dot"></span>
                <span className="live-text">LIVE INTERVIEW</span>
              </div>

              <span className="timer">00:12:45</span>
            </div>

            <div className="examiner-section">
              <div className="examiner-avatar">
                <div className="avatar-circle">AI</div>
                <span className="avatar-status"></span>
              </div>

              <h3>AI Examiner</h3>
              <p>Ready to evaluate your knowledge</p>
            </div>

            <div className="question-box">
              <span className="question-label">CURRENT QUESTION</span>
              <p>
                Can you explain the difference between supervised
                and unsupervised learning?
              </p>
              <div className="sound-bars">
                {[16, 28, 20, 35, 23, 40, 25, 32, 18, 29, 14].map(
                  (height, index) => (
                    <span
                      key={index}
                      style={{ height: `${height}px` }}
                    ></span>
                  )
                )}
              </div>
            </div>

            <div className="student-preview">
              <div className="camera-placeholder">
                <div className="camera-icon">▣</div>
                <span>Camera preview</span>
              </div>

              <div className="student-info">
                <span className="student-name">Student</span>
                <span className="student-status">
                  <span className="status-dot"></span>
                  Connected
                </span>
              </div>
            </div>

            <div className="interview-footer">
              <span className="footer-label">Your viva session</span>
              <div className="footer-controls">
                <span className="control-icon">🎙</span>
                <span className="control-icon">📹</span>
                <span className="control-icon end-control">✕</span>
              </div>
            </div>
          </div>

          <div className="floating-card">
            <span className="floating-icon">✦</span>
            <div>
              <strong>Adaptive Questions</strong>
              <p>Based on your answers</p>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-heading">
          <span className="section-label">WHY VIVAAI?</span>
          <h2>Smarter Viva. Better Preparation.</h2>
          <p>
            Practice with an intelligent examiner designed to
            understand and evaluate your knowledge.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon purple">✦</div>
            <h3>AI-Powered Questions</h3>
            <p>
              Get questions generated according to your subject
              and syllabus.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">↗</div>
            <h3>Adaptive Follow-ups</h3>
            <p>
              Questions adapt to your answers and help explore
              your understanding.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">◉</div>
            <h3>Voice Interaction</h3>
            <p>
              Experience a natural viva with spoken questions
              and answers.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">▤</div>
            <h3>Detailed Feedback</h3>
            <p>
              Review your performance and identify concepts
              that need more practice.
            </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="about-section">
        <div>
          <span className="section-label">ABOUT THE PLATFORM</span>
          <h2>Practice. Learn. Improve.</h2>
        </div>

        <p>
          VivaAI is an AI-powered viva examination platform.
          It combines natural language processing and generative AI
          to create interactive, personalized examination sessions.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="logo">
          <div className="logo-icon">V</div>
          <span>Viva<span className="logo-highlight">AI</span></span>
        </div>

        <p>Intelligent viva practice, powered by AI.</p>
        <span>© 2026 VivaAI</span>
      </footer>
    </div>
  );
}

export default App;