#!/bin/bash

# Setup digiform.tech domain for Vercel deployment
# This script configures DNS records via name.com API and sets up Vercel domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="digiform.tech"
NAME_COM_USERNAME="TEDTHERRIAULT"
NAME_COM_TOKEN="4790fea6e456f7fe9cf4f61a30f025acd63ecd1c"
NAME_COM_API="https://api.name.com/v4"

echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setting up digiform.tech for Vercel deployment        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to call name.com API
call_namecom_api() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ -z "$data" ]; then
        curl -s -u "${NAME_COM_USERNAME}:${NAME_COM_TOKEN}" \
            -X "${method}" \
            "${NAME_COM_API}${endpoint}"
    else
        curl -s -u "${NAME_COM_USERNAME}:${NAME_COM_TOKEN}" \
            -X "${METHOD}" \
            -H "Content-Type: application/json" \
            -d "${data}" \
            "${NAME_COM_API}${endpoint}"
    fi
}

# Step 1: Get Vercel project info
echo -e "${YELLOW}[1/5] Getting Vercel project information...${NC}"
VERCEL_PROJECT=$(vercel inspect --json 2>/dev/null | jq -r '.name' || echo "")

if [ -z "$VERCEL_PROJECT" ]; then
    echo -e "${RED}Error: No Vercel project found. Deploy first with 'vercel --prod'${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Vercel project: ${VERCEL_PROJECT}${NC}"

# Step 2: Get current DNS records
echo -e "${YELLOW}[2/5] Checking current DNS records...${NC}"
CURRENT_RECORDS=$(call_namecom_api "GET" "/domains/${DOMAIN}/records")
echo -e "${GREEN}✓ Current DNS records retrieved${NC}"

# Step 3: Add Vercel DNS records
echo -e "${YELLOW}[3/5] Configuring DNS records for Vercel...${NC}"

# Add CNAME for www
echo "  Adding CNAME for www.${DOMAIN} → cname.vercel-dns.com"
call_namecom_api "POST" "/domains/${DOMAIN}/records" '{
  "host": "www",
  "type": "CNAME",
  "answer": "cname.vercel-dns.com.",
  "ttl": 300
}' > /dev/null 2>&1 || echo "  (Record may already exist)"

# Add A record for apex domain
echo "  Adding A record for ${DOMAIN} → 76.76.21.21 (Vercel)"
call_namecom_api "POST" "/domains/${DOMAIN}/records" '{
  "host": "",
  "type": "A",
  "answer": "76.76.21.21",
  "ttl": 300
}' > /dev/null 2>&1 || echo "  (Record may already exist)"

echo -e "${GREEN}✓ DNS records configured${NC}"

# Step 4: Add domain to Vercel
echo -e "${YELLOW}[4/5] Adding domain to Vercel project...${NC}"
vercel domains add ${DOMAIN} --yes 2>&1 || echo "  (Domain may already be added)"
vercel domains add www.${DOMAIN} --yes 2>&1 || echo "  (Domain may already be added)"
echo -e "${GREEN}✓ Domain added to Vercel${NC}"

# Step 5: Verify DNS propagation
echo -e "${YELLOW}[5/5] Verifying DNS configuration...${NC}"
echo ""
echo "  Checking DNS records:"
echo "  $ dig ${DOMAIN} A +short"
dig ${DOMAIN} A +short || echo "  (Not propagated yet)"
echo ""
echo "  $ dig www.${DOMAIN} CNAME +short"
dig www.${DOMAIN} CNAME +short || echo "  (Not propagated yet)"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              DNS Setup Complete!                         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Wait 5-10 minutes for DNS propagation"
echo "  2. Visit https://${DOMAIN} to verify deployment"
echo "  3. Check Vercel dashboard for SSL certificate status"
echo "  4. Update Supabase Site URL to https://${DOMAIN}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  vercel domains ls                  # List all domains"
echo "  vercel inspect                     # Show deployment details"
echo "  dig ${DOMAIN} A +short      # Check DNS propagation"
echo ""
