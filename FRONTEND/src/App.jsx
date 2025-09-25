import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from '../components/login'
import Signup from '../components/signup'
import Profile from '../components/profile'
import Dashboard from '../components/dashboard'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">BudgetPlanner</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              {isLoggedIn && <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>}
              {isLoggedIn && <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>}
            </ul>
            <div className="d-flex">
              {!isLoggedIn ? (
                <>
                  <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
                  <Link className="btn btn-light" to="/signup">Get started</Link>
                </>
              ) : (
                <button className="btn btn-outline-light" onClick={() => setIsLoggedIn(false)}>Logout</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={
          <>
            <div className="hero bg-light">
              <div className="container text-center">
                <h1 className="display-4 fw-bold mb-4">Welcome to Budget Planner</h1>
                <p className="lead mb-4">Track income and expenses, set savings goals, and gain insights into your spending patterns.</p>
               
                <p className="text-muted">Join thousands of users managing their finances smarter</p>
              </div>
            </div>
            
            <div className="container py-5">
              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="feature-card h-100">
                    <div className="feature-icon bg-primary bg-opacity-10 text-primary mb-3">
                      <i className="bi bi-graph-up"></i>
                    </div>
                    <h3 className="h5 mb-3">Smart Analytics</h3>
                    <p className="text-muted mb-0">Visual spending patterns, category breakdowns, and trend analysis to help you make informed decisions.</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="feature-card h-100">
                    <div className="feature-icon bg-success bg-opacity-10 text-success mb-3">
                      <i className="bi bi-bell"></i>
                    </div>
                    <h3 className="h5 mb-3">Intelligent Alerts</h3>
                    <p className="text-muted mb-0">Get notifications for unusual spending, bill reminders, and when you're approaching budget limits.</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="feature-card h-100">
                    <div className="feature-icon bg-info bg-opacity-10 text-info mb-3">
                      <i className="bi bi-calendar-check"></i>
                    </div>
                    <h3 className="h5 mb-3">Monthly Insights</h3>
                    <p className="text-muted mb-0">Detailed monthly reports, spending categories, and personalized saving recommendations.</p>
                  </div>
                </div>
              </div>

              <div className="row align-items-center g-5">
                <div className="col-md-6">
                  <h2 className="h3 mb-4">Why choose Budget Planner?</h2>
                  <div className="d-flex gap-3 mb-4">
                    <div className="feature-icon bg-primary bg-opacity-10 text-primary">
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <div>
                      <h4 className="h6 mb-2">Secure & Private</h4>
                      <p className="text-muted mb-0">Your financial data is encrypted and never shared with third parties.</p>
                    </div>
                  </div>
                  <div className="d-flex gap-3 mb-4">
                    <div className="feature-icon bg-primary bg-opacity-10 text-primary">
                      <i className="bi bi-lightning"></i>
                    </div>
                    <div>
                      <h4 className="h6 mb-2">Easy to Use</h4>
                      <p className="text-muted mb-0">Simple interface for quick transaction entry and category management.</p>
                    </div>
                  </div>
                  <div className="d-flex gap-3">
                    <div className="feature-icon bg-primary bg-opacity-10 text-primary">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div>
                      <h4 className="h6 mb-2">Real-time Updates</h4>
                      <p className="text-muted mb-0">See your financial position update instantly as you add transactions.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0">
                    <div className="card-body p-4">
                      <h3 className="h5 mb-4 text-center">Start managing your finances today</h3>
                      <div className="d-flex justify-content-center">
                        <div className="text-center px-4">
                          <h4 className="display-4 fw-bold text-primary mb-0">100%</h4>
                          <p className="text-muted">Free to use</p>
                        </div>
                        <div className="text-center px-4">
                          <h4 className="display-4 fw-bold text-primary mb-0">24/7</h4>
                          <p className="text-muted">Access</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        } />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup onSignup={() => setIsLoggedIn(true)} />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

