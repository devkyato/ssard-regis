// script.js

// 1) Discord Webhook URL (replace with your actual webhook URL)
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1325637445756256277/tVpZ_gEHaNbEjziqoN3OCLfcJ4OMymPXqFymJSzoFY9stI--aTvMbQWWCBKpnoI-lIZ5";

// Initialize Signature Pad
const canvas = document.getElementById("signature-pad");
const signaturePad = new SignaturePad(canvas);

// Toggle signature method
const uploadRadio = document.getElementById("upload");
const drawRadio = document.getElementById("draw");
const uploadSection = document.getElementById("upload_section");
const drawSection = document.getElementById("draw_section");
const clearButton = document.getElementById("clear");

uploadRadio.addEventListener("change", toggleSignatureMethod);
drawRadio.addEventListener("change", toggleSignatureMethod);

function toggleSignatureMethod() {
  if (uploadRadio.checked) {
    uploadSection.style.display = "block";
    drawSection.style.display = "none";
  } else {
    uploadSection.style.display = "none";
    drawSection.style.display = "block";
  }
}

// Handle Clear Signature
clearButton.addEventListener("click", () => {
  signaturePad.clear();
});

// Form & elements
const form = document.getElementById("registrationForm");
const messageDiv = document.getElementById("message");
const qrCodeDisplay = document.getElementById("qr_code_display");

// Already Registered Container
const alreadyRegisteredContainer = document.getElementById("alreadyRegisteredContainer");
const storedQrDisplay = document.getElementById("storedQrDisplay");
const reuploadBtn = document.getElementById("reuploadBtn");

// Loading Overlay
const loadingOverlay = document.getElementById("loadingOverlay");

// LocalStorage Key (store entire user object)
const STORAGE_KEY = "apc_registration";

// Check if we have a saved registration
const savedReg = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

if (savedReg && savedReg.email) {
  // They already have a registration
  form.classList.add("hidden");
  alreadyRegisteredContainer.classList.remove("hidden");

  // If we have a previously saved QR Code link, show it
  if (savedReg.qr_image_url) {
    // Generate or display existing link
    storedQrDisplay.innerHTML = `
      <img src="${savedReg.qr_image_url}" alt="QR Code" style="max-width: 240px;" />
    `;
  }
} else {
  // No registration found, show the form
  alreadyRegisteredContainer.classList.add("hidden");
  form.classList.remove("hidden");
}

// Re-upload Button: show the form again
reuploadBtn.addEventListener("click", () => {
  alreadyRegisteredContainer.classList.add("hidden");
  form.classList.remove("hidden");
});

