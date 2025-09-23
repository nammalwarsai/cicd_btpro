import axios from 'axios';

const API_URL = 'http://localhost:8080/api/transactions';

export const transactionAPI = {
  // Get all transactions for a user
  getAllTransactions: async (userEmail) => {
    try {
      const response = await axios.get(`${API_URL}?userEmail=${userEmail}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },

  // Get dashboard summary data
  getDashboardSummary: async (userEmail) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard?userEmail=${userEmail}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },

  // Add a new transaction
  addTransaction: async (transactionData, userEmail) => {
    if (!transactionData) {
      throw new Error('Transaction data is required');
    }
    
    if (!userEmail) {
      throw new Error('User email is required');
    }
    
    try {
      console.log('Adding transaction:', transactionData, 'for user:', userEmail);
      
      // Validate required fields
      if (!transactionData.category) throw new Error('Category is required');
      if (!transactionData.amount) throw new Error('Amount is required');
      if (!transactionData.type) throw new Error('Transaction type is required');
      
      // Use the correct endpoint URL that matches the backend controller
      const response = await axios.post(`${API_URL}?userEmail=${encodeURIComponent(userEmail)}`, {
        category: transactionData.category,
        amount: parseFloat(transactionData.amount),
        date: transactionData.date || new Date().toISOString().split('T')[0],
        type: transactionData.type,
        description: transactionData.description || ''
      });
      
      console.log('Transaction added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        throw new Error(error.response.data.message || 'Server error: Failed to add transaction');
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Network error: No response from server');
      } else {
        throw error; // Rethrow if it's already a custom error
      }
    }
  },

  // Delete a transaction
  deleteTransaction: async (transactionId, userEmail) => {
    try {
      await axios.delete(`${API_URL}/${transactionId}?userEmail=${userEmail}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete transaction');
    }
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (userEmail, startDate, endDate) => {
    try {
      const response = await axios.get(
        `${API_URL}/date-range?userEmail=${userEmail}&startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions by date range');
    }
  }
};