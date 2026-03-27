// redirect if not logged in
const user = getCurrentUser();
if (!user || user.role !== 'user') {
  window.location.href = '/login.html';
}

const form = document.getElementById('campaignForm');
const alertBox = document.getElementById('alertBox');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;
  const goal = parseFloat(document.getElementById('goal').value);
  const deadline = document.getElementById('deadline').value.trim();
  const imageFile = document.getElementById('image').files[0];

  // basic validation on deadline format
  if (!/^\d{2}-\d{2}-\d{4}$/.test(deadline)) {
    showAlert(alertBox, 'Deadline must be in dd-mm-yyyy format.', 'error');
    return;
  }
  // convert dd-mm-yyyy to Date
const [day, month, year] = deadline.split('-').map(Number);
const deadlineDate = new Date(year, month - 1, day);

// today's date (without time)
const today = new Date();
today.setHours(0,0,0,0);

// check if deadline is in the past
if (deadlineDate < today) {
  showAlert(alertBox, 'InValid Deadline', 'error');
  return;
}
  

  let imageBase64 = '';

  // convert image to base64 if provided
  if (imageFile) {
    imageBase64 = await toBase64(imageFile);
  }

  try {
    const res = await fetch(`${API}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        description: description,
        category: category,
        goal: goal,
        raised: 0,
        deadline: deadline,
        creatorId: user.id,
        isApproved: false,
        image: imageBase64
      })
    });

    if (res.ok) {
      showAlert(alertBox, 'Campaign created! It will appear once approved by an admin.', 'success');
      form.reset();
    } else {
      showAlert(alertBox, 'Failed to create campaign.', 'error');
    }
  } catch (err) {
    showAlert(alertBox, 'Something went wrong.', 'error');
  }
});

// helper to read file as base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
