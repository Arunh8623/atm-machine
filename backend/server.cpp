#define CPPHTTPLIB_USE_POLL

#include "httplib.h"
#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>
#include <vector>
#include <algorithm>
#include <map>
#include <limits>

using namespace httplib;

// Structure to store denomination breakdown
struct DenominationResult {
    std::map<int, int> notes;
    int totalNotes;
    bool isValid;
    std::string method;
    std::string error;
};

// Greedy Algorithm for ATM Cash Dispenser
DenominationResult greedyDispense(int amount) {
    DenominationResult result;
    result.totalNotes = 0;
    result.isValid = true;
    result.method = "Greedy";
    
    std::vector<int> denominations = {2000, 500, 100};
    int remaining = amount;
    
    for (int denom : denominations) {
        if (remaining >= denom) {
            int count = remaining / denom;
            result.notes[denom] = count;
            result.totalNotes += count;
            remaining = remaining % denom;
        }
    }
    
    // Check if greedy solution is valid
    if (remaining != 0) {
        result.isValid = false;
        result.error = "Cannot dispense exact amount using available denominations";
    }
    
    return result;
}

// Dynamic Programming Algorithm (Fallback)
DenominationResult dpDispense(int amount) {
    DenominationResult result;
    result.method = "Dynamic Programming";
    
    std::vector<int> denominations = {2000, 500, 100};
    std::vector<int> dp(amount + 1, INT_MAX);
    std::vector<int> usedDenom(amount + 1, -1);
    
    dp[0] = 0;
    
    // Fill DP table
    for (int i = 1; i <= amount; i++) {
        for (int denom : denominations) {
            if (denom <= i && dp[i - denom] != INT_MAX) {
                if (dp[i - denom] + 1 < dp[i]) {
                    dp[i] = dp[i - denom] + 1;
                    usedDenom[i] = denom;
                }
            }
        }
    }
    
    // Check if solution exists
    if (dp[amount] == INT_MAX) {
        result.isValid = false;
        result.error = "Cannot dispense exact amount using available denominations";
        result.totalNotes = 0;
        return result;
    }
    
    // Reconstruct solution
    result.isValid = true;
    result.totalNotes = dp[amount];
    int curr = amount;
    
    while (curr > 0) {
        int denom = usedDenom[curr];
        result.notes[denom]++;
        curr -= denom;
    }
    
    return result;
}

// Main dispense function with Greedy first, DP fallback
DenominationResult dispense(int amount) {
    std::cout << "\n=== ATM Dispense Request ===" << std::endl;
    std::cout << "Amount: ₹" << amount << std::endl;
    
    // Try Greedy first
    DenominationResult greedyResult = greedyDispense(amount);
    
    if (greedyResult.isValid) {
        std::cout << "✓ Greedy algorithm successful" << std::endl;
        std::cout << "Total notes: " << greedyResult.totalNotes << std::endl;
        return greedyResult;
    }
    
    std::cout << "✗ Greedy failed, trying Dynamic Programming..." << std::endl;
    
    // Fallback to DP
    DenominationResult dpResult = dpDispense(amount);
    
    if (dpResult.isValid) {
        std::cout << "✓ DP algorithm successful" << std::endl;
        std::cout << "Total notes: " << dpResult.totalNotes << std::endl;
    } else {
        std::cout << "✗ DP also failed - invalid amount" << std::endl;
    }
    
    return dpResult;
}

// Helper function to extract JSON number
int extractAmount(const std::string& json) {
    std::string search = "\"amount\":";
    size_t start = json.find(search);
    if (start == std::string::npos) return 0;
    start += search.length();
    
    while (start < json.length() && (json[start] == ' ' || json[start] == '\t')) {
        start++;
    }
    
    size_t end = start;
    while (end < json.length() && json[end] >= '0' && json[end] <= '9') {
        end++;
    }
    
    std::string numStr = json.substr(start, end - start);
    return std::stoi(numStr);
}

int main() {
    Server svr;

    // Enable CORS
    svr.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Methods", "GET, POST, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type"}
    });

    svr.Options("/dispense", [](const Request& req, Response& res) {
        res.status = 200;
    });

    // ATM Dispense endpoint
    svr.Post("/dispense", [](const Request& req, Response& res) {
        try {
            std::string body = req.body;
            std::cout << "\nReceived: " << body << std::endl;
            
            int amount = extractAmount(body);
            
            // Validation
            if (amount <= 0) {
                throw std::runtime_error("Amount must be greater than 0");
            }
            
            if (amount % 100 != 0) {
                throw std::runtime_error("Amount must be multiple of ₹100");
            }
            
            if (amount > 50000) {
                throw std::runtime_error("Maximum withdrawal limit is ₹50,000");
            }
            
            // Process dispensing
            DenominationResult result = dispense(amount);
            
            if (!result.isValid) {
                throw std::runtime_error(result.error);
            }
            
            // Build JSON response
            std::ostringstream json;
            json << "{";
            json << "\"success\":true,";
            json << "\"amount\":" << amount << ",";
            json << "\"totalNotes\":" << result.totalNotes << ",";
            json << "\"method\":\"" << result.method << "\",";
            json << "\"denominations\":{";
            
            bool first = true;
            for (auto it = result.notes.rbegin(); it != result.notes.rend(); ++it) {
                if (!first) json << ",";
                json << "\"" << it->first << "\":" << it->second;
                first = false;
            }
            
            json << "}}";
            
            res.set_content(json.str(), "application/json");
            std::cout << "Response: " << json.str() << std::endl;
            
        } catch (const std::exception& e) {
            std::cout << "Error: " << e.what() << std::endl;
            std::ostringstream error_json;
            error_json << "{\"success\":false,\"error\":\"" << e.what() << "\"}";
            res.set_content(error_json.str(), "application/json");
            res.status = 400;
        }
    });

    svr.Get("/", [](const Request& req, Response& res) {
        res.set_content("ATM Cash Dispenser API is running!", "text/plain");
    });

    std::cout << "========================================" << std::endl;
    std::cout << "    ATM Cash Dispenser Backend" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "Server: http://localhost:8081" << std::endl;
    std::cout << "Denominations: ₹2000, ₹500, ₹100" << std::endl;
    std::cout << "Algorithm: Greedy → DP (fallback)" << std::endl;
    std::cout << "========================================\n" << std::endl;
    
    svr.listen("0.0.0.0", 8081);

    return 0;
}