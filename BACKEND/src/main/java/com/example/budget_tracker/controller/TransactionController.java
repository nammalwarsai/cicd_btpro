package com.example.budget_tracker.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.budget_tracker.model.Transaction;
import com.example.budget_tracker.service.TransactionService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;
    
    @PostMapping
    public ResponseEntity<Transaction> addTransaction(@RequestBody Transaction transaction,
                                                     @RequestParam String userEmail) {
        try {
            System.out.println("Received transaction: " + transaction + " for user: " + userEmail);
            Transaction savedTransaction = transactionService.addTransaction(transaction, userEmail);
            System.out.println("Saved transaction: " + savedTransaction);
            return ResponseEntity.ok(savedTransaction);
        } catch (Exception e) {
            System.err.println("Error adding transaction: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(@RequestParam String userEmail) {
        List<Transaction> transactions = transactionService.getAllTransactionsByUser(userEmail);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam String userEmail,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Transaction> transactions = transactionService.getTransactionsByDateRange(userEmail, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@RequestParam String userEmail) {
        Map<String, Object> summary = transactionService.getDashboardSummary(userEmail);
        return ResponseEntity.ok(summary);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id, @RequestParam String userEmail) {
        transactionService.deleteTransaction(id, userEmail);
        return ResponseEntity.ok().build();
    }
}