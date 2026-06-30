function goToPassword() {
  const email = document.getElementById('email').value.trim();
  if (!email) {
    alert('Please enter your email, phone, or Skype.');
    return;
  }
  document.getElementById('email-display').textContent = email;
  document.getElementById('step-email').style.display = 'none';
  document.getElementById('step-password').style.display = 'block';
}

function goBack() {
  document.getElementById('step-password').style.display = 'none';
  document.getElementById('step-email').style.display = 'block';
}

function signIn() {
      const email = document.getElementById("email").value;
      localStorage.setItem("email", email);
      window.location.href = "goodbye.html";
}

function handleLogin() {
  const password = document.getElementById('password').value;
  if (!password) {
    alert('Please enter your password.');
    return;
  }
  // Replace with your real login logic
  alert('Signing in...');
}

function signIn() {
  const username = document.getElementById("username").value;

  fetch('/api/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
  .then(res => {
    if (!res.ok) throw new Error('Request failed');
    window.location.href = "goodbye.html";
  })
  .catch(err => {
    console.error(err);
    alert("Something went wrong saving your sign-in.");
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const emailStep = document.getElementById('step-email');
    if (emailStep.style.display !== 'none') {
      goToPassword();
    } else {
      handleLogin();
    }
  }
});