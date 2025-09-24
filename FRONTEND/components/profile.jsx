import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { transactionAPI } from '../src/services/transactionAPI'

function Profile() {
  const [user, setUser] = useState({
    fullname: '',
    email: ''
  })
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryExpenses: {},
    recentTransactions: []
  })
  const [transactions, setTransactions] = useState([])
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
        
        // Fetch dashboard data for PDF generation
        fetchDashboardData(parsedUser.email)
        fetchTransactions(parsedUser.email)
      } catch (error) {
        showToast('Error loading user data', 'danger')
        console.error('Error parsing user data:', error)
      }
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])
  
  const fetchDashboardData = async (email) => {
    try {
      const data = await transactionAPI.getDashboardSummary(email)
      setSummaryData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchTransactions = async (email) => {
    try {
      const data = await transactionAPI.getAllTransactions(email)
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

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
  
  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true)
      showToast('Generating PDF summary...', 'info')
      
      // Create new PDF document
      const doc = new jsPDF()
      
      // Set document properties
      doc.setProperties({
        title: 'Budget Tracker Summary',
        subject: 'Financial Summary Report',
        author: user.fullname,
        creator: 'Budget Tracker App'
      })
      
      // Define color palette
      const colors = {
        primary: [41, 128, 185],      // Blue
        secondary: [142, 68, 173],    // Purple
        accent1: [39, 174, 96],       // Green
        accent2: [211, 84, 0],        // Orange
        accent3: [22, 160, 133],      // Teal
        dark: [44, 62, 80],           // Dark Blue
        light: [236, 240, 241],       // Light Gray
        warning: [243, 156, 18],      // Yellow
        danger: [231, 76, 60],        // Red
        text: [52, 73, 94]            // Dark Gray
      }
      
      // Add decorative header background
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, 210, 40, 'F')
      
      // Add gradient accent bar
      for (let i = 0; i < 210; i += 10) {
        const color = i % 30 === 0 ? colors.accent1 : 
                     i % 20 === 0 ? colors.accent2 : colors.accent3
        doc.setFillColor(...color)
        doc.rect(i, 40, 10, 3, 'F')
      }
      
      // Add title with shadow effect
      doc.setFontSize(28)
      doc.setTextColor(255, 255, 255)
      doc.text('BUDGET TRACKER', 105, 20, { align: 'center' })
      doc.setFontSize(16)
      doc.text('FINANCIAL SUMMARY', 105, 30, { align: 'center' })
      
      // Add decorative elements
      doc.setDrawColor(...colors.accent2)
      doc.setLineWidth(1.5)
      doc.line(20, 50, 190, 50)
      
      // Add user information section with styled box
      doc.setFillColor(...colors.light)
      doc.roundedRect(15, 55, 180, 40, 3, 3, 'F')
      doc.setDrawColor(...colors.primary)
      doc.setLineWidth(0.5)
      doc.roundedRect(15, 55, 180, 40, 3, 3, 'S')
      
      // Add user icon
      doc.setFillColor(...colors.primary)
      doc.circle(30, 70, 8, 'F')
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text('👤', 30, 73, { align: 'center' })
      
      // User information with styled text
      doc.setFontSize(14)
      doc.setTextColor(...colors.secondary)
      doc.setFont(undefined, 'bold')
      doc.text('USER PROFILE', 105, 65, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setTextColor(...colors.text)
      doc.setFont(undefined, 'bold')
      doc.text('Full Name:', 45, 75)
      doc.setFont(undefined, 'normal')
      doc.text(user.fullname, 85, 75)
      
      doc.setFont(undefined, 'bold')
      doc.text('Email:', 45, 85)
      doc.setFont(undefined, 'normal')
      doc.text(user.email, 85, 85)
      
      // Add financial summary section with modern cards
      const summaryStartY = 105
      
      // Income Card
      doc.setFillColor(236, 252, 243) // Light green
      doc.roundedRect(15, summaryStartY, 55, 40, 3, 3, 'F')
      doc.setDrawColor(...colors.accent1)
      doc.setLineWidth(0.5)
      doc.roundedRect(15, summaryStartY, 55, 40, 3, 3, 'S')
      
      doc.setFontSize(12)
      doc.setTextColor(...colors.accent1)
      doc.setFont(undefined, 'bold')
      doc.text('INCOME', 42.5, summaryStartY + 10, { align: 'center' })
      
      doc.setFontSize(16)
      doc.text(`$${summaryData.totalIncome.toFixed(2)}`, 42.5, summaryStartY + 25, { align: 'center' })
      
      // Expense Card
      doc.setFillColor(253, 237, 236) // Light red
      doc.roundedRect(77.5, summaryStartY, 55, 40, 3, 3, 'F')
      doc.setDrawColor(...colors.danger)
      doc.setLineWidth(0.5)
      doc.roundedRect(77.5, summaryStartY, 55, 40, 3, 3, 'S')
      
      doc.setFontSize(12)
      doc.setTextColor(...colors.danger)
      doc.setFont(undefined, 'bold')
      doc.text('EXPENSES', 105, summaryStartY + 10, { align: 'center' })
      
      doc.setFontSize(16)
      doc.text(`$${summaryData.totalExpense.toFixed(2)}`, 105, summaryStartY + 25, { align: 'center' })
      
      // Balance Card
      doc.setFillColor(235, 245, 251) // Light blue
      doc.roundedRect(140, summaryStartY, 55, 40, 3, 3, 'F')
      doc.setDrawColor(...colors.primary)
      doc.setLineWidth(0.5)
      doc.roundedRect(140, summaryStartY, 55, 40, 3, 3, 'S')
      
      doc.setFontSize(12)
      doc.setTextColor(...colors.primary)
      doc.setFont(undefined, 'bold')
      doc.text('BALANCE', 167.5, summaryStartY + 10, { align: 'center' })
      
      doc.setFontSize(16)
      doc.text(`$${summaryData.balance.toFixed(2)}`, 167.5, summaryStartY + 25, { align: 'center' })
      
      // Add transactions section with styled table
      const tableStartY = 155
      
      // Table header background
      doc.setFillColor(...colors.dark)
      doc.rect(15, tableStartY, 180, 10, 'F')
      
      // Table title
      doc.setFontSize(14)
      doc.setTextColor(255, 255, 255)
      doc.setFont(undefined, 'bold')
      doc.text('RECENT TRANSACTIONS', 105, tableStartY + 7, { align: 'center' })
      
      // Table headers
      doc.setFillColor(...colors.primary)
      doc.rect(15, tableStartY + 10, 180, 8, 'F')
      
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.setFont(undefined, 'bold')
      doc.text('DATE', 25, tableStartY + 16)
      doc.text('CATEGORY', 60, tableStartY + 16)
      doc.text('TYPE', 100, tableStartY + 16)
      doc.text('AMOUNT', 130, tableStartY + 16)
      doc.text('DESCRIPTION', 165, tableStartY + 16)
      
      // Table content - limit to 10 most recent transactions
      const recentTransactions = transactions.slice(0, 10)
      let yPosition = tableStartY + 25
      
      recentTransactions.forEach((transaction, index) => {
        // Alternating row colors
        doc.setFillColor(index % 2 === 0 ? 245 : 255, index % 2 === 0 ? 245 : 255, index % 2 === 0 ? 245 : 255)
        doc.rect(15, yPosition - 6, 180, 8, 'F')
        
        // Transaction type color
        const typeColor = transaction.type === 'INCOME' ? colors.accent1 : colors.danger
        
        const date = new Date(transaction.date).toLocaleDateString()
        doc.setFont(undefined, 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...colors.text)
        doc.text(date, 25, yPosition)
        doc.text(transaction.category, 60, yPosition)
        
        // Type with colored text
        doc.setTextColor(...typeColor)
        doc.setFont(undefined, 'bold')
        doc.text(transaction.type, 100, yPosition)
        
        // Amount with colored text
        doc.text(`$${transaction.amount.toFixed(2)}`, 130, yPosition)
        
        // Description
        doc.setTextColor(...colors.text)
        doc.setFont(undefined, 'normal')
        const description = transaction.description || ''
        doc.text(description.substring(0, 15) + (description.length > 15 ? '...' : ''), 165, yPosition)
        
        yPosition += 8
        
        // Add a new page if we're running out of space
        if (yPosition > 270 && index < recentTransactions.length - 1) {
          doc.addPage()
          
          // Add header to new page
          doc.setFillColor(...colors.primary)
          doc.rect(0, 0, 210, 20, 'F')
          
          doc.setFontSize(14)
          doc.setTextColor(255, 255, 255)
          doc.text('BUDGET TRACKER - CONTINUED', 105, 12, { align: 'center' })
          
          // Reset position for new page
          yPosition = 30
          
          // Add table header to new page
          doc.setFillColor(...colors.dark)
          doc.rect(15, yPosition - 10, 180, 10, 'F')
          
          doc.setFontSize(14)
          doc.setTextColor(255, 255, 255)
          doc.setFont(undefined, 'bold')
          doc.text('RECENT TRANSACTIONS (CONTINUED)', 105, yPosition - 3, { align: 'center' })
          
          // Table headers on new page
          doc.setFillColor(...colors.primary)
          doc.rect(15, yPosition, 180, 8, 'F')
          
          doc.setFontSize(10)
          doc.setTextColor(255, 255, 255)
          doc.text('DATE', 25, yPosition + 6)
          doc.text('CATEGORY', 60, yPosition + 6)
          doc.text('TYPE', 100, yPosition + 6)
          doc.text('AMOUNT', 130, yPosition + 6)
          doc.text('DESCRIPTION', 165, yPosition + 6)
          
          yPosition += 15
        }
      })
      
      // Add decorative footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        
        // Footer background
        doc.setFillColor(...colors.dark)
        doc.rect(0, 285, 210, 12, 'F')
        
        doc.setFontSize(9)
        doc.setTextColor(255, 255, 255)
        doc.text(`Page ${i} of ${pageCount}`, 105, 292, { align: 'center' })
        
        // Add decorative elements to footer
        for (let j = 0; j < 210; j += 10) {
          const color = j % 30 === 0 ? colors.accent1 : 
                       j % 20 === 0 ? colors.accent2 : colors.accent3
          doc.setFillColor(...color)
          doc.rect(j, 283, 10, 2, 'F')
        }
      }
      
      // Save the PDF
      doc.save(`budget-summary-${user.fullname.replace(/\s+/g, '-')}.pdf`)
      
      setIsGeneratingPDF(false)
      showToast('PDF summary generated successfully!', 'success')
    } catch (error) {
      console.error('Error generating PDF:', error)
      setIsGeneratingPDF(false)
      showToast('Failed to generate PDF summary', 'danger')
    }
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
                      <button 
                        className="btn btn-success w-100 mt-3"
                        onClick={generatePDF}
                        disabled={isGeneratingPDF}
                      >
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF Summary'}
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

