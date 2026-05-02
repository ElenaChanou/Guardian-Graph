#!/bin/bash

# Guardian-Graph Demo - Bug Testing Script
# This script demonstrates the intentional bugs in the order management API

API_URL="http://localhost:3000"

echo "🧪 Guardian-Graph Demo - Testing Intentional Bugs"
echo "=================================================="
echo ""

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "${API_URL}/health" > /dev/null 2>&1; then
    echo "❌ Server is not running. Please start it with: npm run dev"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Test Scenario 1: Amount is 0
echo "📋 Test Scenario 1: Order with amount = 0"
echo "----------------------------------------"
echo "Creating order with amount = 0..."

ORDER1_RESPONSE=$(curl -s -X POST "${API_URL}/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-TEST-001",
    "items": ["free-trial", "promotional-item"],
    "amount": 0
  }')

ORDER1_ID=$(echo $ORDER1_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ORDER1_ID" ]; then
    echo "❌ Failed to create order"
    echo "Response: $ORDER1_RESPONSE"
    exit 1
fi

echo "✅ Order created: $ORDER1_ID"
echo ""
echo "Attempting to process payment (this will crash the server)..."
sleep 1

curl -X POST "${API_URL}/orders/${ORDER1_ID}/process" 2>&1 | head -n 5
echo ""
echo "💥 Expected: Server crash due to division by zero!"
echo ""
sleep 2

# Test Scenario 2: Amount is undefined
echo "📋 Test Scenario 2: Order with undefined amount"
echo "----------------------------------------------"
echo "Creating order without amount field..."

ORDER2_RESPONSE=$(curl -s -X POST "${API_URL}/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-TEST-002",
    "items": ["premium-plan", "enterprise-license"]
  }')

ORDER2_ID=$(echo $ORDER2_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ORDER2_ID" ]; then
    echo "❌ Failed to create order"
    echo "Response: $ORDER2_RESPONSE"
    exit 1
fi

echo "✅ Order created: $ORDER2_ID"
echo ""
echo "Attempting to process payment (this will crash the server)..."
sleep 1

curl -X POST "${API_URL}/orders/${ORDER2_ID}/process" 2>&1 | head -n 5
echo ""
echo "💥 Expected: Server crash due to undefined arithmetic!"
echo ""

echo "=================================================="
echo "🎯 Bug Testing Complete!"
echo ""
echo "Check the server logs to see the crash details."
echo "The error.log file in demo-app/logs/ contains similar production errors."
echo ""
echo "Guardian-Graph can analyze these patterns to identify:"
echo "  • Missing amount validation in POST /orders"
echo "  • Division by zero at line 94 in orders.ts"
echo "  • Unsafe arithmetic operations on undefined values"

# Made with Bob
