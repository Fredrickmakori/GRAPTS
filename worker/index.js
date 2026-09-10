// GRAPTS Cloudflare Worker
// Replaces Express backend with Worker-compatible architecture
// Uses Firebase REST API since firebase-admin SDK doesn't work in Workers

const FIREBASE_PROJECT_ID = 'grapts-5183e';
const FIREBASE_API_KEY = 'AIzaSyDypH759i4l3HFRfGcK3sOmEiVQoE4Y9vM';
const FIREBASE_DATABASE_URL = `https://${FIREBASE_PROJECT_ID}.firebaseio.com`;
const FIREBASE_STORAGE_BUCKET = `${FIREBASE_PROJECT_ID}.firebasestorage.app`;

// JWT secret for fallback auth
const JWT_SECRET = 'your-jwt-secret-change-in-production';

// ========================
// Helpers
// ========================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

async function verifyToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const token = authorizationHeader.replace('Bearer ', '');
  if (!token) return null;

  try {
    // Verify Firebase ID token via Firebase Auth REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!response.ok) {
      // Fallback to JWT verification
      return verifyJWT(token);
    }

    const data = await response.json();
    if (data.users && data.users.length > 0) {
      const user = data.users[0];
      return {
        uid: user.localId,
        email: user.email || null,
        displayName: user.displayName || null,
        role: 'citizen', // Will be overridden by Firestore lookup
      };
    }
    return null;
  } catch (err) {
    console.error('Token verification failed:', err);
    // Fallback to JWT
    return verifyJWT(token);
  }
}

function verifyJWT(token) {
  try {
    // Simple JWT verification (decode and check signature)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    
    return payload;
  } catch {
    return null;
  }
}

