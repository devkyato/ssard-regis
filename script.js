/*********************************************
 * script.js
 *********************************************/

// DISCORD Webhook
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1325637445756256277/tVpZ_gEHaNbEjziqoN3OCLfcJ4OMymPXqFymJSzoFY9stI--aTvMbQWWCBKpnoI-lIZ5";

// Signature Pad
const canvas = document.getElementById("signature-pad");
const signaturePad = new SignaturePad(canvas);

// Elements
const uploadRadio = document.getElementById("upload");
const drawRadio = document.getElementById("draw");
const uploadSection = document.getElementById("upload_section");
const drawSection = document.getElementById("draw_section");
const clearButton = document.getElementById("clear");

const form = document.getElementById("registrationForm");
const messageDiv = document.getElementById("message");
const qrCodeDisplay = document.getElementById("qr_code_display");

const alreadyRegisteredSection = document.getElementById("alreadyRegisteredSection");
const registeredNameSpan = document.getElementById("registeredName");
const storedQRDiv = document.getElementById("storedQR");
const reuploadBtn = document.getElementById("reuploadBtn");

const formSection = document.getElementById("formSection");
const loadingOverlay = document.getElementById("loadingOverlay");

const mainContainer = document.getElementById("mainContainer");
const headerEl = document.getElementById("header");
const footerEl = document.getElementById("footer");

// Local Storage Key
const LS_KEY = "registration_data"; // store entire data object here

// On page load, check if user data is in localStorage
window.addEventListener("DOMContentLoaded", () => {
  fadeInAll();

  let storedData = JSON.parse(localStorage.getItem(LS_KEY)) || null;
  if (storedData && storedData.email) {
    // Show "already registered" section
    showAlreadyRegistered(storedData);
  } else {
    // Show the form
    formSection.classList.remove("hidden-start");
    formSection.classList.add("show");
  }
});

// Toggle signature method
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

// Clear Signature
clearButton.addEventListener("click", () => {
  signaturePad.clear();
});

// Re-upload button
reuploadBtn.addEventListener("click", () => {
  // Just show the form again
  messageDiv.innerText = "";
  alreadyRegisteredSection.classList.remove("show");
  alreadyRegisteredSection.classList.add("hidden-start");

  formSection.classList.remove("hidden-start");
  formSection.classList.add("show");
});

