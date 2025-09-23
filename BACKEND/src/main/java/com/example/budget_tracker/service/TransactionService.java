package com.example.budget_tracker.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        if (transaction == null) {
            throw new IllegalArgumentException("Transaction cannot be null");
        }
        
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        
        // Find user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
        
        // Validate transaction data
        if (transaction.getAmount() == null) {
            throw new IllegalArgumentException("Transaction amount cannot be null");
        }
        
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDate.now());
        }
        
        if (transaction.getCategory() == null || transaction.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction category cannot be null or empty");
        }
        
        if (transaction.getType() == null || transaction.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction type cannot be null or empty");
        }
        
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }
    
    public List<Transaction> getAllTransactionsByUser(String userEmail) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
        return transactionRepository.findByUserOrderByDateDesc(user);
    }
    
    public List<Transaction> getTransactionsByDateRange(String userEmail, LocalDate startDate, LocalDate endDate) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date cannot be null");
        }
        
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
        return transactionRepository.findByUserAndDateBetween(user, startDate, endDate);
    }
    
    public Map<String, Object> getDashboardSummary(String userEmail) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
        
        List<Transaction> allTransactions = transactionRepository.findByUser(user);
        List<Transaction> incomeTransactions = allTransactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .collect(Collectors.toList());
        
        List<Transaction> expenseTransactions = allTransactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .collect(Collectors.toList());
        
        BigDecimal totalIncome = incomeTransactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpense = expenseTransactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, BigDecimal> categoryExpenses = expenseTransactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("balance", totalIncome.subtract(totalExpense));
        summary.put("categoryExpenses", categoryExpenses);
        summary.put("recentTransactions", allTransactions.stream().limit(5).collect(Collectors.toList()));
        
        return summary;
    }
    
    public void deleteTransaction(Long id, String userEmail) {
        if (id == null) {
            throw new IllegalArgumentException("Transaction ID cannot be null");
        }
        
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
        
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));
        
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You are not authorized to delete this transaction");
        }
        
        transactionRepository.deleteById(id);
    }
}