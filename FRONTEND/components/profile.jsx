import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const [user, setUser] = useState({
    fullname: '',
    email: ''
  })
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const navigate = useNavigate()

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('User data from localStorage:', parsedUser)
        setUser({
          fullname: parsedUser.fullname || parsedUser.username || '',
          email: parsedUser.email || ''
        })
      } catch (error) {
        showToast('Error loading user data', 'danger')
        console.error('Error parsing user data:', error)
      }
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // Navigate to login page
    navigate('/login')
  }

  return (
    <div className="container mt-5">
      {/* Toast notification */}
      {toast.show && (
        <div className={`alert alert-${toast.type} position-fixed top-0 end-0 m-3`} style={{ zIndex: 1050 }}>
          {toast.message}
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">User Profile</h4>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="avatar-placeholder bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-person-fill" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3>{user.fullname}</h3>
                <p className="text-muted">{user.email}</p>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Personal Information</h5>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Full Name</label>
                        <p>{user.fullname}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Email Address</label>
                        <p>{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Account Settings</h5>
                      <p className="text-muted mb-4">Manage your account settings and preferences</p>
                      <button 
                        className="btn btn-danger w-100 mb-3"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                      <button 
                        className="btn btn-primary w-100"
                        onClick={() => navigate('/dashboard')}
                      >
                        <i className="bi bi-graph-up me-2"></i>
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

