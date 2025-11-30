# GRAPTS Firestore Database Schema

## Collections

### projects

- `id` (document ID)
- `name` (string) - Project name
- `description` (string) - Project description
- `budget` (number) - Total budget allocation
- `location` (string) - Geographic location
- `startDate` (string) - ISO date
- `endDate` (string) - ISO date
- `status` (string) - "Pending", "In Progress", "Completed"
- `createdBy` (string) - User UID
- `createdAt` (timestamp)
- `allocatedFunds` (number)
- `usedFunds` (number)

### milestones

- `id` (document ID)
- `projectId` (string) - Reference to project
- `title` (string)
- `description` (string)
- `targetDate` (string) - ISO date
- `budget` (number)
- `status` (string) - "Pending", "In Progress", "In Review", "Completed"
- `createdBy` (string) - User UID
- `createdAt` (timestamp)
- `verificationNotes` (string)
- `proofDocuments` (array) - Storage URLs

### disbursements

- `id` (document ID)
- `projectId` (string) - Reference to project
- `amount` (number)
- `description` (string)
- `recipient` (string)
- `status` (string) - "Pending", "Approved", "Rejected"
- `createdBy` (string) - User UID
- `createdAt` (timestamp)
- `approvedBy` (string) - User UID
- `approvedAt` (timestamp)

### issues

- `id` (document ID)
- `projectId` (string) - Reference to project
- `title` (string)
- `description` (string)
- `category` (string) - Type of issue
- `status` (string) - "Open", "In Review", "Resolved"
- `createdBy` (string) - User UID
- `createdByRole` (string) - Role of creator
- `createdAt` (timestamp)
- `resolvedAt` (timestamp)
- `resolutionNotes` (string)

### audit_logs

- `id` (document ID)
- `action` (string) - "CREATE", "UPDATE", "DELETE", "APPROVE"
- `entity` (string) - "project", "milestone", "disbursement", "issue"
- `entityId` (string)
- `userId` (string) - User who performed action
- `userRole` (string)
- `details` (object) - Additional context
- `timestamp` (timestamp)
- `hash` (string) - SHA-256 hash of log entry
- `previousHash` (string) - Hash of previous log entry

### documents

- `id` (document ID)
- `projectId` (string) - Reference to project
- `milestoneId` (string) - Reference to milestone (if applicable)
- `fileName` (string)
- `storagePath` (string) - Path in Firebase Storage
- `fileType` (string) - "contract", "proof", "report", etc.
- `uploadedBy` (string) - User UID
- `uploadedAt` (timestamp)
- `description` (string)

## Indexes

Recommended indexes in Firestore:

- `projects.createdAt` (descending)
- `disbursements.projectId + status`
- `milestones.projectId + status`
- `audit_logs.timestamp + entity`

These can be created automatically by Firestore when you run queries.
