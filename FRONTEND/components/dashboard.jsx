import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../src/services/transactionAPI';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Table, 
  Modal
} from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryExpenses: {},
    recentTransactions: []
  });
  
  const [transactions, setTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    description: ''
  });
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Get user from localStorage or use default test user
  const storedUser = localStorage.getItem('user');
  const userEmail = storedUser ? JSON.parse(storedUser).email : 'test@example.com';
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchDashboardData();
    fetchTransactions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await transactionAPI.getDashboardSummary(userEmail);
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await transactionAPI.getAllTransactions(userEmail);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddTransaction = async () => {
    // Validate form data
    if (!newTransaction.category) {
      alert('Please enter a category');
      return;
    }
    
    if (!newTransaction.amount || isNaN(parseFloat(newTransaction.amount)) || parseFloat(newTransaction.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!newTransaction.date) {
      alert('Please enter a valid date');
      return;
    }
    
    try {
      // Convert date string to proper format (yyyy-MM-dd)
      const formattedDate = new Date(newTransaction.date).toISOString().split('T')[0];
      
      // Create transaction data with BigDecimal compatible amount
      const transactionData = {
        category: newTransaction.category,
        amount: parseFloat(newTransaction.amount),
        date: formattedDate,
        type: newTransaction.type,
        description: newTransaction.description || ''
      };
      
      console.log('Sending transaction data:', transactionData);
      const result = await transactionAPI.addTransaction(transactionData, userEmail);
      console.log('Transaction added successfully:', result);
      
      setShowAddModal(false);
      
      // Reset form
      setNewTransaction({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE',
        description: ''
      });
      
      // Refresh data
      fetchDashboardData();
      fetchTransactions();
      
      // Show success message
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionAPI.deleteTransaction(id, userEmail);
      
      // Refresh data
      fetchDashboardData();
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleDateRangeChange = async () => {
    try {
      const data = await transactionAPI.getTransactionsByDateRange(
        userEmail, 
        dateRange.startDate, 
        dateRange.endDate
      );
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
    }
  };

  // Prepare data for Chart.js pie chart
  const pieChartData = {
    labels: Object.keys(summaryData.categoryExpenses || {}),
    datasets: [
      {
        data: Object.values(summaryData.categoryExpenses || {}).map(value => parseFloat(value)),
        backgroundColor: COLORS,
        borderWidth: 1
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Financial Dashboard</h2>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="text-muted">Total Income</Card.Title>
              <Card.Text className="h4">
                ${summaryData.totalIncome.toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="text-muted">Total Expenses</Card.Title>
              <Card.Text className="h4">
                ${summaryData.totalExpense.toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="text-muted">Balance</Card.Title>
              <Card.Text className={`h4 ${summaryData.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                ${summaryData.balance.toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Expense by Category</Card.Title>
              <div style={{ height: '300px' }}>
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <div style={{ height: '300px', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{transaction.category}</td>
                        <td>{transaction.type}</td>
                        <td className={`text-end ${transaction.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                          ${transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Transactions Section */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Transactions</h5>
            <Button 
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              Add Transaction
            </Button>
          </div>
          
          {/* Date Range Filter */}
          <div className="d-flex gap-2 mb-3">
            <Form.Group className="me-2">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="me-2">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </Form.Group>
            <div className="d-flex align-items-end">
              <Button 
                variant="outline-primary"
                onClick={handleDateRangeChange}
              >
                Filter
              </Button>
            </div>
          </div>
          
          {/* Transactions Table */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Type</th>
                <th className="text-end">Amount</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.type}</td>
                  <td 
                    className={`text-end ${transaction.type === 'INCOME' ? 'text-success' : 'text-danger'}`}
                  >
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="text-center">
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Add Transaction Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddTransaction}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;