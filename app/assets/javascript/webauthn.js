function getCSRFToken() {
  var CSRFSelector = document.querySelector('meta[name="csrf-token"]')
  if (CSRFSelector) {
    return CSRFSelector.getAttribute("content")
  } else {
    return null
  }
}

async function handleRegistrationSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
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

  console.log("Credential options")
  console.log(credentialOptions)

  const publicKeyCredential = await navigator.credentials.create({
    publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(credentialOptions)
  });


  console.log("Credential")
  console.log(publicKeyCredential.toJSON())

  const utf8Decoder = new TextDecoder('utf-8');
  const clientDataJSONBuffer = publicKeyCredential.response.clientDataJSON;
  const clientDataJSONString = utf8Decoder.decode(clientDataJSONBuffer);
  console.log(JSON.parse(clientDataJSONString));

  const credentialInput = document.createElement('input');
  credentialInput.type = 'hidden';
  credentialInput.name = 'credential';
  credentialInput.value = JSON.stringify(publicKeyCredential);

  form.appendChild(credentialInput);
  form.submit();
}

async function handleSignInClick(event) {
  const response = await fetch(`/session`, {
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

  console.log("Credential options")
  console.log(credentialOptions)

  const publicKeyCredential = await navigator.credentials.get({
    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(credentialOptions)
  });

  const callbackResponse = await fetch(`/session/callback`, {
    method: "POST",
    body: JSON.stringify({credential: publicKeyCredential }),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': getCSRFToken()
    }
  });

  console.log("Credential")
  console.log(publicKeyCredential.toJSON())

  const clientDataJSONBuffer = publicKeyCredential.response.clientDataJSON;
  const utf8Decoder = new TextDecoder('utf-8');
  const clientDataJSONString = utf8Decoder.decode(clientDataJSONBuffer);
  console.log(clientDataJSONString);

  if (callbackResponse.ok) {
    window.location.href = "/"
  }
}

document.addEventListener('DOMContentLoaded', function() {

  const registrationForm = document.getElementById('registration-form');
  if (registrationForm) {
    registrationForm.addEventListener('submit', handleRegistrationSubmit);
  }

  const signInButton = document.getElementById('signin-button')
  if (signInButton) {
    signInButton.addEventListener('click', handleSignInClick);
  }
});
