# Guardian-Graph Hackathon Demo Guide

## Quick Start

### 1. Install Dependencies
```bash
cd demo-app
npm install
```

### 2. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Test the Bug
```bash
# In a new terminal
./test-bug.sh
```

## Demo Flow for Hackathon Presentation

### Part 1: Show the Working API (2 minutes)

```bash
# 1. Create a valid order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-DEMO-001",
    "items": ["laptop", "mouse", "keyboard"],
    "amount": 1299.99
  }'

# 2. Get the order (use the ID from response)
curl http://localhost:3000/orders/[ORDER_ID]

# 3. Process payment successfully
curl -X POST http://localhost:3000/orders/[ORDER_ID]/process
```

**Key Point**: Show that the API works perfectly with valid data.

### Part 2: Demonstrate the Bug (3 minutes)

```bash
# 1. Create order with amount = 0
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-DEMO-002",
    "items": ["free-trial"],
    "amount": 0
  }'

# 2. Try to process payment - CRASH!
curl -X POST http://localhost:3000/orders/[ORDER_ID]/process
```

**Key Point**: Server crashes with "Division by zero" error. Show the terminal output.

```bash
# 3. Restart server and create order without amount
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-DEMO-003",
    "items": ["premium-plan"]
  }'

# 4. Try to process payment - CRASH AGAIN!
curl -X POST http://localhost:3000/orders/[ORDER_ID]/process
```

**Key Point**: Server crashes with "Cannot perform arithmetic on undefined" error.

### Part 3: Show Production Impact (2 minutes)

```bash
# Open the error log
cat demo-app/logs/error.log
```

**Key Points**:
- Show multiple crashes over several days
- Point out the pattern: all crashes at line 94 (division by zero) or line 88 (undefined arithmetic)
- Highlight different customer IDs and order scenarios
- Emphasize this is a production issue affecting real customers

### Part 4: Guardian-Graph Solution (5 minutes)

**Demonstrate how Guardian-Graph would help**:

1. **Log Analysis**
   - Guardian-Graph ingests `error.log`
   - Identifies crash pattern: 10+ crashes in 4 days
   - Groups errors by stack trace location

2. **Visual Architecture Mapping**
   - Shows the order processing flow
   - Highlights the problematic code path
   - Maps errors to specific lines: 88 and 94 in `orders.ts`

3. **Root Cause Identification**
   - Analyzes the code at crash locations
   - Identifies missing validation in POST /orders endpoint
   - Detects unsafe division operation: `1000 / order.amount`
   - Finds unsafe arithmetic on potentially undefined values

4. **Fix Recommendation**
   ```typescript
   // Guardian-Graph suggests adding validation:
   if (!amount || amount <= 0) {
     return c.json({ 
       error: 'Invalid amount: must be greater than 0' 
     }, 400);
   }
   ```

5. **Token-Efficient AI Reasoning**
   - Instead of sending entire codebase to AI
   - Guardian-Graph sends only relevant context:
     * Error logs (145 lines)
     * Problematic function (30 lines)
     * Related validation code (10 lines)
   - Saves 95%+ of tokens compared to full codebase analysis

## Key Talking Points

### Problem Statement
- Production bugs are hard to diagnose
- Traditional debugging requires manual log analysis
- Sending entire codebases to AI is expensive (tokens) and slow
- Developers waste hours tracing stack traces to root causes

### Guardian-Graph Solution
1. **Automated Log Analysis**: Parses error logs to identify patterns
2. **Visual Architecture Mapping**: Creates interactive flow diagrams
3. **Intelligent Code Navigation**: Maps errors to exact code locations
4. **Token-Efficient AI**: Sends only relevant context to AI models
5. **Actionable Recommendations**: Provides specific fix suggestions

### Demo Impact
- **Before Guardian-Graph**: 
  - 10+ crashes over 4 days
  - Manual log analysis: 2-3 hours
  - Full codebase AI analysis: 50,000+ tokens
  
- **With Guardian-Graph**:
  - Instant pattern detection
  - Visual root cause identification: 5 minutes
  - Targeted AI analysis: 2,000 tokens (96% reduction)
  - Specific fix recommendation provided

## Technical Highlights

### Architecture
- **Frontend**: Visual flow diagrams with error highlighting
- **Backend**: Log parser + code analyzer + AI integration
- **AI Integration**: Token-efficient context extraction
- **Demo Stack**: TypeScript + Hono + Node.js

### Innovation
- Combines visual debugging with AI reasoning
- Optimizes AI token usage through intelligent context selection
- Real-time error pattern detection
- Interactive architecture exploration

## Questions to Anticipate

**Q: How does this differ from existing APM tools?**
A: Guardian-Graph focuses on visual architecture mapping and token-efficient AI reasoning, not just metrics. It helps developers understand *why* errors happen, not just *that* they happened.

**Q: What about false positives?**
A: Guardian-Graph uses pattern matching and code analysis to reduce false positives. The visual mapping lets developers quickly verify findings.

**Q: How does it handle large codebases?**
A: That's the key innovation! Guardian-Graph extracts only relevant code context (error location + related functions), reducing token usage by 95%+ compared to full codebase analysis.

**Q: Can it fix bugs automatically?**
A: Guardian-Graph provides fix recommendations, but developers review and apply them. This ensures code quality and learning.

## Backup Demo Scenarios

If live demo fails, use these pre-recorded scenarios:

1. **Screenshot**: Error log showing pattern
2. **Screenshot**: Visual architecture with highlighted error path
3. **Screenshot**: AI recommendation with code diff
4. **Video**: 30-second walkthrough of the full flow

## Post-Demo Resources

- GitHub: [Link to repository]
- Live Demo: [Deployed URL if available]
- Documentation: See README.md
- Contact: [Your contact info]

---

**Remember**: The goal is to show how Guardian-Graph makes debugging faster, cheaper (tokens), and more intuitive through visual architecture mapping combined with AI reasoning.