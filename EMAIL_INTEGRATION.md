# Email Integration - SendGrid Implementation

**Purpose**: Enable consultants to email transformation assessment results, reports, and roadmaps to clients directly from the planning tool.

**Last Updated**: 2025-10-17

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Security Considerations](#security-considerations)
3. [SendGrid Setup](#sendgrid-setup)
4. [Serverless Function Implementation](#serverless-function-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Email Templates](#email-templates)
7. [Usage Workflows](#usage-workflows)
8. [Deployment](#deployment)

---

## 1. Architecture Overview

### The Challenge: Offline-First + Email

Our app is **offline-first** with data in IndexedDB, but email requires:
- Server-side API calls (can't expose SendGrid API key in frontend)
- Internet connectivity
- Secure credential management

### Solution: Hybrid Architecture

```
┌──────────────────────────────────────────┐
│  Browser (Offline-First)                 │
│  ┌────────────────────────────────────┐  │
│  │  React App                         │  │
│  │  • Projects in IndexedDB           │  │
│  │  • Export to JSON/PDF              │  │
│  │  • "Email Results" button          │  │
│  └─────────────┬──────────────────────┘  │
│                │                          │
└────────────────┼──────────────────────────┘
                 │ HTTPS POST
                 │ (only when user clicks "Send Email")
                 ▼
┌────────────────────────────────────────────┐
│  Serverless Function (Cloud)               │
│  ┌──────────────────────────────────────┐  │
│  │  /api/send-assessment                │  │
│  │  • Validates request                 │  │
│  │  • Sanitizes data                    │  │
│  │  • Calls SendGrid API                │  │
│  │  • Returns success/failure           │  │
│  └─────────────┬────────────────────────┘  │
│                │                            │
└────────────────┼────────────────────────────┘
                 │ SendGrid API
                 ▼
┌────────────────────────────────────────────┐
│  SendGrid Service                          │
│  • Sends transactional email              │
│  • Handles deliverability                 │
│  • Provides analytics                     │
└────────────────────────────────────────────┘
```

**Why Serverless?**
- ✅ Secure (API keys in environment variables, not frontend)
- ✅ Scalable (pay per email sent, not per server)
- ✅ Simple (no server maintenance)
- ✅ Fast (cold start <300ms)
- ✅ Free tier (Vercel/Netlify: 100k invocations/month)

---

## 2. Security Considerations

### ⚠️ NEVER DO THIS (Insecure):

```typescript
// ❌ BAD: API key exposed in frontend code
const SENDGRID_API_KEY = 'SG.abc123...' // Anyone can steal this!
await fetch('https://api.sendgrid.com/v3/mail/send', {
  headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}` }
})
```

### ✅ DO THIS (Secure):

```typescript
// ✅ GOOD: Frontend calls our secure serverless function
await fetch('/api/send-assessment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ recipientEmail, assessmentData })
})

// API key is securely stored in serverless function environment
```

### Security Measures

1. **API Key Protection**
   - SendGrid API key stored in environment variables
   - Never committed to git
   - Only accessible to serverless function

2. **Rate Limiting**
   - Max 10 emails per hour per IP address
   - Prevents abuse and spam

3. **Input Validation**
   - Email format validation
   - Data sanitization (prevent XSS)
   - File size limits (max 10 MB attachments)

4. **Authentication** (Optional but recommended)
   - Require user to enter their own email (verify ownership)
   - Send confirmation code before allowing email
   - Track email sends per user

5. **CORS Protection**
   - Only allow requests from your domain
   - Prevent unauthorized sites from using your function

---

## 3. SendGrid Setup

### Step 1: Create SendGrid Account

```bash
# Sign up at https://sendgrid.com (free tier: 100 emails/day)
# Paid tiers: 40k emails/month for $15
```

### Step 2: Verify Sender Identity

**Single Sender Verification** (Free tier):
1. Go to Settings → Sender Authentication
2. Verify your email (e.g., consultant@yourfirm.com)
3. Click verification link in email
4. This email will be the "From" address

**Domain Authentication** (Recommended for production):
1. Settings → Sender Authentication → Authenticate Your Domain
2. Add DNS records (CNAME, TXT) to your domain
3. Improves deliverability (SPF, DKIM, DMARC)
4. Allows sending from any email @yourdomain.com

### Step 3: Create API Key

```bash
# 1. Go to Settings → API Keys
# 2. Click "Create API Key"
# 3. Name: "Transformation Tool Email Integration"
# 4. Permissions: "Full Access" or "Mail Send" only
# 5. Copy the API key (shown only once!)

# Example key (yours will be different):
# SG.abc123xyz789...
```

### Step 4: Test API Key

```bash
# Test with curl
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "consultant@yourfirm.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "Hello from SendGrid!"}]
  }'

# Success response: 202 Accepted
```

---

## 4. Serverless Function Implementation

### Platform Options

| Platform | Free Tier | Cold Start | Setup Difficulty |
|----------|-----------|------------|------------------|
| **Vercel** | 100k invocations/month | ~100ms | Easy ⭐⭐⭐ |
| **Netlify** | 125k invocations/month | ~150ms | Easy ⭐⭐⭐ |
| **Azure Functions** | 1M invocations/month | ~300ms | Medium ⭐⭐ |
| **AWS Lambda** | 1M invocations/month | ~200ms | Hard ⭐ |

**Recommendation: Vercel** (easiest deployment, pairs well with React/Vite)

### Project Structure

```
digital-transformation/
├── app/                          # Frontend (existing)
│   ├── src/
│   └── package.json
├── api/                          # Serverless functions (new)
│   ├── send-assessment.ts
│   ├── send-roadmap.ts
│   └── send-report.ts
├── .env.local                    # Environment variables (git-ignored)
└── vercel.json                   # Deployment config
```

### Implementation: Vercel Serverless Function

**File: `api/send-assessment.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// Rate limiting (simple in-memory, production should use Redis)
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const maxEmailsPerHour = 10

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [])
  }

  const timestamps = rateLimitMap.get(ip)!
  // Remove timestamps older than 1 hour
  const recentTimestamps = timestamps.filter(t => now - t < hour)

  if (recentTimestamps.length >= maxEmailsPerHour) {
    return false // Rate limit exceeded
  }

  recentTimestamps.push(now)
  rateLimitMap.set(ip, recentTimestamps)
  return true
}

