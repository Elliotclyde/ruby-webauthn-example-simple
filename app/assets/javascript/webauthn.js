function getCSRFToken() {
  var CSRFSelector = document.querySelector('meta[name="csrf-token"]')
  if (CSRFSelector) {
    return CSRFSelector.getAttribute("content")
  } else {
    return null
  }
}

function submitWithCredential(form, credential) {

  const credentialInput = document.createElement('input');
  credentialInput.type = 'hidden';
  credentialInput.name = 'credential';
  credentialInput.value = JSON.stringify(credential);

  form.appendChild(credentialInput);
  form.submit();
}

async function handleRegistrationSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch(`/registration?username=${formData.get("username")}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': getCSRFToken()
      }
    });

    if (!response.ok) {
      return;
    }

    const credentialOptions = await response.json();

    const publicKeyCredential = await navigator.credentials.create({
      publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(credentialOptions)
    });

    submitWithCredential(event.target, publicKeyCredential);

  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Handle login form submission
async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch(`/session?username=${formData.get("username")}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': getCSRFToken()
      }
    });

    if (!response.ok) {
      return;
    }

    const credentialOptions = await response.json();

    const publicKeyCredential = await navigator.credentials.get({
      publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(credentialOptions)
    });

    submitWithCredential(event.target, publicKeyCredential);

  } catch (error) {
    alert('Error: ' + error.message);
  }
}

document.addEventListener('DOMContentLoaded', function() {

  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', handleRegistrationSubmit);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
});
