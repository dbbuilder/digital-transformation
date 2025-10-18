# SOW Approval and Generation Guide

## Overview

This guide explains the complete workflow from stakeholder selection through approval tracking to final SOW document generation.

---

## New Features Implemented

### 1. Current Stakeholder Selector

**Component**: `CurrentStakeholderSelector.tsx`

Allows users to simulate "logging in as" a specific stakeholder for testing and demonstration purposes. Since this is an offline-first application with no backend authentication, this component provides a way to:

- Select which stakeholder is currently reviewing the SOW
- Enable approval actions for that stakeholder
- Display stakeholder profile information
- Filter to show only approvers or those with approval authority

**Location**: Shows at the top of the Approval Tracking tab in SOW Preview

**Key Features**:
- Dropdown selector with stakeholder profiles
- Shows avatar, name, title, and approval authority
- Can clear selection to enter "view only" mode
- Info banner when no stakeholder is selected

---

### 2. Final SOW Document Generation

**Service**: `SOWGenerationService.ts`

Generates production-ready SOW documents in multiple formats once all approvals are complete.

**Supported Formats**:

#### PDF Generation
- Professional multi-page PDF document
- Title page with project details
- All 8 SOW sections with formatted content
- Approval signatures page with stakeholder names and comments
- Automatic page breaks and text wrapping

#### PowerPoint Generation
- Executive presentation format
- Title slide with project branding
- One slide per SOW section
- Quality badges (Excellent/Good/Needs Work/Missing)
- Improvement suggestions highlighted
- Approval summary slide

#### Markdown Generation
- Plain text format for version control
- All sections in standard markdown
- Quality indicators
- Improvement suggestions
- Approval placeholder

---

## Complete Workflow

### Step 1: Complete Assessment Questions

Answer all interview questions with sufficient detail to achieve >70% completeness score.

### Step 2: Review SOW Preview

In the **Content Preview** tab:
- Review each of the 8 SOW sections
- Check quality scores (Excellent/Good/Needs Work/Missing)
- Review improvement suggestions
- Address any missing or incomplete sections

When completeness reaches 70%, you'll see:
> ✅ **SOW Content Complete**
>
> You have collected sufficient detail to generate a comprehensive Statement of Work.
> Switch to the Approval Tracking tab to get stakeholder sign-offs before generating the final document.

### Step 3: Select Current Stakeholder

In the **Approval Tracking** tab:

1. Click "Reviewing as:" dropdown
2. Select a stakeholder who has approval authority
3. The system will enable approval actions for that stakeholder

### Step 4: Review and Approve Sections

For each of the 8 SOW sections:

1. Expand the section card to see:
   - Required approvers list
   - Approval history
   - Action buttons (if you need to approve)

2. Click one of the action buttons:
   - **✅ Approve** - Section looks good
   - **🔄 Request Changes** - Needs specific changes (requires comment)
   - **❌ Reject** - Major issues (requires comment)

3. Add comments (optional for approval, required for reject/changes)

4. Confirm action

### Step 5: Track Progress

The approval tracker shows:
- Overall progress percentage
- Count of approved/pending/rejected sections
- Individual section status
- Pending approvers for each section

### Step 6: Generate Final SOW

Once all required sections are approved, the system:

1. Automatically switches to Content Preview tab
2. Shows green success banner:
   > 🎉 **All Approvals Completed!**
   >
   > All required stakeholders have approved the SOW sections. You can now generate the final Statement of Work document.

3. Presents three generation options:
   - **📄 Generate PDF** - Professional document format
   - **📊 Generate PowerPoint** - Executive presentation
   - **📝 Generate Markdown** - Text format for version control

4. Click any format button to:
   - Verify readiness (all approvals complete)
   - Generate the document
   - Automatically download the file
   - Show success confirmation

### Step 7: Download and Share

Generated files are named:
- `SOW_ProjectName_2025-10-18.pdf`
- `SOW_ProjectName_2025-10-18.pptx`
- `SOW_ProjectName_2025-10-18.md`

Files include:
- All SOW section content
- Quality indicators
- Approval history with stakeholder names and comments
- Project metadata (path, phase, date)

---

## Readiness Checks

The system performs automatic readiness checks before generation:

**Checks Performed**:
1. All required sections have approvals
2. No sections are rejected
3. No sections have unresolved change requests

**If Not Ready**:
System shows alert with specific issues:
```
SOW is not ready for generation:

- Executive Summary requires approval
- Current State Assessment was rejected
- Business Drivers has requested changes

Please complete all approvals first.
```

---

## Best Practices

### For Content Creation

**Do**:
✅ Answer questions with specific metrics and details
✅ Include technology versions and quantifiable data
✅ Provide evidence and examples
✅ Review improvement suggestions and address them