// Form Submit
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  // Show loading overlay
  showLoading(true);

  // Basic fields
  const name = document.getElementById("name").value.trim();
  const number = document.getElementById("number").value.trim();
  const email = document.getElementById("email").value.trim();
  const schoolName = document.getElementById("school_name").value.trim();
  const idFile = document.getElementById("id_file").files[0];

  const signatureType = document.querySelector('input[name="signature_type"]:checked').value;
  const signatureFile = document.getElementById("signature_file").files[0];

  // Validate
  if (!/^[A-Za-z\s]+$/.test(name)) {
    displayMessage("Invalid name. Only letters and spaces are allowed.", "red");
    showLoading(false);
    return;
  }

  if (!/^\d{10}$/.test(number)) {
    displayMessage("Invalid phone number. It must be a 10-digit number.", "red");
    showLoading(false);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    displayMessage("Invalid email address.", "red");
    showLoading(false);
    return;
  }

  if (!schoolName) {
    displayMessage("Please enter your school name.", "red");
    showLoading(false);
    return;
  }

  if (!idFile) {
    displayMessage("Please attach the front of your school ID.", "red");
    showLoading(false);
    return;
  }

  let signatureBase64 = "";
  if (signatureType === "upload") {
    if (!signatureFile) {
      displayMessage("Please upload your signature.", "red");
      showLoading(false);
      return;
    }
    try {
      signatureBase64 = await convertFileToBase64(signatureFile);
    } catch (err) {
      displayMessage("Failed to read signature file.", "red");
      showLoading(false);
      return;
    }
  } else {
    // draw
    if (signaturePad.isEmpty()) {
      displayMessage("Please draw your signature.", "red");
      showLoading(false);
      return;
    }
    signatureBase64 = signaturePad.toDataURL("image/png");
  }

  // Convert ID to base64
  let idBase64 = "";
  try {
    idBase64 = await convertFileToBase64(idFile);
  } catch (err) {
    displayMessage("Failed to load ID image. Please try again.", "red");
    showLoading(false);
    return;
  }

  // Prepare to fetch user IP + gather device info
  let userIP = "Unknown";
  let deviceInfo = navigator.userAgent || "Unknown";

  try {
    const ipResp = await fetch("https://api.ipify.org?format=json");
    if (ipResp.ok) {
      const ipData = await ipResp.json();
      userIP = ipData.ip || "Unknown";
    }
  } catch (err) {
    console.warn("Failed to retrieve IP address:", err);
  }

  // Create QR
  qrCodeDisplay.innerHTML = "";
  const qrDataObject = {
    name,
    number,
    email,
    schoolName,
    registered: true,
  };

  const qr = new QRCode(qrCodeDisplay, {
    text: JSON.stringify(qrDataObject),
    width: 256,
    height: 256,
  });

  await new Promise((r) => setTimeout(r, 500));

  const qrCanvas = qrCodeDisplay.querySelector("canvas");
  const qrBase64 = qrCanvas.toDataURL("image/png");

  // Convert to Blob
  const qrBlob = await dataURLToBlob(qrBase64);
  const signatureBlob = await dataURLToBlob(signatureBase64);
  const idBlob = await dataURLToBlob(idBase64);

  // Prepare Discord formData
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
  formData.append("files[0]", qrBlob, "qr_code.png");
  formData.append("files[1]", signatureBlob, "signature.png");
  formData.append("files[2]", idBlob, "id_front.png");

  // Send to Discord Webhook
  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // Discord response
      const discordData = await response.json();
      const attachments = discordData.attachments || [];
      let qrUrl = "";
      let signatureUrl = "";
      let idUrl = "";

      if (attachments[0]) qrUrl = attachments[0].url;
      if (attachments[1]) signatureUrl = attachments[1].url;
      if (attachments[2]) idUrl = attachments[2].url;

      // EmailJS
      const templateParams = {
        name,
        email,
        number,
        school_name: schoolName,
        qr_image_url: qrUrl,
        signature_url: signatureUrl,
        id_front_url: idUrl,
        ip_address: userIP,
        device_info: deviceInfo,
      };

      emailjs
        .send(
          "service_lsgqvja",  // your EmailJS service
          "template_t7ioajf", // your EmailJS template
          templateParams
        )
        .then(
          function (res) {
            console.log("Email sent successfully!", res.status, res.text);
            displayMessage("Registration successful! Please check your email.", "green");

            // Save in localStorage
            const storeObj = {
              name,
              email,
              number,
              schoolName,
              qrBase64
            };
            localStorage.setItem(LS_KEY, JSON.stringify(storeObj));

            form.reset();
            signaturePad.clear();
            showLoading(false);

            // Show user is already registered
            showAlreadyRegistered(storeObj);
          },
          function (error) {
            console.log("Failed to send email:", error);
            displayMessage(
              "Registration successful, but failed to send email links.",
              "orange"
            );

            // Still save
            const storeObj = {
              name,
              email,
              number,
              schoolName,
              qrBase64
            };
            localStorage.setItem(LS_KEY, JSON.stringify(storeObj));

            form.reset();
            signaturePad.clear();
            showLoading(false);

            // Show user is already registered
            showAlreadyRegistered(storeObj);
          }
        );
    } else {
      console.error("Failed to send data to Discord:", response.statusText);
      displayMessage(
        "Failed to send registration data. Please try again later.",
        "red"
      );
      showLoading(false);
    }
  } catch (error) {
    console.error("Error sending data to Discord:", error);
    displayMessage("An error occurred. Please try again later.", "red");
    showLoading(false);
  }
});

// Helpers
function displayMessage(msg, color) {
  messageDiv.innerText = msg;
  messageDiv.style.color = color;
}

// Show loading overlay
function showLoading(isLoading) {
  if (isLoading) {
    loadingOverlay.classList.add("active");
  } else {
    loadingOverlay.classList.remove("active");
  }
}

// Convert file to base64
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => resolve(evt.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// DataURL -> Blob
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

// Show Already Registered UI
function showAlreadyRegistered(dataObj) {
  // Hide form
  formSection.classList.remove("show");
  formSection.classList.add("hidden-start");

  // Show already-registered section
  alreadyRegisteredSection.classList.remove("hidden-start");
  alreadyRegisteredSection.classList.add("show");

  registeredNameSpan.textContent = dataObj.name || "User";
  storedQRDiv.innerHTML = "";
  if (dataObj.qrBase64) {
    // show the QR in storedQRDiv
    const img = new Image();
    img.src = dataObj.qrBase64;
    img.style.width = "256px";
    img.style.height = "256px";
    img.style.borderRadius = "8px";
    storedQRDiv.appendChild(img);
  }
}

/** Animate in all fade-init elements */
function fadeInAll() {
  const fadeElems = document.querySelectorAll(".fade-init");
  fadeElems.forEach((elem) => {
    // delay to ensure rendering
    setTimeout(() => {
      elem.classList.add("show");
    }, 200);
  });
}