// Email validation
function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Main handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // CORS headers (restrict to your domain in production)
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(clientIP as string)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Max 10 emails per hour.'
      })
    }

    // Parse request body
    const {
      recipientEmail,
      recipientName,
      senderEmail,
      senderName,
      projectName,
      assessmentData,
      includeAttachment
    } = req.body

    // Validate required fields
    if (!recipientEmail || !projectName || !assessmentData) {
      return res.status(400).json({
        error: 'Missing required fields: recipientEmail, projectName, assessmentData'
      })
    }

    // Validate email format
    if (!isValidEmail(recipientEmail)) {
      return res.status(400).json({ error: 'Invalid recipient email format' })
    }

    if (senderEmail && !isValidEmail(senderEmail)) {
      return res.status(400).json({ error: 'Invalid sender email format' })
    }

    // Sanitize data (prevent XSS)
    const sanitize = (str: string) => str.replace(/[<>]/g, '')
    const safeProjectName = sanitize(projectName)
    const safeRecipientName = recipientName ? sanitize(recipientName) : 'Stakeholder'
    const safeSenderName = senderName ? sanitize(senderName) : 'Digital Transformation Consultant'

    // Generate email content
    const emailHtml = generateAssessmentEmailHTML({
      recipientName: safeRecipientName,
      senderName: safeSenderName,
      projectName: safeProjectName,
      assessmentData
    })

    const emailText = generateAssessmentEmailText({
      recipientName: safeRecipientName,
      senderName: safeSenderName,
      projectName: safeProjectName,
      assessmentData
    })

    // Prepare email message
    const msg: sgMail.MailDataRequired = {
      to: recipientEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourfirm.com',
        name: safeSenderName
      },
      replyTo: senderEmail || undefined,
      subject: `Digital Transformation Assessment - ${safeProjectName}`,
      text: emailText,
      html: emailHtml,
      attachments: includeAttachment ? [{
        content: Buffer.from(JSON.stringify(assessmentData, null, 2)).toString('base64'),
        filename: `${safeProjectName.replace(/\s+/g, '_')}_Assessment.json`,
        type: 'application/json',
        disposition: 'attachment'
      }] : []
    }

    // Send email via SendGrid
    await sgMail.send(msg)

    // Log success (for monitoring)
    console.log(`Email sent to ${recipientEmail} for project ${safeProjectName}`)

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Assessment email sent successfully'
    })

  } catch (error: any) {
    console.error('SendGrid error:', error)

    // Handle SendGrid-specific errors
    if (error.code === 401) {
      return res.status(500).json({ error: 'Email service configuration error' })
    }

    if (error.code === 403) {
      return res.status(500).json({ error: 'Email service permission error' })
    }

    return res.status(500).json({
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Email template generators
function generateAssessmentEmailHTML(data: {
  recipientName: string
  senderName: string
  projectName: string
  assessmentData: any
}): string {
  const { recipientName, senderName, projectName, assessmentData } = data
  const { phase, tier, completionPercentage, responses } = assessmentData

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Transformation Assessment</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #a687c0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #171717;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .project-name {
      color: #a687c0;
      font-weight: 600;
    }
    .meta {
      background-color: #faf8fc;
      border-left: 4px solid #a687c0;
      padding: 15px;
      margin: 20px 0;
    }
    .meta-item {
      margin: 5px 0;
    }
    .meta-label {
      font-weight: 600;
      color: #525252;
    }
    .progress {
      background-color: #e5e5e5;
      border-radius: 8px;
      height: 24px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress-bar {
      background: linear-gradient(to right, #bfa8d4, #a687c0);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 12px;
    }
    .responses {
      margin: 30px 0;
    }
    .response-item {
      border-left: 2px solid #e5e5e5;
      padding-left: 15px;
      margin: 20px 0;
    }
    .question {
      font-weight: 600;
      color: #262626;
      margin-bottom: 5px;
    }
    .answer {
      color: #525252;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 14px;
      color: #737373;
      text-align: center;
    }
    .button {
      display: inline-block;
      background-color: #a687c0;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Digital Transformation Assessment</h1>
      <p>Project: <span class="project-name">${projectName}</span></p>
    </div>

    <p>Dear ${recipientName},</p>

    <p>
      ${senderName} has completed a digital transformation assessment for
      <strong>${projectName}</strong>. Below is a summary of the findings.
    </p>

    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Phase:</span> ${phase || 'Discovery'}
      </div>
      <div class="meta-item">
        <span class="meta-label">Tier:</span> ${tier || 'All Tiers'}
      </div>
      <div class="meta-item">
        <span class="meta-label">Completion:</span> ${completionPercentage || 0}%
      </div>
    </div>

    <div class="progress">
      <div class="progress-bar" style="width: ${completionPercentage || 0}%">
        ${completionPercentage || 0}% Complete
      </div>
    </div>

    ${responses && responses.length > 0 ? `
      <div class="responses">
        <h2 style="color: #262626; font-size: 18px;">Key Findings</h2>
        ${responses.slice(0, 5).map((r: any) => `
          <div class="response-item">
            <div class="question">${r.question}</div>
            <div class="answer">${r.answer || 'Not answered'}</div>
          </div>
        `).join('')}
        ${responses.length > 5 ? `
          <p style="color: #737373; font-style: italic;">
            + ${responses.length - 5} more responses (see attachment)
          </p>
        ` : ''}
      </div>
    ` : ''}

    <p>
      This assessment is part of the comprehensive digital transformation planning process
      using the proven Four-Corner Framework across five architectural tiers:
      UI/UX, API/Microservices, Data Platform, Cloud Infrastructure, and AI/External Services.
    </p>

    <div class="footer">
      <p>
        Generated by Digital Transformation Planning System<br>
        Offline-First • Privacy-Focused • Consultant-Powered
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateAssessmentEmailText(data: {
  recipientName: string
  senderName: string
  projectName: string
  assessmentData: any
}): string {
  const { recipientName, senderName, projectName, assessmentData } = data
  const { phase, tier, completionPercentage, responses } = assessmentData

  return `
DIGITAL TRANSFORMATION ASSESSMENT
Project: ${projectName}

Dear ${recipientName},

${senderName} has completed a digital transformation assessment for ${projectName}.
Below is a summary of the findings.

ASSESSMENT DETAILS
Phase: ${phase || 'Discovery'}
Tier: ${tier || 'All Tiers'}
Completion: ${completionPercentage || 0}%

${responses && responses.length > 0 ? `
KEY FINDINGS

${responses.slice(0, 5).map((r: any, i: number) => `
${i + 1}. ${r.question}
   ${r.answer || 'Not answered'}
`).join('\n')}

${responses.length > 5 ? `(+ ${responses.length - 5} more responses - see attachment)\n` : ''}
` : ''}

This assessment is part of the comprehensive digital transformation planning process
using the proven Four-Corner Framework across five architectural tiers:
UI/UX, API/Microservices, Data Platform, Cloud Infrastructure, and AI/External Services.

---
Generated by Digital Transformation Planning System
Offline-First • Privacy-Focused • Consultant-Powered
  `.trim()
}
```

### Environment Variables

**File: `.env.local`** (DO NOT COMMIT TO GIT)

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=consultant@yourfirm.com
SENDGRID_FROM_NAME=Digital Transformation Team

# Security
ALLOWED_ORIGIN=https://yourdomain.com
# For local development, use: http://localhost:5173

# Environment
NODE_ENV=development
```

**File: `.gitignore`**

```
# Environment variables (NEVER COMMIT)
.env.local
.env.production.local
.env

# Vercel
.vercel
```

---

## 5. Frontend Integration

### Install Dependencies

```bash
cd app
npm install @vercel/node @sendgrid/mail
```

### React Component: Email Dialog

**File: `app/src/components/EmailDialog.tsx`**

```typescript
import { useState } from 'react'

interface EmailDialogProps {
  projectName: string
  assessmentData: any
  onClose: () => void
}

export function EmailDialog({ projectName, assessmentData, onClose }: EmailDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [includeAttachment, setIncludeAttachment] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    setError('')
    setSending(true)

    try {
      const response = await fetch('/api/send-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          senderEmail,
          senderName,
          projectName,
          assessmentData,
          includeAttachment
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Failed to send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          Email Assessment Results
        </h2>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-neutral-900">Email sent successfully!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="client@example.com"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="John Smith"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Your Email (Reply-To)
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="consultant@yourfirm.com"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Jane Consultant"
                className="input w-full"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="attachment"
                checked={includeAttachment}
                onChange={(e) => setIncludeAttachment(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="attachment" className="ml-2 text-sm text-neutral-700">
                Include JSON attachment
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSend}
                disabled={sending || !recipientEmail}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Email'}
              </button>
              <button
                onClick={onClose}
                disabled={sending}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Usage in Assessment Component

```typescript
import { useState } from 'react'
import { EmailDialog } from './EmailDialog'

function AssessmentPage() {
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  return (
    <div>
      {/* Assessment content */}

      <button
        onClick={() => setShowEmailDialog(true)}
        className="btn-primary"
      >
        📧 Email Results to Client
      </button>

      {showEmailDialog && (
        <EmailDialog
          projectName="Acme Corp Transformation"
          assessmentData={{
            phase: 'Discovery',
            tier: 'UI',
            completionPercentage: 85,
            responses: [/* ... */]
          }}
          onClose={() => setShowEmailDialog(false)}
        />
      )}
    </div>
  )
}
```

---

## 6. Email Templates

### Template Types

1. **Assessment Results** (implemented above)
2. **Roadmap Summary** (upcoming)
3. **Executive Summary** (upcoming)
4. **Weekly Status Report** (upcoming)

### Roadmap Email Template

```typescript
// api/send-roadmap.ts
function generateRoadmapEmailHTML(data: {
  recipientName: string
  projectName: string
  roadmapData: any
}): string {
  const { recipientName, projectName, roadmapData } = data
  const { totalWeeks, startDate, phases } = roadmapData

  return `
<!-- Similar HTML structure -->
<h1>Transformation Roadmap - ${projectName}</h1>
<p>Dear ${recipientName},</p>
<p>Here is your ${totalWeeks}-week digital transformation roadmap.</p>

<div class="timeline">
  ${phases.map((phase: any) => `
    <div class="phase">
      <h3>${phase.name}</h3>
      <p>Duration: ${phase.duration} weeks</p>
      <p>Deliverables: ${phase.deliverables.join(', ')}</p>
    </div>
  `).join('')}
</div>
  `
}
```

---

## 7. Usage Workflows

### Workflow 1: Send Assessment After Interview

```
1. Consultant completes assessment interview
2. Reviews responses for completeness
3. Clicks "Email Results" button
4. Fills in client email, name
5. Optionally includes JSON attachment
6. Clicks "Send"
7. Serverless function validates and sends via SendGrid
8. Client receives professional HTML email
9. Consultant gets confirmation
```

### Workflow 2: Send Weekly Status Updates

```
1. Consultant marks weekly progress
2. System auto-generates status summary
3. Clicks "Send Weekly Update"
4. Pre-filled with stakeholder emails
5. Reviews email preview
6. Clicks "Send to All"
7. All stakeholders receive update
```

### Workflow 3: Send Final Roadmap

```
1. Consultant finalizes 32-week roadmap
2. Exports to PDF and JSON
3. Clicks "Email Roadmap"
4. Adds executive summary notes
5. Selects recipients (steering committee)
6. Attaches PDF + Excel roadmap
7. Sends with one click
```

---

## 8. Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project (from root of digital-transformation/)
vercel link

# 4. Set environment variables in Vercel dashboard
# Go to: https://vercel.com/your-project/settings/environment-variables
# Add:
#   SENDGRID_API_KEY = SG.your_key_here
#   SENDGRID_FROM_EMAIL = consultant@yourfirm.com
#   ALLOWED_ORIGIN = https://your-domain.vercel.app

# 5. Deploy
vercel --prod

# Your app will be live at: https://your-project.vercel.app
```

### Vercel Configuration

**File: `vercel.json`**

```json
{
  "buildCommand": "cd app && npm run build",
  "outputDirectory": "app/dist",
  "devCommand": "cd app && npm run dev",
  "installCommand": "cd app && npm install",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Testing Production

```bash
# Send test email
curl -X POST https://your-project.vercel.app/api/send-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "test@example.com",
    "projectName": "Test Project",
    "assessmentData": {
      "phase": "Discovery",
      "completionPercentage": 100,
      "responses": []
    }
  }'

# Expected response:
# { "success": true, "message": "Assessment email sent successfully" }
```

---

## 9. Monitoring & Analytics

### SendGrid Analytics Dashboard

Track email performance:
- **Delivery Rate**: % of emails delivered
- **Open Rate**: % of emails opened
- **Click Rate**: % of links clicked
- **Bounce Rate**: % of failed deliveries
- **Spam Reports**: Complaints

Access at: https://app.sendgrid.com/statistics

### Vercel Function Logs

Monitor function performance:
- **Invocations**: Total API calls
- **Errors**: Failed requests
- **Duration**: Average response time
- **Bandwidth**: Data transferred

Access at: https://vercel.com/your-project/logs

### Error Alerting

Set up alerts for:
- SendGrid API errors (quota exceeded, auth failures)
- Rate limit violations (abuse detection)
- High bounce rates (email deliverability issues)

---

## 10. Cost Estimates

### SendGrid Pricing

| Plan | Emails/Month | Price/Month | Best For |
|------|--------------|-------------|----------|
| **Free** | 100/day (3,000/month) | $0 | Testing, small projects |
| **Essentials** | 40,000 | $15 | Small consultancies |
| **Pro** | 100,000 | $60 | Growing firms |
| **Premier** | Custom | Custom | Enterprise |

### Vercel Pricing

| Plan | Invocations | Bandwidth | Price |
|------|-------------|-----------|-------|
| **Hobby** | 100k/month | 100 GB | $0 |
| **Pro** | 1M/month | 1 TB | $20 |

### Estimated Monthly Costs

**Small Consultancy** (10 active projects):
- 200 assessment emails/month
- 40 roadmap emails/month
- Total: 240 emails/month
- **Cost: $0** (SendGrid Free tier)
- **Cost: $0** (Vercel Hobby tier)

**Medium Consultancy** (50 active projects):
- 1,000 assessment emails/month
- 200 roadmap emails/month
- Total: 1,200 emails/month
- **Cost: $15** (SendGrid Essentials)
- **Cost: $0** (Vercel Hobby tier)

**Total: $15/month for 50 projects**

---

## 11. Security Checklist

Before going live, verify:

- ✅ SendGrid API key stored in environment variables (not in code)
- ✅ `.env.local` added to `.gitignore`
- ✅ CORS restricted to your domain only
- ✅ Rate limiting enabled (10 emails/hour per IP)
- ✅ Email validation (regex check)
- ✅ Input sanitization (prevent XSS)
- ✅ File size limits (max 10 MB)
- ✅ HTTPS only (no HTTP)
- ✅ SendGrid domain authentication configured
- ✅ Monitoring and alerting set up

---

## 12. Troubleshooting

### Common Issues

**Issue: "401 Unauthorized" error**
```
Solution: Check SendGrid API key is correct in environment variables
Verify key has "Mail Send" permission
```

**Issue: "Rate limit exceeded"**
```
Solution: Reduce email frequency or increase rate limit in code
Consider upgrading SendGrid plan
```

**Issue: Emails going to spam**
```
Solution: Set up SendGrid domain authentication (SPF, DKIM, DMARC)
Ask recipients to whitelist your sender email
```

**Issue: "CORS error" in browser**
```
Solution: Check ALLOWED_ORIGIN environment variable matches your domain
Ensure serverless function sets proper CORS headers
```

---

## Next Steps

1. **Set up SendGrid account** (free tier)
2. **Implement serverless function** (`api/send-assessment.ts`)
3. **Add EmailDialog component** to frontend
4. **Deploy to Vercel**
5. **Test with real emails**
6. **Add roadmap and report email templates**
7. **Set up monitoring and alerts**

---

**Ready to connect your offline-first planning tool to the world via email!** 📧
