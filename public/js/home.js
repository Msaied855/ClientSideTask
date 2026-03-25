const grid = document.getElementById('campaignsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');

let allCampaigns = [];

// fetch approved campaigns
async function loadCampaigns() {
  try {
    const res = await fetch(`${API}/campaigns?isApproved=true`);
    allCampaigns = await res.json();
    displayCampaigns(allCampaigns);
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><p>Failed to load campaigns.</p></div>';
  }
}

function displayCampaigns(campaigns) {
  if (campaigns.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No campaigns found.</p></div>';
    return;
  }

  grid.innerHTML = campaigns.map(c => {
    const percent = calcPercent(c.raised, c.goal);
    const icon = getCategoryIcon(c.category);
    const imageHtml = c.image
      ? `<img src="${c.image}" alt="${c.title}">`
      : icon;

    return `
      <a href="/campaign.html?id=${c.id}" class="campaign-card">
        <div class="card-image">${imageHtml}</div>
        <div class="card-body">
          <span class="category-tag">${c.category || 'other'}</span>
          <h3>${c.title}</h3>
          <p>${c.description}</p>
          <div class="progress-bar">
            <div class="fill" style="width: ${percent}%"></div>
          </div>
          <div class="card-stats">
            <span><strong>${formatMoney(c.raised)}</strong> raised</span>
            <span><strong>${percent}%</strong> funded</span>
            <span>${c.deadline}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

// search
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);

function applyFilters() {
  let filtered = [...allCampaigns];
  const query = searchInput.value.toLowerCase().trim();
  const cat = categoryFilter.value;
  const sort = sortFilter.value;

  if (query) {
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
  }

  if (cat) {
    filtered = filtered.filter(c => c.category === cat);
  }

  if (sort === 'deadline') {
    filtered.sort((a, b) => parseDate(a.deadline) - parseDate(b.deadline));
  } else if (sort === 'goal') {
    filtered.sort((a, b) => b.goal - a.goal);
  }

  displayCampaigns(filtered);
}

// parse dd-mm-yyyy date string
function parseDate(str) {
  const parts = str.split('-');
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

loadCampaigns();
