// only admins allowed
const user = getCurrentUser();
if (!user || user.role !== 'admin') {
  window.location.href = '/login.html';
}

const alertBox = document.getElementById('alertBox');

// tab switching
function switchTab(tab) {
  // hide all tabs
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));

  // show selected
  document.getElementById(tab + 'Tab').style.display = 'block';
  event.target.classList.add('active');
}

// ---------- USERS ----------
async function loadUsers() {
  try {
    const res = await fetch(`${API}/users`);
    const users = await res.json();
    const tbody = document.getElementById('usersTable');

    tbody.innerHTML = users.map(u => {
      const statusClass = u.isActive ? 'badge-success' : 'badge-danger';
      const statusText = u.isActive ? 'Active' : 'Banned';
      const banBtn = u.role !== 'admin'
        ? (u.isActive
          ? `<button class="btn btn-danger btn-sm" onclick="toggleBan(${u.id}, false)">Ban</button>`
          : `<button class="btn btn-primary btn-sm" onclick="toggleBan(${u.id}, true)">Unban</button>`)
        : '<span style="color:#999;">-</span>';

      return `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
          <td>${banBtn}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    document.getElementById('usersTable').innerHTML = '<tr><td colspan="6" style="color:#e74c3c;text-align:center;">Failed to load.</td></tr>';
  }
}

async function toggleBan(userId, activate) {
  try {
    await fetch(`${API}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: activate })
    });
    showAlert(alertBox, activate ? 'User has been unbanned.' : 'User has been banned.', 'success');
    loadUsers();
  } catch (err) {
    showAlert(alertBox, 'Failed to update user.', 'error');
  }
}

// ---------- CAMPAIGNS ----------
async function loadCampaigns() {
  try {
    const res = await fetch(`${API}/campaigns`);
    const campaigns = await res.json();
    const tbody = document.getElementById('campaignsTableAdmin');

    tbody.innerHTML = campaigns.map(c => {
      let statusClass, statusText;
      if (c.isApproved) {
        statusClass = 'badge-success';
        statusText = 'Approved';
      } else if (c.isRejected) {
        statusClass = 'badge-danger';
        statusText = 'Rejected';
      } else {
        statusClass = 'badge-warning';
        statusText = 'Pending';
      }

      let actions = '';
      if (!c.isApproved && !c.isRejected) {
        actions = `<button class="btn btn-primary btn-sm" onclick="approveCampaign('${c.id}')">Approve</button>
           <button class="btn btn-secondary btn-sm" onclick="rejectCampaign('${c.id}')">Reject</button>`;
      }

      return `
        <tr>
          <td>${c.id}</td>
          <td>${c.title}</td>
          <td>User #${c.creatorId}</td>
          <td>${formatMoney(c.goal)}</td>
          <td>${formatMoney(c.raised)}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
          <td>
            ${actions}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    document.getElementById('campaignsTableAdmin').innerHTML = '<tr><td colspan="7" style="color:#e74c3c;text-align:center;">Failed to load.</td></tr>';
  }
}

async function approveCampaign(id) {
  try {
    await fetch(`${API}/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: true, isRejected: false })
    });
    showAlert(alertBox, 'Campaign approved.', 'success');
    loadCampaigns();
  } catch (err) {
    showAlert(alertBox, 'Failed to approve campaign.', 'error');
  }
}

async function rejectCampaign(id) {
  try {
    await fetch(`${API}/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: false, isRejected: true })
    });
    showAlert(alertBox, 'Campaign rejected.', 'success');
    loadCampaigns();
  } catch (err) {
    showAlert(alertBox, 'Failed to reject campaign.', 'error');
  }
}

async function deleteCampaign(id) {
  if (!confirm('Are you sure you want to delete this campaign?')) return;

  try {
    await fetch(`${API}/campaigns/${id}`, { method: 'DELETE' });
    showAlert(alertBox, 'Campaign deleted.', 'success');
    loadCampaigns();
  } catch (err) {
    showAlert(alertBox, 'Failed to delete campaign.', 'error');
  }
}

// ---------- PLEDGES ----------
async function loadPledges() {
  try {
    const res = await fetch(`${API}/pledges`);
    const pledges = await res.json();
    const tbody = document.getElementById('pledgesTableAdmin');

    if (pledges.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;">No pledges yet.</td></tr>';
      return;
    }

    tbody.innerHTML = pledges.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.campaignId}</td>
        <td>${p.userId}</td>
        <td>${formatMoney(p.amount)}</td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('pledgesTableAdmin').innerHTML = '<tr><td colspan="4" style="color:#e74c3c;text-align:center;">Failed to load.</td></tr>';
  }
}

// load everything on page start
loadUsers();
loadCampaigns();
loadPledges();