// Form submission
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // 1) reCAPTCHA check
  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    displayMessage("Please complete the reCAPTCHA before submitting.", "red");
    return;
  }

  // Show loading overlay
  loadingOverlay.classList.add("active");

  // 2) Collect user input from form
  const name = document.getElementById("name").value.trim();
  const number = document.getElementById("number").value.trim();
  const email = document.getElementById("email").value.trim();
  const schoolName = document.getElementById("school_name").value.trim();
  const idFile = document.getElementById("id_file").files[0];

  const signatureType = document.querySelector('input[name="signature_type"]:checked').value;
  const signatureFile = document.getElementById("signature_file").files[0];

  // Basic Validation
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    hideLoading();
    displayMessage("Invalid name. Only letters and spaces are allowed.", "red");
    return;
  }

  const numberRegex = /^\d{10}$/;
  if (!numberRegex.test(number)) {
    hideLoading();
    displayMessage("Invalid phone number. Must be 10 digits.", "red");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    hideLoading();
    displayMessage("Invalid email address.", "red");
    return;
  }

  if (!schoolName) {
    hideLoading();
    displayMessage("Please enter your school name.", "red");
    return;
  }

  if (!idFile) {
    hideLoading();
    displayMessage("Please attach the front of your school ID.", "red");
    return;
  }

  // 3) IP and Device info
  let userIp = "";
  let deviceInfo = navigator.userAgent || "Unknown Device";

  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    userIp = ipData.ip || "";
  } catch (error) {
    console.warn("Failed to get IP:", error);
    userIp = "Failed to retrieve IP";
  }

  // 4) Check for localStorage existing registration
  const existingReg = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (existingReg && existingReg.email === email) {
    const proceed = confirm(
      `Email (${email}) is already registered. Overwrite?`
    );
    if (!proceed) {
      hideLoading();
      displayMessage("Registration cancelled.", "orange");
      return;
    }
  }

  // Handle signature
  let signatureBase64 = "";
  if (signatureType === "upload") {
    if (!signatureFile) {
      hideLoading();
      displayMessage("Please upload your signature.", "red");
      return;
    }
    signatureBase64 = await convertFileToBase64(signatureFile);
  } else if (signatureType === "draw") {
    if (signaturePad.isEmpty()) {
      hideLoading();
      displayMessage("Please provide a drawn signature.", "red");
      return;
    }
    signatureBase64 = signaturePad.toDataURL("image/png");
  }

  // Convert ID front to Base64
  let idBase64 = "";
  try {
    idBase64 = await convertFileToBase64(idFile);
  } catch (err) {
    hideLoading();
    displayMessage("Failed to load ID image. Please try again.", "red");
    return;
  }

  // 5) Generate local QR code
  qrCodeDisplay.innerHTML = ""; // Clear old
  const qrDataObject = {
    name,
    number,
    email,
    school: schoolName,
    registered: true,
  };
  const qrData = JSON.stringify(qrDataObject);
  const qr = new QRCode(qrCodeDisplay, {
    text: qrData,
    width: 256,
    height: 256,
  });
  // Wait briefly
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Convert the QR code canvas to Base64
  const qrCanvas = qrCodeDisplay.querySelector("canvas");
  const qrBase64 = qrCanvas.toDataURL("image/png");

  // 6) Prepare Discord form data
  const qrImageBlob = await dataURLToBlob(qrBase64);
  const signatureBlob = await dataURLToBlob(signatureBase64);
  const idFrontBlob = await dataURLToBlob(idBase64);

  const formData = new FormData();
  const payload = {
    username: "Registration Bot",
    embeds: [
      {
        title: "New Registration",
        color: 0x6c63ff,
        fields: [
          { name: "Full Name", value: name },
          { name: "Phone Number", value: number },
          { name: "Email", value: email },
          { name: "School", value: schoolName },
          { name: "IP", value: userIp },
          { name: "Device", value: deviceInfo },
          { name: "Registered", value: "✅" },
        ],
        timestamp: new Date(),
      },
    ],
  };

  formData.append("payload_json", JSON.stringify(payload));
  formData.append("files[0]", qrImageBlob, "qr_code.png");
  formData.append("files[1]", signatureBlob, "signature.png");
  formData.append("files[2]", idFrontBlob, "id_front.png");

  // 7) Send to Discord
  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const discordData = await response.json();
      const attachments = discordData.attachments || [];

      let qrUrl = "";
      let signatureUrl = "";
      let idUrl = "";

      if (attachments[0]) qrUrl = attachments[0].url;
      if (attachments[1]) signatureUrl = attachments[1].url;
      if (attachments[2]) idUrl = attachments[2].url;

      // 8) Send confirmation email using EmailJS
      const templateParams = {
        name: name,
        email: email,
        number: number,
        school_name: schoolName,
        ip_address: userIp,
        device_info: deviceInfo,
        qr_image_url: qrUrl,
        signature_url: signatureUrl,
        id_front_url: idUrl
      };

      emailjs
        .send(
          "service_lsgqvja", // <== Your EmailJS service ID
          "template_t7ioajf", // <== Your EmailJS template ID
          templateParams
        )
        .then(
          function (res) {
            // Success
            console.log("Email sent successfully!", res.status, res.text);
            displayMessage(
              "Registration successful! Check your email for the links.",
              "green"
            );
            
            // 9) Save to localStorage
            const regObject = {
              name,
              email,
              qr_image_url: qrUrl,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(regObject));

            // Show that QR in the "alreadyRegisteredContainer" next time
            hideLoading();
            form.reset();
            signaturePad.clear();
          },
          function (error) {
            // Email send fail
            console.log("Failed to send email:", error);
            displayMessage(
              "Registration successful, but failed to send email.",
              "orange"
            );
            
            // Save anyway
            const regObject = {
              name,
              email,
              qr_image_url: qrUrl,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(regObject));

            hideLoading();
            form.reset();
            signaturePad.clear();
          }
        );
    } else {
      console.error("Failed to send data to Discord:", response.statusText);
      displayMessage("Failed to send registration data. Try again later.", "red");
      hideLoading();
    }
  } catch (error) {
    console.error("Error sending data to Discord:", error);
    displayMessage("An error occurred. Please try again later.", "red");
    hideLoading();
  }
});

// Helper Functions

function hideLoading() {
  loadingOverlay.classList.remove("active");
}

function displayMessage(msg, color) {
  messageDiv.innerText = msg;
  messageDiv.style.color = color;
  // Optionally hide after 5s
  setTimeout(() => {
    messageDiv.innerText = "";
  }, 5000);
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target.result);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

function dataURLToBlob(dataurl) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
