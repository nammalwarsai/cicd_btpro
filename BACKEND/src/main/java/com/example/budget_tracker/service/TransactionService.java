package com.example.budget_tracker.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.budget_tracker.model.Transaction;
import com.example.budget_tracker.model.User;
import com.example.budget_tracker.repository.TransactionRepository;
import com.example.budget_tracker.repository.UserRepository;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Transaction addTransaction(Transaction transaction, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }
    
    public List<Transaction> getAllTransactionsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        return transactionRepository.findByUserOrderByDateDesc(user);
    }
    
    public List<Transaction> getTransactionsByDateRange(String userEmail, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        return transactionRepository.findByUserAndDateBetween(user, startDate, endDate);
    }
    
    public Map<String, Object> getDashboardSummary(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        List<Transaction> allTransactions = transactionRepository.findByUserOrderByDateDesc(user);
        
        // Calculate total income and expenses
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        
        // Category summaries
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        
        // Process all transactions
        for (Transaction transaction : allTransactions) {
            if ("INCOME".equals(transaction.getType())) {
                totalIncome = totalIncome.add(transaction.getAmount());
                
                // Add to income by category
                String category = transaction.getCategory();
                BigDecimal currentAmount = incomeByCategory.getOrDefault(category, BigDecimal.ZERO);
                incomeByCategory.put(category, currentAmount.add(transaction.getAmount()));
            } else if ("EXPENSE".equals(transaction.getType())) {
                totalExpense = totalExpense.add(transaction.getAmount());
                
                // Add to expense by category
                String category = transaction.getCategory();
                BigDecimal currentAmount = expenseByCategory.getOrDefault(category, BigDecimal.ZERO);
                expenseByCategory.put(category, currentAmount.add(transaction.getAmount()));
            }
        }
        
        // Get recent transactions (top 5)
        List<Transaction> recentTransactions = new ArrayList<>();
        int count = 0;
        for (Transaction transaction : allTransactions) {
            if (count < 5) {
                recentTransactions.add(transaction);
                count++;
            } else {
                break;
            }
        }
        
        // Create summary map
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("balance", totalIncome.subtract(totalExpense));
        summary.put("incomeByCategory", incomeByCategory);
        summary.put("expenseByCategory", expenseByCategory);
        summary.put("recentTransactions", recentTransactions);
        
        return summary;
    }
    
    public void deleteTransaction(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        Optional<Transaction> transactionOpt = transactionRepository.findById(id);
        
        if (transactionOpt.isPresent()) {
            Transaction transaction = transactionOpt.get();
            
            // Verify that the transaction belongs to the user
            if (transaction.getUser().getId().equals(user.getId())) {
                transactionRepository.deleteById(id);
            } else {
                throw new RuntimeException("Transaction does not belong to the user");
            }
        } else {
            throw new RuntimeException("Transaction not found with id: " + id);
        }
    }
}