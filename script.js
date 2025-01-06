// script.js
(function() {
  //
  // 1) Script URLs for the 3 libraries (Signature Pad, QRCode.js, EmailJS)
  //
  const libsToLoad = [
    "https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
    "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"
  ];

  /**
   * loadScript(url): dynamically create a <script> tag.
   * Returns a Promise that resolves once the script loads.
   */
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const scriptEl = document.createElement("script");
      scriptEl.src = url;
      scriptEl.onload = () => resolve(url);
      scriptEl.onerror = () => reject(new Error(`Failed to load: ${url}`));
      document.head.appendChild(scriptEl);
    });
  }

  /**
   * initApp: main function that loads libraries, then runs your registration code.
   */
  async function initApp() {
    try {
      // Load all external libraries in sequence
      for (const url of libsToLoad) {
        await loadScript(url);
      }
      // Once loaded, run your main registration code
      runRegistrationLogic();
    } catch (err) {
      console.error("Error loading external libraries:", err);
    }
  }

  /**
   * runRegistrationLogic: your original code, adapted to run immediately
   * after libs are loaded (no DOMContentLoaded needed).
   */
  function runRegistrationLogic() {
    // ============================
    // Constants & Configuration
    // ============================
    const DISCORD_WEBHOOK_URL    = "https://discord.com/api/webhooks/1325637445756256277/tVpZ_gEHaNbEjziqoN3OCLfcJ4OMymPXqFymJSzoFY9stI--aTvMbQWWCBKpnoI-lIZ5";
    const EMAILJS_SERVICE_ID     = "service_lsgqvja";
    const EMAILJS_TEMPLATE_ID    = "template_t7ioajf";
    const EMAILJS_USER_ID        = "SSDcjFdMjBWH15ZIq"; 
    const LS_KEY                 = "regg";
    const LS_SLOT_KEY            = "regg";
    const INITIAL_SLOTS          = 180;

    // Initialize EmailJS (now loaded)
    emailjs.init(EMAILJS_USER_ID);

    // ============================
    // Grab DOM Elements
    // ============================
    const consentModal             = document.getElementById("consentModal");
    const consentAcceptBtn         = document.getElementById("consentAcceptBtn");
    const loadingOverlay           = document.getElementById("loadingOverlay");
    const mainContainer            = document.getElementById("mainContainer");
    const header                   = document.getElementById("header");
    const footer                   = document.querySelector("footer");
    const formSection              = document.getElementById("formSection");
    const registrationForm         = document.getElementById("registrationForm");
    const messageDiv               = document.getElementById("message");
    const uploadRadio              = document.getElementById("upload");
    const drawRadio                = document.getElementById("draw");
    const uploadSection            = document.getElementById("upload_section");
    const drawSection              = document.getElementById("draw_section");
    const clearButton              = document.getElementById("clear");
    const alreadyRegisteredSection = document.getElementById("alreadyRegisteredSection");
    const registeredNameSpan       = document.getElementById("registeredName");
    const storedQRDiv              = document.getElementById("storedQR");
    const reuploadBtn              = document.getElementById("reuploadBtn");
    const qrCodeDisplay            = document.getElementById("storedQR");
    const slotsLeftSpan            = document.getElementById("slotsLeft");
    const canvas                   = document.getElementById("signature-pad");

    // Create Signature Pad instance
    const signaturePad = new SignaturePad(canvas);

    /**
     * Initialize the registration form’s default state
     */
    function initializeApp() {
      if (!localStorage.getItem(LS_SLOT_KEY)) {
        localStorage.setItem(LS_SLOT_KEY, INITIAL_SLOTS);
      }
      updateSlotsDisplay();

      // Check if user already registered
      const existingData = JSON.parse(localStorage.getItem(LS_KEY)) || null;
      if (existingData && existingData.email) {
        // Hide consent modal
        consentModal.style.display = "none";
        showAlreadyRegistered(existingData);
      } else {
        // If not registered, check if we have slots
          mainContainer.classList.add("show");
          header.classList.add("show");
          footer.classList.add("show");
          displayMessage("Registration is now closed. No slots left.", "red");
      }

      // If the modal is hidden, show the main container
      if (!consentModal.style.display || consentModal.style.display === "none") {
        mainContainer.classList.add("show");
        header.classList.add("show");
        footer.classList.add("show");
      }
    }

    /**
     * Show/hide upload/draw signature sections
     */
    function toggleSignatureMethod() {
      if (uploadRadio.checked) {
        uploadSection.style.display = "block";
        drawSection.style.display   = "none";
      } else {
        uploadSection.style.display = "none";
        drawSection.style.display   = "block";
      }
    }

    /**
     * Form Submission
     */
    async function handleFormSubmit(e) {
      e.preventDefault();
      showLoading(true);

      const nameValue       = document.getElementById("name").value.trim();
      const numberValue     = document.getElementById("number").value.trim();
      const emailValue      = document.getElementById("email").value.toLowerCase();
      const schoolValue     = document.getElementById("school_name").value.toLowerCase();
      const idFrontFile     = document.getElementById("id_file").files[0];
      const signatureType   = document.querySelector('input[name="signature_type"]:checked').value;
      const signatureFile   = document.getElementById("signature_file").files[0];

      // Validate
      const validationError = validateFormInputs(
        nameValue,
        numberValue,
        emailValue,
        schoolValue,
        idFrontFile,
        signatureType,
        signatureFile
      );
      if (validationError) {
        displayMessage(validationError, "red");
        showLoading(false);
        return;
      }

      // Convert signature => base64
      let signatureBase64 = "";
      if (signatureType === "upload") {
        try {
          signatureBase64 = await convertFileToBase64(signatureFile);
        } catch (errFile) {
          displayMessage("Failed to read signature file.", "red");
          showLoading(false);
          return;
        }
      } else {
        // Drawn signature
        if (signaturePad.isEmpty()) {
          displayMessage("Please upload your signature.", "red");
          showLoading(false);
          return;
        }
        signatureBase64 = signaturePad.toDataURL("image/png");
      }

      // Convert ID front => base64
      let idFrontBase64 = "";
      try {
        idFrontBase64 = await convertFileToBase64(idFrontFile);
      } catch (errID) {
        displayMessage("Failed to load ID image. Please try again.", "red");
        showLoading(false);
        return;
      }

      // Get IP address
      let ipAddress  = "Unknown";
      let deviceInfo = navigator.userAgent || "Unknown";
      try {
        const ipResp = await fetch("https://api.ipify.org?format=json");
        if (ipResp.ok) {
          const ipData = await ipResp.json();
          ipAddress    = ipData.ip || "Unknown";
        }
      } catch (err2) {
        console.warn("Failed to retrieve IP address:", err2);
      }

      // Generate a QR code in #storedQR
      qrCodeDisplay.innerHTML = "";
      new QRCode(qrCodeDisplay, {
        text: JSON.stringify({
          name:       nameValue,
          number:     numberValue,
          email:      emailValue,
          schoolName: schoolValue,
          registered: true
        }),
        width: 256,
        height:256
      });

      // Wait for QR to render
      await new Promise(r => setTimeout(r, 500));

      const qrCanvas = qrCodeDisplay.querySelector("canvas");
      const qrData   = qrCanvas.toDataURL("image/png");
      const qrBlob   = await dataURLToBlob(qrData);

      // Convert signature & ID image => Blobs
      const signatureBlob = await dataURLToBlob(signatureBase64);
      const idFrontBlob   = await dataURLToBlob(idFrontBase64);

      // Construct data for Discord
      const formData = new FormData();
      const discordEmbeds = {
        username: "Registration Bot",
        embeds: [
          {
            title: "New Registration",
            color: 7103487,
            fields: [
              { name: "Name",        value: nameValue },
              { name: "Number",      value: numberValue },
              { name: "Email",       value: emailValue },
              { name: "School",      value: schoolValue },
              { name: "IP Address",  value: ipAddress },
              { name: "Device Info", value: deviceInfo },
              { name: "Registered",  value: "✅" }
            ],
            timestamp: new Date()
          }
        ]
      };
      formData.append("payload_json", JSON.stringify(discordEmbeds));
      formData.append("files[0]", qrBlob,       "qr_code.png");
      formData.append("files[1]", signatureBlob,"signature.png");
      formData.append("files[2]", idFrontBlob,  "id_front.png");

      try {
        // Send to Discord
        const discordResp = await fetch(DISCORD_WEBHOOK_URL, {
          method:"POST",
          body:  formData
        });

        if (discordResp.ok) {
          let qrUrl        = "";
          let signatureUrl = "";
          let idFrontUrl   = "";
          let discordJson  = null;
          try {
            discordJson = await discordResp.json();
          } catch (err3) {
            console.warn("No JSON response from Discord (likely 204).");
          }

          if (discordJson && discordJson.attachments) {
            if (discordJson.attachments[0]) {
              qrUrl = discordJson.attachments[0].url;
            }
            if (discordJson.attachments[1]) {
              signatureUrl = discordJson.attachments[1].url;
            }
            if (discordJson.attachments[2]) {
              idFrontUrl   = discordJson.attachments[2].url;
            }
          }

          // Prepare data for EmailJS
          const emailData = {
            name:          nameValue,
            email:         emailValue,
            number:        numberValue,
            school_name:   schoolValue,
            qr_image_url:  qrUrl,
            signature_url: signatureUrl,
            id_front_url:  idFrontUrl,
            ip_address:    ipAddress,
            device_info:   deviceInfo
          };

          // Send via EmailJS
          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailData)
            .then(
              (res) => {
                console.log("Email sent successfully!", res.status, res.text);
                displayMessage("Registration successful! Please check your Gmail for confirmation.", "green");

                const localData = {
                  name:       nameValue,
                  email:      emailValue,
                  number:     numberValue,
                  schoolName: schoolValue,
                  qrBase64:   qrData
                };
                localStorage.setItem(LS_KEY, JSON.stringify(localData));

                // Decrement slots
                let currentSlots = parseInt(localStorage.getItem(LS_SLOT_KEY), 10);
                currentSlots = currentSlots > 0 ? currentSlots - 1 : 0;
                localStorage.setItem(LS_SLOT_KEY, currentSlots);
                updateSlotsDisplay();

                registrationForm.reset();
                signaturePad.clear();
                showLoading(false);
                showAlreadyRegistered(localData);
              },
              (err4) => {
                console.error("Failed to send email:", err4);
                displayMessage("Registration successful, but failed to send email links.", "orange");

                const localData = {
                  name:       nameValue,
                  email:      emailValue,
                  number:     numberValue,
                  schoolName: schoolValue,
                  qrBase64:   qrData
                };
                localStorage.setItem(LS_KEY, JSON.stringify(localData));

                let currentSlots = parseInt(localStorage.getItem(LS_SLOT_KEY), 10);
                currentSlots = currentSlots > 0 ? currentSlots - 1 : 0;
                localStorage.setItem(LS_SLOT_KEY, currentSlots);
                updateSlotsDisplay();

                registrationForm.reset();
                signaturePad.clear();
                showLoading(false);
                showAlreadyRegistered(localData);
              }
            );
        } else {
          console.error("Failed to send data to Discord:", discordResp.statusText);
          displayMessage("Failed to send registration data. Please try again later.", "red");
          showLoading(false);
        }
      } catch (err5) {
        console.error("Error sending data to Discord:", err5);
        displayMessage("An error occurred. Please try again later.", "red");
        showLoading(false);
      }
    }

    function validateFormInputs(
      nameVal,
      numberVal,
      emailVal,
      schoolVal,
      idFile,
      sigType,
      sigFile
    ) {
      if (!/^[A-Za-z\s]+$/.test(nameVal)) {
        return "Invalid name. Only letters and spaces are allowed.";
      }
      if (!/^\d{10}$/.test(numberVal)) {
        return "Invalid phone number. It must be a 10-digit number.";
      }
      if (!/^[^\s@]+@gmail\.com$/.test(emailVal)) {
        return "Invalid email address. Only Gmail addresses are allowed.";
      }
      if (!schoolVal) {
        return "Please enter your school name.";
      }
      if (!idFile) {
        return "Please attach the front of your school ID.";
      }
      if (sigType === "upload" && !sigFile) {
        return "Please upload your signature.";
      }
      return null;
    }

    function displayMessage(msg, color) {
      messageDiv.innerText     = msg;
      messageDiv.style.color   = color;
      messageDiv.style.opacity = "1";
      setTimeout(() => {
        messageDiv.style.opacity = "0";
      }, 5000);
    }

    function showLoading(isLoading) {
      if (isLoading) {
        loadingOverlay.classList.add("active");
      } else {
        loadingOverlay.classList.remove("active");
      }
    }

    function showAlreadyRegistered(data) {
      formSection.classList.add("hidden-start");
      formSection.classList.remove("show");

      alreadyRegisteredSection.classList.remove("hidden-start");
      alreadyRegisteredSection.classList.add("show");

      registeredNameSpan.innerHTML = data.name || "Unknown";

      storedQRDiv.innerHTML = "";
      if (data.qrBase64) {
        const qrImg = new Image();
        qrImg.src                = data.qrBase64;
        qrImg.style.borderRadius = "8px";
        qrImg.style.width        = "256px";
        qrImg.style.height       = "256px";
        storedQRDiv.appendChild(qrImg);
      }

      const currentSlots = parseInt(localStorage.getItem(LS_SLOT_KEY), 10);
      if (currentSlots <= 0) {
        displayMessage("All slots have been filled. Registration is now closed.", "red");
      }
    }

    function updateSlotsDisplay() {
      const currentSlots = parseInt(localStorage.getItem(LS_SLOT_KEY), 10);
      slotsLeftSpan.textContent = currentSlots > 0 ? currentSlots : "0";

      if (currentSlots <= 0) {
        const existingData = JSON.parse(localStorage.getItem(LS_KEY)) || null;
        if (!existingData || !existingData.email) {
          formSection.classList.add("hidden-start");
          formSection.classList.remove("show");
          displayMessage("Registration is now closed. No slots left.", "red");
        }
      }
    }

    function convertFileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (ev) => resolve(ev.target.result);
        reader.onerror = (ev) => reject(ev);
        reader.readAsDataURL(file);
      });
    }

    function dataURLToBlob(dataURL) {
      const parts = dataURL.split(",");
      const match = parts[0].match(/:(.*?);/);
      const mime  = match ? match[1] : "";
      const bstr  = atob(parts[1]);
      const n     = bstr.length;
      const u8arr = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      return new Blob([u8arr], { type: mime });
    }

    //
    // Attach event listeners
    //
    consentAcceptBtn.addEventListener("click", () => {
      consentModal.style.display = "none";
      initializeApp();
    });
    uploadRadio.addEventListener("change", toggleSignatureMethod);
    drawRadio.addEventListener("change",  toggleSignatureMethod);
    clearButton.addEventListener("click", () => signaturePad.clear());
    reuploadBtn.addEventListener("click", () => {
      alreadyRegisteredSection.classList.add("hidden-start");
      alreadyRegisteredSection.classList.remove("show");
      formSection.classList.remove("hidden-start");
      formSection.classList.add("show");
      messageDiv.innerText = "";
    });
    registrationForm.addEventListener("submit", handleFormSubmit);
  }

  // **Kick off** as soon as the script is evaluated (because of `defer`).
  initApp();
})();
