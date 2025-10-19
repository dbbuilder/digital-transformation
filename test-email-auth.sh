#!/bin/bash
# Test Supabase email authentication by sending a test signup email

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SUPABASE_URL="https://grglttyirzxfdpbyuxut.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZ2x0dHlpcnp4ZmRwYnl1eHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0NjQyODAsImV4cCI6MjA0ODA0MDI4MH0.KZlS7p3CsQFIeFasvR7n8gU4rCjGSYvBWznf8K1Ck-k"
TEST_EMAIL="${1:-info@servicevision.net}"

echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Testing Supabase Email Authentication                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Test email: ${TEST_EMAIL}${NC}"
echo ""

echo -e "${YELLOW}[1/2] Sending signup email...${NC}"

# Attempt to sign up - this will trigger an email
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"${TEST_EMAIL}"'",
    "password": "TestPassword123!",
    "options": {
      "data": {
        "full_name": "Test User",
        "company": "Test Company"
      }
    }
  }')

echo "$RESPONSE" | jq .

if echo "$RESPONSE" | grep -q "error"; then
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error_description // .message // .error')
  if echo "$ERROR_MSG" | grep -q "User already registered"; then
    echo ""
    echo -e "${YELLOW}User already exists. Sending password reset email instead...${NC}"
    
    # Send password reset email
    RESET_RESPONSE=$(curl -s -X POST \
      "${SUPABASE_URL}/auth/v1/recover" \
      -H "apikey: ${SUPABASE_ANON_KEY}" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "'"${TEST_EMAIL}"'"
      }')
    
    echo "$RESET_RESPONSE" | jq .
    
    if echo "$RESET_RESPONSE" | grep -q "error"; then
      echo -e "${RED}Error sending password reset:${NC}"
      echo "$RESET_RESPONSE" | jq .
      exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✓ Password reset email sent successfully!${NC}"
  else
    echo -e "${RED}Error during signup:${NC}"
    echo "$RESPONSE" | jq .
    exit 1
  fi
else
  echo ""
  echo -e "${GREEN}✓ Signup email sent successfully!${NC}"
fi

echo ""
echo -e "${YELLOW}[2/2] Checking email delivery...${NC}"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                Email Test Complete!                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Check ${TEST_EMAIL} inbox for confirmation email"
echo "  2. Email should be from: info@servicevision.net"
echo "  3. Subject: 'Confirm Your Signup' or 'Reset Your Password'"
echo "  4. Click the link to verify email delivery works"
echo ""
echo -e "${YELLOW}If no email arrives within 5 minutes:${NC}"
echo "  - Check spam/junk folder"
echo "  - Verify SendGrid API key is active"
echo "  - Check Supabase logs: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/logs/edge-logs"
echo ""
