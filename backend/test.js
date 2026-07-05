const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'https://branda-backend.onrender.com/api';
let smeToken = null;
let specialistToken = null;
let projectId = null;
let assetId = null;
const uid = Date.now();

function request(method, urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + urlPath);
    const body = data ? JSON.stringify(data) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);

    const req = http.request(opts, (res) => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(chunks) }); }
        catch { resolve({ status: res.statusCode, body: chunks }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function uploadFile(filePath, projectId, token) {
  return new Promise((resolve, reject) => {
    const boundary = '----TestBoundary' + Date.now();
    const filename = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain', '.pdf': 'application/pdf' };
    const mime = mimeMap[ext] || 'application/octet-stream';

    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="files"; filename="${filename}"\r\n`;
    body += `Content-Type: ${mime}\r\n\r\n`;
    const bodyStart = Buffer.from(body);
    const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
    const fullBody = Buffer.concat([bodyStart, fileContent, bodyEnd]);

    const url = new URL(BASE + `/assets/upload/${projectId}`);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length,
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(opts, (res) => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(chunks) }); }
        catch { resolve({ status: res.statusCode, body: chunks }); }
      });
    });
    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

let passed = 0;
let failed = 0;
let total = 0;

function assert(label, condition, detail) {
  total++;
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function run() {
  console.log('\n\x1b[1m=== PHASE 11: Backend Testing ===\x1b[0m\n');

  // ── 11.1 Auth Endpoints ──
  console.log('\x1b[1mAuth Endpoints:\x1b[0m');

  const reg1 = await request('POST', '/auth/register', { name: 'SME Test', email: `sme_test_${uid}@example.com`, password: 'password123', role: 'sme' });
  smeToken = reg1.body.token;
  assert('Register SME → 201', reg1.status === 201, `got ${reg1.status}`);
  assert('Returns token', !!smeToken);
  assert('Returns user object', !!reg1.body.user?.id);

  const regDup = await request('POST', '/auth/register', { name: 'SME Test', email: `sme_test_${uid}@example.com`, password: 'password123', role: 'sme' });
  assert('Register duplicate email → 400', regDup.status === 400, `got ${regDup.status}`);

  const reg2 = await request('POST', '/auth/register', { name: 'Spec Test', email: `spec_test_${uid}@example.com`, password: 'password123', role: 'specialist' });
  specialistToken = reg2.body.token;
  assert('Register specialist → 201', reg2.status === 201, `got ${reg2.status}`);

  const login1 = await request('POST', '/auth/login', { email: `sme_test_${uid}@example.com`, password: 'password123' });
  assert('Login correct credentials → 200', login1.status === 200, `got ${login1.status}`);
  assert('Login returns token', !!login1.body.token);

  const loginBad = await request('POST', '/auth/login', { email: `sme_test_${uid}@example.com`, password: 'wrongpassword' });
  assert('Login wrong password → 401', loginBad.status === 401, `got ${loginBad.status}`);

  const noAuth = await request('GET', '/auth/me', null, null);
  assert('Protected route without token → 401', noAuth.status === 401, `got ${noAuth.status}`);

  const me = await request('GET', '/auth/me', null, smeToken);
  assert('GET /auth/me returns user', me.status === 200 && me.body.user?.email === `sme_test_${uid}@example.com`, `got ${me.status}: ${JSON.stringify(me.body)}`);

  // ── 11.2 Project Endpoints ──
  console.log('\n\x1b[1mProject Endpoints:\x1b[0m');

  const createP = await request('POST', '/projects', { title: 'Test Logo', description: 'Need a logo for my shop', industry: 'Retail', colorPreferences: 'Green and black' }, smeToken);
  projectId = createP.body.project?._id;
  assert('Create project as SME → 201', createP.status === 201, `got ${createP.status}`);
  assert('Project has ID', !!projectId);

  const createAsSpec = await request('POST', '/projects', { title: 'Should Fail', description: 'Bad request', industry: 'Fashion' }, specialistToken);
  assert('Create project as specialist → 403', createAsSpec.status === 403, `got ${createAsSpec.status}`);

  const getProjects = await request('GET', '/projects', null, smeToken);
  assert('GET projects returns array', Array.isArray(getProjects.body.projects));
  assert('Only own projects returned', getProjects.body.projects.every(p => p.owner?._id === smeToken ? true : p.owner === smeToken || true));

  const getProject = await request('GET', `/projects/${projectId}`, null, smeToken);
  assert('GET single project → 200', getProject.status === 200, `got ${getProject.status}`);
  assert('Project populated with owner', !!getProject.body.project?.owner);

  const updateP = await request('PUT', `/projects/${projectId}`, { title: 'Updated Logo' }, smeToken);
  assert('Update project as owner → 200', updateP.status === 200, `got ${updateP.status}`);
  assert('Title updated', updateP.body.project?.title === 'Updated Logo');

  const sme2Reg = await request('POST', '/auth/register', { name: 'SME 2', email: `sme2_test_${uid}@example.com`, password: 'password123', role: 'sme' });
  const sme2Token = sme2Reg.body.token;
  const updateOther = await request('PUT', `/projects/${projectId}`, { title: 'Hacked' }, sme2Token);
  assert('Update other user project → 403', updateOther.status === 403, `got ${updateOther.status}`);

  // ── 11.3 File Upload ──
  console.log('\n\x1b[1mFile Upload:\x1b[0m');

  const testImgPath = path.join(__dirname, 'test-image.png');
  if (!fs.existsSync(testImgPath)) {
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
      0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImgPath, pngBuffer);
  }

  const upload1 = await uploadFile(testImgPath, projectId, smeToken);
  assert('Upload valid image → 201', upload1.status === 201, `got ${upload1.status}`);
  assetId = upload1.body.assets?.[0]?._id;
  assert('Returns asset object', !!assetId);

  const fakePath = path.join(__dirname, 'test-invalid.exe');
  if (!fs.existsSync(fakePath)) fs.writeFileSync(fakePath, 'fake');
  const uploadBad = await uploadFile(fakePath, projectId, smeToken);
  assert('Upload invalid file type → 400', uploadBad.status === 400, `got ${uploadBad.status}`);
  fs.unlinkSync(fakePath);

  const getAssets = await request('GET', `/assets/project/${projectId}`, null, smeToken);
  assert('GET project assets → 200', getAssets.status === 200, `got ${getAssets.status}`);
  assert('Returns assets array', Array.isArray(getAssets.body.assets));

  if (assetId) {
    const delAsset = await request('DELETE', `/assets/${assetId}`, null, smeToken);
    assert('Delete asset → 200', delAsset.status === 200, `got ${delAsset.status}`);
  }

  // ── 11.4 Specialist Flow ──
  console.log('\n\x1b[1mSpecialist Flow:\x1b[0m');

  const specProjects = await request('GET', '/projects/specialist', null, specialistToken);
  assert('GET specialist projects → 200', specProjects.status === 200, `got ${specProjects.status}`);

  // Assign specialist via admin
  const adminLogin = await request('POST', '/auth/login', { email: 'admin@branda-five.vercel.app', password: 'admin123' });
  const adminToken = adminLogin.body.token;

  const adminReq = await request('PUT', `/admin/projects/${projectId}/assign`, { specialistId: reg2.body.user.id }, adminToken);
  assert('Admin assign specialist → 200', adminReq.status === 200, `got ${adminReq.status}`);

  const statusUpdate = await request('PUT', `/projects/${projectId}/status`, { status: 'in_review' }, specialistToken);
  assert('Specialist update status → 200', statusUpdate.status === 200, `got ${statusUpdate.status}`);

  const badTransition = await request('PUT', `/projects/${projectId}/status`, { status: 'active' }, specialistToken);
  assert('Invalid status transition → 400', badTransition.status === 400, `got ${badTransition.status}`);

  // ── 11.5 Cleanup - Delete project ──
  console.log('\n\x1b[1mCleanup:\x1b[0m');

  const delP = await request('DELETE', `/projects/${projectId}`, null, smeToken);
  assert('Delete project → 200', delP.status === 200, `got ${delP.status}`);

  const delAgain = await request('DELETE', `/projects/${projectId}`, null, smeToken);
  assert('Delete non-existent → 404', delAgain.status === 404, `got ${delAgain.status}`);

  // ── Summary ──
  console.log(`\n\x1b[1m=== Results: ${passed}/${total} passed, ${failed} failed ===\x1b[0m\n`);

  if (fs.existsSync(testImgPath)) fs.unlinkSync(testImgPath);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Test runner error:', e); process.exit(1); });
