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

// 3) Form Submission
const form = document.getElementById("registrationForm");
const messageDiv = document.getElementById("message");
const qrCodeDisplay = document.getElementById("qr_code_display");

// Retrieve array of already-registered emails from localStorage
let registeredEmails = JSON.parse(localStorage.getItem("registered_emails")) || [];

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Get form values
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
    displayMessage("Invalid name. Only letters and spaces are allowed.", "red");
    return;
  }

  const numberRegex = /^\d{10}$/;
  if (!numberRegex.test(number)) {
    displayMessage("Invalid phone number. It must be a 10-digit number.", "red");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    displayMessage("Invalid email address.", "red");
    return;
  }

  if (!schoolName) {
    displayMessage("Please enter your school name.", "red");
    return;
  }

  if (!idFile) {
    displayMessage("Please attach the front of your school ID.", "red");
    return;
  }

  // Check if user re-enters a registered email
  if (registeredEmails.includes(email)) {
    // "Advanced notification" if someone re-registers
    const proceed = confirm(
      `This email (${email}) is already registered. Do you want to proceed and overwrite your previous registration?`
    );
    if (!proceed) {
      displayMessage("Registration cancelled.", "orange");
      return;
    }
  }

  // Handle Signature
  let signatureBase64 = "";
  if (signatureType === "upload") {
    if (!signatureFile) {
      displayMessage("Please upload your signature.", "red");
      return;
    }
    // Convert uploaded image to Base64
    signatureBase64 = await convertFileToBase64(signatureFile);
  } else if (signatureType === "draw") {
    if (signaturePad.isEmpty()) {
      displayMessage("Please provide a signature.", "red");
      return;
    }
    signatureBase64 = signaturePad.toDataURL("image/png");
  } else {
    displayMessage("Invalid signature input.", "red");
    return;
  }

  // Convert ID front to Base64
  let idBase64 = "";
  try {
    idBase64 = await convertFileToBase64(idFile);
  } catch (err) {
    displayMessage("Failed to load ID image. Please try again.", "red");
    return;
  }

  // Generate QR Code (show on the right side)
  const qrDataObject = {
    name: name,
    number: number,
    email: email,
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
      // so we can get their public URLs
      const discordData = await response.json();
      const attachments = discordData.attachments || [];

      // They should appear in order: files[0] -> attachments[0], files[1] -> attachments[1], files[2] -> attachments[2]
      let qrUrl = "";
      let signatureUrl = "";
      let idUrl = "";

      if (attachments[0]) qrUrl = attachments[0].url;
      if (attachments[1]) signatureUrl = attachments[1].url;
      if (attachments[2]) idUrl = attachments[2].url;

      // Send confirmation email using EmailJS with the public URLs
      // (No file attachments to EmailJS, just the links.)
      const templateParams = {
        name: name,
        email: email,
        number: number,
        school_name: schoolName,
        qr_image_url: qrUrl,
        signature_url: signatureUrl,
        id_front_url: idUrl
      };

      emailjs
        .send(
          "service_lsgqvja", // <-- Your EmailJS service ID
          "template_t7ioajf", // <-- Your EmailJS template ID
          templateParams
        )
        .then(
          function (res) {
            console.log("Email sent successfully!", res.status, res.text);
            displayMessage(
              "Registration successful! Check your email for the links (QR code, signature, ID front).",
              "green"
            );

            // Update localStorage with new (or overwritten) registration
            if (!registeredEmails.includes(email)) {
              registeredEmails.push(email);
            }
            localStorage.setItem("registered_emails", JSON.stringify(registeredEmails));

            form.reset();
            signaturePad.clear();
            // We'll keep the QR code displayed for reference
          },
          function (error) {
            console.log("Failed to send email:", error);
            displayMessage(
              "Registration successful, but failed to send email links.",
              "orange"
            );

            // Update localStorage anyway, since Discord was successful
            if (!registeredEmails.includes(email)) {
              registeredEmails.push(email);
            }
            localStorage.setItem("registered_emails", JSON.stringify(registeredEmails));
            form.reset();
            signaturePad.clear();
          }
        );
    } else {
      console.error("Failed to send data to Discord:", response.statusText);
      displayMessage("Failed to send registration data. Please try again later.", "red");
    }
  } catch (error) {
    console.error("Error sending data to Discord:", error);
    displayMessage("An error occurred. Please try again later.", "red");
  }
});

// Helper Functions
function displayMessage(msg, color) {
  messageDiv.innerText = msg;
  messageDiv.style.color = color;
  // Automatically hide the message after 5 seconds (optional)
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