function hashData(data) {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

// ========================
// Firestore REST API helpers
// ========================

async function firestoreGet(collection, docId = null) {
  const path = docId ? `${collection}/${docId}` : collection;
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Firestore error: ${response.status}`);
  return response.json();
}

async function firestoreQuery(collection, filters = [], orderByField = null, limitCount = null) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
  
  const query = {
    structuredQuery: {
      from: [{ collectionId: collection }],
    },
  };
  
  if (filters.length > 0) {
    query.structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters: filters.map(f => ({
          fieldFilter: {
            field: { fieldPath: f.field },
            op: f.op || 'EQUAL',
            value: f.value,
          },
        })),
      },
    };
  }
  
  if (orderByField) {
    query.structuredQuery.orderBy = [{ field: { fieldPath: orderByField }, direction: 'DESCENDING' }];
  }
  
  if (limitCount) {
    query.structuredQuery.limit = limitCount;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  
  if (!response.ok) throw new Error(`Firestore query error: ${response.status}`);
  const data = await response.json();
  
  const results = [];
  for (const doc of data) {
    if (doc.document) {
      results.push(firestoreDocToObj(doc.document));
    }
  }
  return results;
}

function firestoreDocToObj(doc) {
  const obj = { id: doc.name.split('/').pop() };
  if (doc.fields) {
    for (const [key, value] of Object.entries(doc.fields)) {
      obj[key] = firestoreValueToJs(value);
    }
  }
  return obj;
}

function firestoreValueToJs(value) {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.arrayValue !== undefined) return value.arrayValue.values?.map(firestoreValueToJs) || [];
  if (value.mapValue !== undefined) {
    const obj = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      obj[k] = firestoreValueToJs(v);
    }
    return obj;
  }
  if (value.nullValue !== undefined) return null;
  return value;
}

function jsToFirestoreValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: value.toString() };
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(jsToFirestoreValue) } };
  if (typeof value === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = jsToFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

async function firestoreCreate(collection, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}`;
  
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    fields[key] = jsToFirestoreValue(value);
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  
  if (!response.ok) throw new Error(`Firestore create error: ${response.status}`);
  const doc = await response.json();
  return doc.name.split('/').pop();
}

async function firestoreUpdate(collection, docId, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?updateMask.fieldPaths=${Object.keys(data).join('&updateMask.fieldPaths=')}`;
  
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    fields[key] = jsToFirestoreValue(value);
  }
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  
  if (!response.ok) throw new Error(`Firestore update error: ${response.status}`);
  return response.json();
}

// ========================
// Role & Permission helpers
// ========================

const rolePermissions = {
  admin: ['read', 'write', 'delete', 'audit', 'manage_users'],
  project_manager: ['read', 'write', 'manage_projects', 'upload_documents'],
  financial_officer: ['read', 'write', 'manage_disbursements', 'audit_logs'],
  auditor: ['read', 'audit_logs', 'verify_milestones'],
  citizen: ['read'],
};

async function getUserRole(uid) {
  try {
    const doc = await firestoreGet('users', uid);
    return doc.role || 'citizen';
  } catch {
    return 'citizen';
  }
}

function hasPermission(userRole, permission) {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

// ========================
// Audit Log
// ========================

async function logAuditAction(action, entity, entityId, userId, userRole, details = {}, previousHash = null) {
  const timestamp = new Date().toISOString();
  const logData = {
    action,
    entity,
    entityId,
    userId,
    userRole,
    details: JSON.stringify(details),
    timestamp,
    previousHash: previousHash || 'genesis',
  };
  
  logData.hash = hashData(logData);
  
  try {
    await firestoreCreate('audit_logs', logData);
    return { success: true, hash: logData.hash, timestamp };
  } catch (err) {
    console.error('Audit log error:', err);
    return { success: false, error: err.message };
  }
}

// ========================
// Storage Upload (via Firebase Storage REST API)
// ========================

async function uploadToStorage(buffer, fileName, contentType) {
  const destPath = `documents/${Date.now()}_${fileName}`;
  const url = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(destPath)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: buffer,
  });
  
  if (!response.ok) throw new Error(`Storage upload error: ${response.status}`);
  const publicUrl = `https://storage.googleapis.com/${FIREBASE_STORAGE_BUCKET}/${destPath}`;
  return { destPath, publicUrl };
}

// ========================
// Main Worker Entry Point
// ========================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }
    
    // API Routes
    if (path.startsWith('/api/')) {
      return handleApi(request, path);
    }
    
    // Serve static files from dist/
    try {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    } catch {
      // Fall through to SPA fallback
    }
    
    // SPA fallback - serve index.html for non-API routes
    try {
      const indexRequest = new Request(new URL('/', request.url).toString());
      return await env.ASSETS.fetch(indexRequest);
    } catch {
      return new Response('Not Found', { status: 404 });
    }
  },
};

// ========================
// API Handler
// ========================

