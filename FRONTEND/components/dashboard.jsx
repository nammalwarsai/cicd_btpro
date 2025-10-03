import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../src/services/transactionAPI';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Fade,
  Grow,
  Alert,
  Stack,
  Divider,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Add,
  Delete,
  FilterList,
  CalendarToday,
  Category,
  AttachMoney,
  Description,
  Assessment
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);
const MotionPaper = motion(Paper);

const Dashboard = () => {
  const theme = useTheme();
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

  const [categoryFilter, setCategoryFilter] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalFilteredAmount, setTotalFilteredAmount] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Get user from localStorage or use default test user
  const storedUser = localStorage.getItem('user');
  const userEmail = storedUser ? JSON.parse(storedUser).email : 'test@example.com';

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
      setSuccessMessage('Please enter a category');
      return;
    }

    if (!newTransaction.amount || isNaN(parseFloat(newTransaction.amount)) || parseFloat(newTransaction.amount) <= 0) {
      setSuccessMessage('Please enter a valid amount');
      return;
    }

    if (!newTransaction.date) {
      setSuccessMessage('Please enter a valid date');
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
      setSuccessMessage('Transaction added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding transaction:', error);
      setSuccessMessage('Failed to add transaction: ' + (error.message || 'Unknown error'));
      setTimeout(() => setSuccessMessage(''), 3000);
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

  const handleCategoryFilter = () => {
    if (!categoryFilter) {
      setFilteredExpenses([]);
      setTotalFilteredAmount(0);
      return;
    }

    // Filter transactions by selected category and type EXPENSE
    const filtered = transactions.filter(
      transaction => transaction.category === categoryFilter && transaction.type === 'EXPENSE'
    );

    setFilteredExpenses(filtered);

    // Calculate total amount for filtered expenses
    const total = filtered.reduce((sum, transaction) => sum + transaction.amount, 0);
    setTotalFilteredAmount(total);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Success Message */}
        {successMessage && (
          <Fade in={!!successMessage}>
            <Alert
              severity={successMessage.includes('success') ? 'success' : 'error'}
              sx={{ mb: 3 }}
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          </Fade>
        )}

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Financial Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Track your income and expenses with ease
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <MotionCard
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5, delay: 0.1 }}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                overflow: 'visible',
                position: 'relative'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Income
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      ₹{summaryData.totalIncome.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <TrendingUp sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionCard
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                overflow: 'visible'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Expenses
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      ₹{summaryData.totalExpense.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <TrendingDown sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionCard
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5, delay: 0.3 }}
              sx={{
                background: summaryData.balance >= 0
                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                overflow: 'visible'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Balance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      ₹{summaryData.balance.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <AccountBalance sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <MotionPaper
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Income vs Expenses
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <BarChart
                  series={[
                    { data: [summaryData.totalIncome], label: 'Income', color: '#667eea' },
                    { data: [summaryData.totalExpense], label: 'Expenses', color: '#f5576c' }
                  ]}
                  xAxis={[{ scaleType: 'band', data: ['Overview'] }]}
                  height={300}
                />
              </Box>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <MotionPaper
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                height: '100%'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Activity
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                <Stack spacing={2}>
                  {summaryData.recentTransactions.map((transaction, index) => (
                    <Grow key={transaction.id} in timeout={300 + index * 100}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: alpha(transaction.type === 'INCOME' ? '#667eea' : '#f5576c', 0.1),
                          borderLeft: 4,
                          borderColor: transaction.type === 'INCOME' ? '#667eea' : '#f5576c'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {transaction.category}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transaction.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip
                            label={`₹${transaction.amount.toFixed(2)}`}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              bgcolor: transaction.type === 'INCOME' ? '#667eea' : '#f5576c',
                              color: 'white'
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grow>
                  ))}
                </Stack>
              </Box>
            </MotionPaper>
          </Grid>
        </Grid>

        {/* Category Filter Section */}
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Category sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Expense Category Filter
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={10}>
              <FormControl fullWidth>
                <InputLabel>Select Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Select Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">Select a category</MenuItem>
                  {[...new Set(transactions
                    .filter(t => t.type === 'EXPENSE')
                    .map(t => t.category))]
                    .map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterList />}
                onClick={handleCategoryFilter}
                sx={{
                  height: 56,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>

          {filteredExpenses.length > 0 && (
            <Fade in>
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Total spent on <strong>{categoryFilter}</strong>: <strong>₹{totalFilteredAmount.toFixed(2)}</strong>
                </Alert>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Description</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>{expense.description || '-'}</TableCell>
                          <TableCell align="right" sx={{ color: '#f5576c', fontWeight: 600 }}>
                            ₹{expense.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Fade>
          )}

          {categoryFilter && filteredExpenses.length === 0 && (
            <Alert severity="info">
              No expenses found for the selected category.
            </Alert>
          )}
        </MotionPaper>

        {/* Transactions Section */}
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              All Transactions
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddModal(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.6)'
                }
              }}
            >
              Add Transaction
            </Button>
          </Box>

          {/* Date Range Filter */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={handleDateRangeChange}
                sx={{ height: 56 }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>

          {/* Transactions Table */}
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <Grow key={transaction.id} in timeout={300 + index * 50}>
                    <TableRow hover>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          size="small"
                          color={transaction.type === 'INCOME' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: transaction.type === 'INCOME' ? '#667eea' : '#f5576c',
                          fontWeight: 600
                        }}
                      >
                        ₹{transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha('#f5576c', 0.1)
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </Grow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MotionPaper>

        {/* Add Transaction Modal */}
        <Dialog
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600
          }}>
            Add New Transaction
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTransaction.type}
                  label="Type"
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                >
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENSE">Expense</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Category"
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                InputProps={{
                  startAdornment: <Category sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Amount"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              <TextField
                fullWidth
                type="date"
                label="Date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                InputProps={{
                  startAdornment: <Description sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setShowAddModal(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTransaction}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                px: 4
              }}
            >
              Add Transaction
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;