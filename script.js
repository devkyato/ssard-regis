// script.js

// 1) Discord Webhook URL
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1325637445756256277/tVpZ_gEHaNbEjziqoN3OCLfcJ4OMymPXqFymJSzoFY9stI--aTvMbQWWCBKpnoI-lIZ5";

// 2) Initialize Signature Pad
const canvas = document.getElementById("signature-pad");
const signaturePad = new SignaturePad(canvas);

// Handle signature type toggle
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

// 3) Additional DOM elements
const form = document.getElementById("registrationForm");
const messageDiv = document.getElementById("message");
const qrCodeDisplay = document.getElementById("qr_code_display");
const mainContainer = document.getElementById("mainContainer");
const alreadyRegisteredBlock = document.getElementById("alreadyRegisteredBlock");
const storedQRBox = document.getElementById("storedQRBox");
const reuploadBtn = document.getElementById("reuploadBtn");
const loadingOverlay = document.getElementById("loadingOverlay");

// We'll store data in localStorage with the key "apc_registrations"
let registrations = JSON.parse(localStorage.getItem("apc_registrations")) || {};

// On page load, check if user has a "currentEmail" in localStorage
// and show them a previously stored QR if it exists
let currentEmail = localStorage.getItem("currentEmail");
if (currentEmail && registrations[currentEmail]) {
  // Show the "already registered" block
  showAlreadyRegistered(registrations[currentEmail].qrBase64);
} else {
  alreadyRegisteredBlock.style.display = "none";
}

// Reupload logic
reuploadBtn.addEventListener("click", () => {
  // Hide the block, show the form
  alreadyRegisteredBlock.style.display = "none";
  form.style.display = "block";
});

// Device Info & IP
let userIP = "";
let deviceInfo = "";

// Get IP (using a free IPify API)
fetch("https://api.ipify.org?format=json")
  .then((response) => response.json())
  .then((data) => {
    userIP = data.ip || "Unknown IP";
  })
  .catch(() => {
    userIP = "Unknown IP";
  });

// Gather some basic device info
deviceInfo = navigator.userAgent || "Unknown Device Info";

// Form Submission
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  
  // Show loading overlay
  loadingOverlay.style.display = "flex";

  // Get form values
  const name = document.getElementById("name").value.trim();
  const number = document.getElementById("number").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
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
    displayMessage("Invalid phone number. It must be a 10-digit number.", "red");
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

  // If they're re-registering with the same email, ask if they'd like to proceed
  if (registrations[email]) {
    const proceed = confirm(
      `This email (${email}) is already registered. Do you want to overwrite the previous registration?`
    );
    if (!proceed) {
      hideLoading();
      displayMessage("Registration cancelled.", "orange");
      return;
    }
  }

  // Handle Signature
  let signatureBase64 = "";
  if (signatureType === "upload") {
    if (!signatureFile) {
      hideLoading();
      displayMessage("Please upload your signature.", "red");
      return;
    }
    // Convert uploaded image to Base64
    signatureBase64 = await convertFileToBase64(signatureFile);
  } else if (signatureType === "draw") {
    if (signaturePad.isEmpty()) {
      hideLoading();
      displayMessage("Please provide a signature.", "red");
      return;
    }
    signatureBase64 = signaturePad.toDataURL("image/png");
  } else {
    hideLoading();
    displayMessage("Invalid signature input.", "red");
    return;
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

  // Generate QR Code
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

  // Wait briefly for QR code to generate
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Convert the QR code canvas to Base64
  const qrCanvas = qrCodeDisplay.querySelector("canvas");
  const qrBase64 = qrCanvas.toDataURL("image/png");

  // Prepare Blobs for Discord
  const qrImageBlob = await dataURLToBlob(qrBase64);
  const signatureBlob = await dataURLToBlob(signatureBase64);
  const idFrontBlob = await dataURLToBlob(idBase64);

  // Prepare Discord Payload
  const formData = new FormData();
  const payload = {
    username: "Registration Bot",
    embeds: [
      {
        title: "New Registration",
        color: 0x6c63ff,
        fields: [
          { name: "Name", value: name },
          { name: "Number", value: number },
          { name: "Email", value: email },
          { name: "School", value: schoolName },
          { name: "IP Address", value: userIP },
          { name: "Device Info", value: deviceInfo },
          { name: "Registered", value: "✅" },
        ],
        timestamp: new Date(),
      },
    ],
  };

  formData.append("payload_json", JSON.stringify(payload));
  formData.append("files[0]", qrImageBlob, "qr_code.png");
  formData.append("files[1]", signatureBlob, "signature.png");
  formData.append("files[2]", idFrontBlob, "id_front.png"); // The school ID front

  // Send to Discord Webhook
  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // Attempt to get the attachments array from the created message
      const discordData = await response.json();
      const attachments = discordData.attachments || [];

      let qrUrl = "";
      let signatureUrl = "";
      let idUrl = "";

      if (attachments[0]) qrUrl = attachments[0].url;
      if (attachments[1]) signatureUrl = attachments[1].url;
      if (attachments[2]) idUrl = attachments[2].url;

      // Send confirmation email using EmailJS with the public URLs
      const templateParams = {
        name,
        email,
        number,
        school_name: schoolName,
        qr_image_url: qrUrl,
        signature_url: signatureUrl,
        id_front_url: idUrl,
        user_ip: userIP,
        device_info: deviceInfo
      };

      emailjs
        .send(
          "service_lsgqvja", // <-- Your EmailJS service ID
          "template_t7ioajf", // <-- Your EmailJS template ID
          templateParams
        )
        .then(
          function (res) {
            hideLoading();
            console.log("Email sent successfully!", res.status, res.text);
            displayMessage(
              "Registration successful! Check your email for links (QR, signature, ID).",
              "lime"
            );

            // Store in localStorage
            registrations[email] = {
              name,
              number,
              email,
              school: schoolName,
              qrBase64,
            };
            localStorage.setItem("apc_registrations", JSON.stringify(registrations));
            localStorage.setItem("currentEmail", email);

            // Reset form
            form.reset();
            signaturePad.clear();
          },
          function (error) {
            hideLoading();
            console.log("Failed to send email:", error);
            displayMessage(
              "Registration successful, but failed to send email links.",
              "orange"
            );

            // Store anyway since Discord was successful
            registrations[email] = {
              name,
              number,
              email,
              school: schoolName,
              qrBase64,
            };
            localStorage.setItem("apc_registrations", JSON.stringify(registrations));
            localStorage.setItem("currentEmail", email);

            form.reset();
            signaturePad.clear();
          }
        );
    } else {
      hideLoading();
      console.error("Failed to send data to Discord:", response.statusText);
      displayMessage("Failed to send registration data. Please try again later.", "red");
    }
  } catch (error) {
    hideLoading();
    console.error("Error sending data to Discord:", error);
    displayMessage("An error occurred. Please try again later.", "red");
  }
});

// Helper Functions
function showAlreadyRegistered(qrBase64) {
  // Show the block
  alreadyRegisteredBlock.style.display = "block";
  form.style.display = "none";

  // Display the stored QR code
  storedQRBox.innerHTML = "";
  if (qrBase64) {
    const img = document.createElement("img");
    img.src = qrBase64;
    img.style.width = "100%";
    img.style.height = "auto";
    storedQRBox.appendChild(img);
  }
}

function displayMessage(msg, color) {
  messageDiv.innerText = msg;
  messageDiv.style.color = color;
  // Optionally clear the message after some time:
  // setTimeout(() => { messageDiv.innerText = ""; }, 5000);
}

function hideLoading() {
  loadingOverlay.style.display = "none";
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