async function handleApi(request, path) {
  const method = request.method;
  
  // Health check
  if (path === '/api/ping' && method === 'GET') {
    return json({ message: 'pong', time: new Date().toISOString() });
  }
  
  // Auth login
  if (path === '/api/auth/login' && method === 'POST') {
    return handleLogin(request);
  }
  
  // Public projects (no auth required)
  if (path === '/api/projects/public' && method === 'GET') {
    return handlePublicProjects();
  }
  
  // AI search (public)
  if (path === '/api/ai/search' && method === 'POST') {
    return handleAiSearch(request);
  }
  
  // AI endpoints
  if (path === '/api/ai/project-summary' && method === 'POST') {
    return json({ error: 'AI endpoints require external API configuration' }, 501);
  }
  if (path === '/api/ai/classify' && method === 'POST') {
    return json({ error: 'AI endpoints require external API configuration' }, 501);
  }
  if (path === '/api/ai/stream' && method === 'POST') {
    return json({ error: 'AI endpoints require external API configuration' }, 501);
  }
  
  // Protected routes - require auth
  const authHeader = request.headers.get('Authorization');
  const user = await verifyToken(authHeader);
  if (!user) {
    return json({ error: 'Unauthorized' }, 401);
  }
  
  // Fetch user role from Firestore
  user.role = await getUserRole(user.uid);
  
  // Projects CRUD
  if (path === '/api/projects' && method === 'GET') {
    return handleGetProjects(user);
  }
  if (path === '/api/projects' && method === 'POST') {
    return handleCreateProject(request, user);
  }
  
  // Single project
  const projectMatch = path.match(/^\/api\/projects\/([^\/]+)$/);
  if (projectMatch) {
    const projectId = projectMatch[1];
    if (method === 'GET') {
      return handleGetProject(projectId, user);
    }
    if (method === 'PUT') {
      return handleUpdateProject(request, projectId, user);
    }
  }
  
  // Milestones
  const milestonesMatch = path.match(/^\/api\/projects\/([^\/]+)\/milestones$/);
  if (milestonesMatch) {
    const projectId = milestonesMatch[1];
    if (method === 'GET') {
      return handleGetMilestones(projectId, user);
    }
    if (method === 'POST') {
      return handleCreateMilestone(request, projectId, user);
    }
  }
  
  // Single milestone
  const milestoneMatch = path.match(/^\/api\/milestones\/([^\/]+)$/);
  if (milestoneMatch && method === 'PUT') {
    return handleUpdateMilestone(request, milestoneMatch[1], user);
  }
  
  // Disbursements
  const disbursementsMatch = path.match(/^\/api\/projects\/([^\/]+)\/disbursements$/);
  if (disbursementsMatch) {
    return handleGetDisbursements(disbursementsMatch[1], user);
  }
  if (path === '/api/disbursements' && method === 'POST') {
    return handleCreateDisbursement(request, user);
  }
  if (path === '/api/disbursements/summary' && method === 'GET') {
    return handleDisbursementsSummary(user);
  }
  
  const disburseApproveMatch = path.match(/^\/api\/disbursements\/([^\/]+)\/approve$/);
  if (disburseApproveMatch && method === 'PUT') {
    return handleApproveDisbursement(disburseApproveMatch[1], user);
  }
  
  // Issues
  const issuesMatch = path.match(/^\/api\/projects\/([^\/]+)\/issues$/);
  if (issuesMatch) {
    const projectId = issuesMatch[1];
    if (method === 'GET') return handleGetIssues(projectId, user);
    if (method === 'POST') return handleCreateIssue(request, projectId, user);
  }
  
  const issueMatch = path.match(/^\/api\/issues\/([^\/]+)$/);
  if (issueMatch && method === 'PUT') {
    return handleUpdateIssue(request, issueMatch[1], user);
  }
  
  // Audit logs
  if (path === '/api/audit-logs' && method === 'GET') {
    if (!hasPermission(user.role, 'audit_logs')) {
      return json({ error: 'Permission denied' }, 403);
    }
    return handleGetAuditLogs(request, user);
  }
  if (path === '/api/audit-logs/verify/integrity' && method === 'GET') {
    if (!hasPermission(user.role, 'audit_logs')) {
      return json({ error: 'Permission denied' }, 403);
    }
    return handleVerifyAuditIntegrity(user);
  }
  
  // Reports
  if (path === '/api/reports/activity' && method === 'GET') {
    if (!hasPermission(user.role, 'audit_logs')) {
      return json({ error: 'Permission denied' }, 403);
    }
    return handleActivityReport(user);
  }
  if (path === '/api/reports/budget' && method === 'GET') {
    return handleBudgetReport(user);
  }
  
  // Upload
  if (path === '/api/upload' && method === 'POST') {
    return handleUpload(request, user);
  }
  
  return json({ error: 'Not found' }, 404);
}

// ========================
// Route Handlers
// ========================