**Don't**:
❌ Submit vague or generic answers
❌ Skip high-priority questions
❌ Ignore improvement suggestions

### For Approvals

**Do**:
✅ Select appropriate stakeholder (matches approval authority)
✅ Review section content thoroughly before approving
✅ Provide specific comments when requesting changes
✅ Explain rationale for rejections

**Don't**:
❌ Approve without reading content
❌ Request changes without explaining what needs fixing
❌ Reject without clear justification

### For Final Generation

**Do**:
✅ Ensure all approvals are complete
✅ Review approval comments before generating
✅ Generate multiple formats for different audiences (PDF for executives, PPTX for presentations, Markdown for version control)
✅ Keep generated files for project records

**Don't**:
❌ Generate before all approvals complete (system will block this)
❌ Modify content after approvals without re-approval

---

## Approval Workflow States

### Section-Level States

| State | Icon | Meaning | Actions Available |
|-------|------|---------|-------------------|
| **Pending** | ⏳ | Waiting for approver action | Approve, Request Changes, Reject |
| **Approved** | ✅ | All required approvers signed off | View history |
| **Changes Requested** | 🔄 | Approver wants specific changes | Revise content, resubmit |
| **Rejected** | ❌ | Approver rejected section | Major revision needed |

### Overall SOW States

| State | Description | Next Step |
|-------|-------------|-----------|
| **In Progress** | Some sections still pending approval | Continue getting approvals |
| **Changes Needed** | Some sections have requested changes or rejections | Revise content, get re-approval |
| **Approved** | All required sections approved | Generate final document |

---

## Troubleshooting

### "No stakeholders found for this project"

**Cause**: Project has no stakeholders defined

**Solution**:
1. Go to Team & Stakeholder Management
2. Add stakeholders with approval authority
3. Return to approval tracking

### "Cannot approve - stakeholder not authorized"

**Cause**: Selected stakeholder doesn't have approval authority for this section

**Solution**:
1. Select a different stakeholder who can approve this section type
2. OR update stakeholder profile to add approval authority
3. Retry approval

### Generation button not showing

**Cause**: Not all required approvals are complete

**Solution**:
1. Check Approval Tracking tab
2. Review which sections are still pending
3. Complete all required approvals
4. System will automatically show generation button

### Generated document missing content

**Cause**: SOW sections are incomplete or missing

**Solution**:
1. Return to interview questions
2. Answer more questions to increase completeness
3. Re-generate SOW preview
4. Proceed through approval workflow again

---

## Technical Details

### Files Modified/Created

**New Files**:
- `src/components/approvals/CurrentStakeholderSelector.tsx` (148 lines)
- `src/services/SOWGenerationService.ts` (449 lines)
- `APPROVAL_AND_GENERATION_GUIDE.md` (this file)

**Modified Files**:
- `src/components/assessments/SOWPreviewPanel.tsx`
  - Added current stakeholder state management
  - Implemented SOW generation handlers
  - Enhanced approval completion workflow
  - Added multi-format generation UI

### Dependencies Used

- **jsPDF**: PDF generation
- **PptxGenJS**: PowerPoint generation
- **Dexie.js**: Approval records retrieval
- **Browser Blob API**: File downloads

### Database Queries

Generation process reads from:
- `sowSectionApprovals` - Approval status and records
- `stakeholders` - Approver names and details
- `projects` - Project metadata

---

## Security and Privacy

**Offline-First Design**:
- All approvals stored locally in IndexedDB
- No data transmitted to external servers
- Generated documents created client-side
- File downloads handled by browser

**Stakeholder Selection**:
- "Current stakeholder" is simulation only
- No actual authentication or authorization
- Intended for demonstration and testing
- In production, would integrate with real auth system

---

## Future Enhancements

**Potential Improvements**:
1. Email notifications when approvals needed
2. Approval deadlines and reminders
3. Parallel vs sequential approval workflows
4. Approval templates and checklists
5. Digital signature integration
6. Version history for approved SOWs
7. Diff view for content changes between approvals
8. Export approval audit trail

---

## Summary

The SOW approval and generation system provides a complete workflow:

1. **Content Creation** → Interview responses generate SOW sections
2. **Quality Assessment** → System scores content completeness
3. **Stakeholder Selection** → Choose who is reviewing
4. **Section Approval** → Each section routed to appropriate approvers
5. **Progress Tracking** → Visual dashboard of approval status
6. **Final Generation** → Multi-format document creation
7. **Download & Share** → Professional deliverables

This ensures every SOW is:
- **Comprehensive** - Based on thorough assessment
- **Reviewed** - Validated by appropriate stakeholders
- **Approved** - Signed off by decision-makers
- **Professional** - Formatted for client delivery

---

**Last Updated**: 2025-10-18
