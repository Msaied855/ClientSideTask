const container = document.getElementById('campaignDetail');
const params = new URLSearchParams(window.location.search);
const campaignId = params.get('id');

if (!campaignId) {
  window.location.href = '/';
}

let campaign = null;

async function loadCampaign() {
  try {
    const res = await fetch(`${API}/campaigns/${campaignId}`);
    if (!res.ok) throw new Error('Not found');
    campaign = await res.json();

    // also load pledges for this campaign
    const pledgeRes = await fetch(`${API}/pledges?campaignId=${campaignId}`);
    const pledges = await pledgeRes.json();

    // get creator name
    const creatorRes = await fetch(`${API}/users/${campaign.creatorId}`);
    const creator = await creatorRes.json();

    renderCampaign(campaign, pledges, creator);
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><p>Campaign not found.</p></div>';
  }
}

function renderCampaign(c, pledges, creator) {
  const percent = calcPercent(c.raised, c.goal);
  const user = getCurrentUser();
  const icon = getCategoryIcon(c.category);
  const imageHtml = c.image
    ? `<img src="${c.image}" alt="${c.title}">`
    : icon;

  let pledgeHtml = '';
  if (user && user.role === 'user' && user.isActive) {
    pledgeHtml = `
      <div class="pledge-section">
        <h3>Back This Campaign</h3>
        <div id="pledgeAlert"></div>
        <div class="pledge-input">
          <input type="number" id="pledgeAmount" placeholder="Enter amount ($)" min="1">
          <button class="btn btn-primary" onclick="submitPledge()">Pledge</button>
        </div>
      </div>
    `;
  } else if (!user) {
    pledgeHtml = `
      <div class="pledge-section">
        <p><a href="/login.html" style="color:#2ecc71;font-weight:600;">Log in</a> to support this campaign.</p>
      </div>
    `;
  }

  // show edit button if user owns this campaign
  let editHtml = '';
  if (user && user.id === c.creatorId) {
    editHtml = `
      <div class="edit-form" id="editSection" style="display:none;">
        <h3>Edit Campaign</h3>
        <div class="form-row">
          <input type="text" id="editDeadline" value="${c.deadline}" placeholder="dd-mm-yyyy">
        </div>
        <div class="form-row">
          <textarea id="editDescription">${c.description}</textarea>
        </div>
        <button class="btn btn-primary btn-sm" onclick="saveEdit()">Save Changes</button>
        <button class="btn btn-secondary btn-sm" onclick="toggleEdit()">Cancel</button>
      </div>
      <button class="btn btn-outline btn-sm" onclick="toggleEdit()" id="editBtn" style="margin-bottom:15px;">Edit Campaign</button>
    `;
  }


  container.innerHTML = `
    <div class="detail-header">
      <div class="detail-image">${imageHtml}</div>
      <div class="detail-content">
        <span class="category-tag" style="margin-bottom:10px;">${c.category || 'other'}</span>
        <h1>${c.title}</h1>
        <p class="meta">By ${creator.name} &middot; Deadline: ${c.deadline}</p>
        <div class="progress-bar" style="margin-bottom:15px;">
          <div class="fill" style="width:${percent}%"></div>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">${formatMoney(c.raised)}</div>
            <div class="stat-label">raised of ${formatMoney(c.goal)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${percent}%</div>
            <div class="stat-label">funded</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${pledges.length}</div>
            <div class="stat-label">backers</div>
          </div>
        </div>
        <p class="description">${c.description}</p>
        ${editHtml}
      </div>
    </div>
    ${pledgeHtml}
  `;
}

async function submitPledge() {
  const amountInput = document.getElementById('pledgeAmount');
  const alertBox = document.getElementById('pledgeAlert');
  const amount = parseFloat(amountInput.value);
  const user = getCurrentUser();

  if (!amount || amount <= 0) {
    showAlert(alertBox, 'Please enter a valid amount.', 'error');
    return;
  }

  // mock payment confirmation
  const confirmed = confirm(`Confirm pledge of ${formatMoney(amount)} to "${campaign.title}"?`);
  if (!confirmed) return;

  try {
    // create the pledge
    await fetch(`${API}/pledges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: String(campaign.id),
        userId: String(user.id),
        amount: amount
      })
    });

    // update campaign raised amount
    await fetch(`${API}/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raised: campaign.raised + amount
      })
    });

    showAlert(alertBox, 'Thank you for your pledge!', 'success');
    amountInput.value = '';

    // reload after a moment
    setTimeout(() => loadCampaign(), 1000);
  } catch (err) {
    showAlert(alertBox, 'Failed to submit pledge.', 'error');
  }
}

function toggleEdit() {
  const section = document.getElementById('editSection');
  const btn = document.getElementById('editBtn');
  if (section.style.display === 'none') {
    section.style.display = 'block';
    btn.style.display = 'none';
  } else {
    section.style.display = 'none';
    btn.style.display = '';
  }
}

async function saveEdit() {
  const deadline = document.getElementById('editDeadline').value.trim();
  const description = document.getElementById('editDescription').value.trim();

  try {
    await fetch(`${API}/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deadline, description })
    });
    loadCampaign();
  } catch (err) {
    alert('Failed to update campaign.');
  }
}

loadCampaign();