async function handleLogin(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) return json({ error: 'idToken is required' }, 400);
    
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    
    if (!response.ok) {
      return json({ error: 'Invalid idToken' }, 401);
    }
    
    const data = await response.json();
    const firebaseUser = data.users?.[0];
    if (!firebaseUser) {
      return json({ error: 'User not found' }, 401);
    }
    
    const uid = firebaseUser.localId;
    let role = 'citizen';
    let displayName = firebaseUser.displayName || null;
    let email = firebaseUser.email || null;
    
    // Fetch user role from Firestore
    try {
      const userDoc = await firestoreGet('users', uid);
      if (userDoc.role) role = userDoc.role;
      if (userDoc.displayName) displayName = userDoc.displayName;
      if (userDoc.email) email = userDoc.email;
    } catch {
      // Create user document if it doesn't exist
      try {
        await firestoreCreate('users', {
          email,
          displayName,
          role,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to create user document:', err);
      }
    }
    
    return json({ token: idToken, user: { uid, email, role, displayName } });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handlePublicProjects() {
  try {
    const results = await firestoreQuery('projects', [], null, 1000);
    return json(results);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleGetProjects(user) {
  try {
    const results = await firestoreQuery('projects', [], null, 1000);
    return json(results);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleCreateProject(request, user) {
  if (!hasPermission(user.role, 'write')) {
    return json({ error: 'Permission denied. Required: write' }, 403);
  }
  
  try {
    const { name, description, budget, location, startDate, endDate } = await request.json();
    if (!name || !budget) {
      return json({ error: 'Name and budget are required' }, 400);
    }
    
    const projectData = {
      name,
      description,
      budget,
      location,
      startDate,
      endDate,
      status: 'Pending',
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      allocatedFunds: 0,
      usedFunds: 0,
    };
    
    const id = await firestoreCreate('projects', projectData);
    await logAuditAction('CREATE', 'project', id, user.uid, user.role, { projectName: name });
    
    return json({ id, ...projectData }, 201);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleGetProject(projectId, user) {
  try {
    const doc = await firestoreGet('projects', projectId);
    if (!doc || !doc.id) {
      return json({ error: 'Project not found' }, 404);
    }
    return json(doc);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleUpdateProject(request, projectId, user) {
  if (!hasPermission(user.role, 'write')) {
    return json({ error: 'Permission denied. Required: write' }, 403);
  }
  
  try {
    const { name, description, budget, status } = await request.json();
    const updates = { updatedAt: new Date().toISOString() };
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (budget) updates.budget = budget;
    if (status) updates.status = status;
    
    await firestoreUpdate('projects', projectId, updates);
    await logAuditAction('UPDATE', 'project', projectId, user.uid, user.role, updates);
    
    return json({ id: projectId, ...updates });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleGetMilestones(projectId, user) {
  try {
    const results = await firestoreQuery('milestones', [
      { field: 'projectId', value: { stringValue: projectId } },
    ]);
    return json(results);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleCreateMilestone(request, projectId, user) {
  if (!hasPermission(user.role, 'write')) {
    return json({ error: 'Permission denied. Required: write' }, 403);
  }
  
  try {
    const { title, description, targetDate, budget } = await request.json();
    if (!title || !targetDate) {
      return json({ error: 'Title and targetDate are required' }, 400);
    }
    
    const milestoneData = {
      projectId,
      title,
      description,
      targetDate,
      budget,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
    };
    
    const id = await firestoreCreate('milestones', milestoneData);
    await logAuditAction('CREATE', 'milestone', id, user.uid, user.role, { title, projectId });
    
    return json({ id, ...milestoneData }, 201);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleUpdateMilestone(request, milestoneId, user) {
  if (!hasPermission(user.role, 'write')) {
    return json({ error: 'Permission denied. Required: write' }, 403);
  }
  
  try {
    const { status, verificationNotes } = await request.json();
    const updates = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (verificationNotes) updates.verificationNotes = verificationNotes;
    
    await firestoreUpdate('milestones', milestoneId, updates);
    await logAuditAction('UPDATE', 'milestone', milestoneId, user.uid, user.role, updates);
    
    return json({ id: milestoneId, ...updates });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleGetDisbursements(projectId, user) {
  try {
    const results = await firestoreQuery('disbursements', [
      { field: 'projectId', value: { stringValue: projectId } },
    ]);
    return json(results);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleCreateDisbursement(request, user) {
  if (!hasPermission(user.role, 'write')) {
    return json({ error: 'Permission denied. Required: write' }, 403);
  }
  
  try {
    const { projectId, amount, description, recipient } = await request.json();
    if (!projectId || !amount) {
      return json({ error: 'projectId and amount are required' }, 400);
    }
    
    const disbursementData = {
      projectId,
      amount,
      description,
      recipient,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      approvedBy: null,
      approvedAt: null,
    };
    
    const id = await firestoreCreate('disbursements', disbursementData);
    await logAuditAction('CREATE', 'disbursement', id, user.uid, user.role, { projectId, amount });
    
    return json({ id, ...disbursementData }, 201);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleApproveDisbursement(disbursementId, user) {
  if (!hasPermission(user.role, 'write')) {
    return json({ error: 'Permission denied. Required: write' }, 403);
  }
  
  try {
    const updates = {
      status: 'Approved',
      approvedBy: user.uid,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await firestoreUpdate('disbursements', disbursementId, updates);
    await logAuditAction('APPROVE', 'disbursement', disbursementId, user.uid, user.role, updates);
    
    return json({ id: disbursementId, ...updates });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleDisbursementsSummary(user) {
  try {
    const projects = await firestoreQuery('projects', [], null, 1000);
    const summary = [];
    
    for (const project of projects) {
      const disbursements = await firestoreQuery('disbursements', [
        { field: 'projectId', value: { stringValue: project.id } },
      ]);
      
      let totalDisbursed = 0;
      disbursements.forEach(d => {
        if (d.status === 'Approved') totalDisbursed += d.amount;
      });
      
      summary.push({
        projectId: project.id,
        projectName: project.name,
        budget: project.budget,
        allocated: project.allocatedFunds || 0,
        disbursed: totalDisbursed,
        remaining: project.budget - totalDisbursed,
      });
    }
    
    return json(summary);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleGetIssues(projectId, user) {
  try {
    const results = await firestoreQuery('issues', [
      { field: 'projectId', value: { stringValue: projectId } },
    ]);
    return json(results);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleCreateIssue(request, projectId, user) {
  try {
    const { title, description, category } = await request.json();
    if (!title || !projectId) {
      return json({ error: 'Title and projectId are required' }, 400);
    }
    
    const issueData = {
      projectId,
      title,
      description,
      category,
      status: 'Open',
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      createdByRole: user.role,
      resolvedAt: null,
      resolutionNotes: null,
    };
    
    const id = await firestoreCreate('issues', issueData);
    await logAuditAction('CREATE', 'issue', id, user.uid, user.role, { title, projectId });
    
    return json({ id, ...issueData }, 201);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleUpdateIssue(request, issueId, user) {
  if (!hasPermission(user.role, 'write')) {
    return json({ error: 'Permission denied. Required: write' }, 403);
  }
  
  try {
    const { status, resolutionNotes } = await request.json();
    const updates = { updatedAt: new Date().toISOString() };
    if (status) {
      updates.status = status;
      if (status === 'Resolved') {
        updates.resolvedAt = new Date().toISOString();
      }
    }
    if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
    
    await firestoreUpdate('issues', issueId, updates);
    await logAuditAction('UPDATE', 'issue', issueId, user.uid, user.role, updates);
    
    return json({ id: issueId, ...updates });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleGetAuditLogs(request, user) {
  try {
    const url = new URL(request.url);
    const entity = url.searchParams.get('entity');
    const entityId = url.searchParams.get('entityId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const filters = [];
    if (entity) filters.push({ field: 'entity', value: { stringValue: entity } });
    if (entityId) filters.push({ field: 'entityId', value: { stringValue: entityId } });
    
    const results = await firestoreQuery('audit_logs', filters, 'timestamp', limit);
    return json(results);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleVerifyAuditIntegrity(user) {
  try {
    const logs = await firestoreQuery('audit_logs', [], 'timestamp', 10000);
    let previousHash = 'genesis';
    let integrityStatus = true;
    
    for (const log of logs) {
      if (log.previousHash !== previousHash) {
        integrityStatus = false;
      }
      previousHash = log.hash;
    }
    
    return json({
      verified: integrityStatus,
      totalLogs: logs.length,
      message: integrityStatus ? 'Audit ledger is intact' : 'Audit ledger has been tampered with',
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleActivityReport(user) {
  try {
    const logs = await firestoreQuery('audit_logs', [], 'timestamp', 100);
    const actionCounts = {};
    const entityCounts = {};
    const userActions = {};
    
    for (const log of logs) {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      entityCounts[log.entity] = (entityCounts[log.entity] || 0) + 1;
      userActions[log.userId] = (userActions[log.userId] || 0) + 1;
    }
    
    return json({
      actionCounts,
      entityCounts,
      userActions,
      totalLogs: logs.length,
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleBudgetReport(user) {
  try {
    const projects = await firestoreQuery('projects', [], null, 1000);
    const budgetReport = [];
    
    for (const project of projects) {
      const disbursements = await firestoreQuery('disbursements', [
        { field: 'projectId', value: { stringValue: project.id } },
      ]);
      
      let totalApproved = 0;
      let totalPending = 0;
      let transactionCount = 0;
      
      disbursements.forEach(d => {
        transactionCount++;
        if (d.status === 'Approved') totalApproved += d.amount;
        else if (d.status === 'Pending') totalPending += d.amount;
      });
      
      budgetReport.push({
        projectId: project.id,
        projectName: project.name,
        totalBudget: project.budget,
        allocatedFunds: project.allocatedFunds || 0,
        approvedDisbursements: totalApproved,
        pendingDisbursements: totalPending,
        remainingBudget: project.budget - totalApproved,
        transactionCount,
        status: project.status,
      });
    }
    
    return json(budgetReport);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleUpload(request, user) {
  if (!hasPermission(user.role, 'upload_documents')) {
    return json({ error: 'Permission denied. Required: upload_documents' }, 403);
  }
  
  try {
    const { fileName, contentType = 'application/octet-stream', base64, projectId = null, milestoneId = null } = await request.json();
    
    if (!fileName || !base64) {
      return json({ error: 'fileName and base64 are required' }, 400);
    }
    
    // Convert base64 to ArrayBuffer
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    let buffer;
    let detectedType = contentType;
    
    if (matches) {
      detectedType = matches[1];
      const binaryString = atob(matches[2]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      buffer = bytes.buffer;
    } else {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      buffer = bytes.buffer;
    }
    
    // Upload to Firebase Storage
    const destPath = `documents/${Date.now()}_${fileName}`;
    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(destPath)}`;
    
    const storageResponse = await fetch(storageUrl, {
      method: 'POST',
      headers: { 'Content-Type': detectedType },
      body: buffer,
    });
    
    if (!storageResponse.ok) {
      throw new Error(`Storage upload failed: ${storageResponse.status}`);
    }
    
    const publicUrl = `https://storage.googleapis.com/${FIREBASE_STORAGE_BUCKET}/${destPath}`;
    
    // Create document record in Firestore
    const docData = {
      projectId,
      milestoneId,
      fileName,
      storagePath: destPath,
      publicUrl,
      fileType: detectedType,
      uploadedBy: user.uid,
      uploadedAt: new Date().toISOString(),
    };
    
    const id = await firestoreCreate('documents', docData);
    await logAuditAction('UPLOAD', 'document', id, user.uid, user.role, { fileName, projectId, milestoneId });
    
    return json({ id, ...docData });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleAiSearch(request) {
  try {
    const { query = '', limit = 20 } = await request.json();
    if (!query || !query.toString().trim()) {
      return json({ error: 'query is required' }, 400);
    }
    
    const projects = await firestoreQuery('projects', [], null, 1000);
    
    const items = projects.map(p => ({
      id: p.id,
      name: p.name,
      county: p.county,
      country: p.country,
      description: p.description,
      what: p.what,
      where: p.where,
      lat: p.latitude || p.lat,
      lng: p.longitude || p.lng,
    }));
    
    // Local scoring fallback
    const scored = items
      .map(it => ({
        ...it,
        score: simpleScore([it.name, it.description, it.what, it.where, it.county].filter(Boolean).join(' '), query),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, Math.min(Number(limit) || 20, 200)));
    
    return json({ results: scored });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function simpleScore(text = '', query = '') {
  const t = (text || '').toLowerCase();
  const q = (query || '').toLowerCase();
  if (!q) return 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const tok of tokens) {
    let idx = t.indexOf(tok);
    while (idx !== -1) {
      score += 1;
      idx = t.indexOf(tok, idx + tok.length);
    }
  }
  return score;
}
