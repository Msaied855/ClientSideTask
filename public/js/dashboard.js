const user = getCurrentUser();
if (!user || user.role !== 'user') {
  window.location.href = '/login.html';
}

document.getElementById('welcomeMsg').textContent = `Welcome, ${user.name}`;

const campaignsTable = document.getElementById('campaignsTable');
const pledgesTable = document.getElementById('pledgesTable');

async function loadDashboard() {
  await Promise.all([loadMyCampaigns(), loadMyPledges()]);
}

async function loadMyCampaigns() {
  try {
    const res = await fetch(`${API}/campaigns?creatorId=${user.id}`);
    const campaigns = await res.json();

    if (campaigns.length === 0) {
      campaignsTable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">You haven\'t created any campaigns yet.</td></tr>';
      return;
    }

    campaignsTable.innerHTML = campaigns.map(c => {
      const statusClass = c.isApproved ? 'badge-success' : 'badge-warning';
      const statusText = c.isApproved ? 'Approved' : 'Pending';
      return `
        <tr>
          <td><a href="/campaign.html?id=${c.id}" style="color:#2ecc71;font-weight:500;">${c.title}</a></td>
          <td>${formatMoney(c.goal)}</td>
          <td>${formatMoney(c.raised)}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
          <td>${c.deadline}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    campaignsTable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#e74c3c;">Failed to load campaigns.</td></tr>';
  }
}

async function loadMyPledges() {
  try {
    const res = await fetch(`${API}/pledges?userId=${user.id}`);
    const pledges = await res.json();

    if (pledges.length === 0) {
      pledgesTable.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#999;">You haven\'t backed any campaigns yet.</td></tr>';
      return;
    }

    // fetch campaign titles for each pledge
    const rows = await Promise.all(pledges.map(async p => {
      let title = `Campaign #${p.campaignId}`;
      try {
        const cRes = await fetch(`${API}/campaigns/${p.campaignId}`);
        const c = await cRes.json();
        title = c.title;
      } catch (e) {}

      return `
        <tr>
          <td><a href="/campaign.html?id=${p.campaignId}" style="color:#2ecc71;font-weight:500;">${title}</a></td>
          <td>${formatMoney(p.amount)}</td>
        </tr>
      `;
    }));

    pledgesTable.innerHTML = rows.join('');
  } catch (err) {
    pledgesTable.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#e74c3c;">Failed to load pledges.</td></tr>';
  }
}

loadDashboard();
