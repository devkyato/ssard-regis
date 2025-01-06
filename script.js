(function() {
    // ============================
    // Constants & Configuration
    // ============================
    const DISCORD_WEBHOOK_URL    = "https://discord.com/api/webhooks/1325637445756256277/tVpZ_gEHaNbEjziqoN3OCLfcJ4OMymPXqFymJSzoFY9stI--aTvMbQWWCBKpnoI-lIZ5";
    const EMAILJS_SERVICE_ID     = "service_lsgqvja";
    const EMAILJS_TEMPLATE_ID    = "template_t7ioajf";
    const EMAILJS_USER_ID        = "SSDcjFdMjBWH15ZIq"; 
    const LS_KEY                 = "registration_data_ssard";
    const LS_SLOT_KEY            = "registration_slots_left";
    const INITIAL_SLOTS          = 180;

    // Initialize EmailJS
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
    const clearButton              = document.getElementById("signature-pad");
    const alreadyRegisteredSection = document.getElementById("alreadyRegisteredSection");
    const registeredNameSpan       = document.getElementById("registeredName");
    const storedQRDiv              = document.getElementById("storedQR");
    const reuploadBtn              = document.getElementById("reuploadBtn");
    const qrCodeDisplay            = document.getElementById("storedQR");
    const slotsLeftSpan            = document.getElementById("slotsLeft");
    const canvas                   = document.getElementById("canvas");

    // Signature Pad instance
    const signaturePad = new SignaturePad(canvas);

    // ============================
    // Main Functions
    // ============================

    /**
     * Initial setup: checks whether localStorage has a record of 
     * a user’s registration or available slots, etc.
     */
    function initializeApp() {
        if (!localStorage.getItem(LS_SLOT_KEY)) {
            localStorage.setItem(LS_SLOT_KEY, INITIAL_SLOTS);
        }
        updateSlotsDisplay();

        // If user already registered, show "already registered" info
        const existingData = JSON.parse(localStorage.getItem(LS_KEY)) || null;
        if (existingData && existingData.email) {
            // Hide the consent modal
            consentModal.style.display = "none";
            showAlreadyRegistered(existingData);
        } else {
            // If not registered, check if there are slots
            const currentSlots = parseInt(localStorage.getItem(LS_SLOT_KEY), 10);
            if (currentSlots > 0) {
                // Show the consent modal
                consentModal.style.display = "block";
            } else {
                // No slots left => show everything but display a message
                mainContainer.classList.add("show");
                header.classList.add("show");
                footer.classList.add("show");
                displayMessage("Registration is now closed. No slots left.", "red");
            }
        }

        // If the modal is hidden, show the main container
        if (!consentModal.style.display || consentModal.style.display === "none") {
            mainContainer.classList.add("show");
            header.classList.add("show");
            footer.classList.add("show");
        }
    }

    /**
     * Toggles the method of signature collection (upload vs draw).
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
     * Handles the form submission:
     * Validates data, collects form values, obtains IP, 
     * sends info to Discord, and attempts email via EmailJS.
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        showLoading(true);

        // Gather inputs
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

        // Convert signature to base64 (upload vs drawn)
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
            // If user chose to draw
            if (signaturePad.isEmpty()) {
                displayMessage("Please upload your signature.", "red");
                showLoading(false);
                return;
            }
            signatureBase64 = signaturePad.toDataURL("image/png");
        }

        // Convert ID front file to base64
        let idFrontBase64 = "";
        try {
            idFrontBase64 = await convertFileToBase64(idFrontFile);
        } catch (errID) {
            displayMessage("Failed to load ID image. Please try again.", "red");
            showLoading(false);
            return;
        }

        // Try to get IP address
        let ipAddress   = "Unknown";
        let deviceInfo  = navigator.userAgent || "Unknown";

        try {
            const ipResp = await fetch("https://api.ipify.org?format=json");
            if (ipResp.ok) {
                const ipData = await ipResp.json();
                ipAddress    = ipData.ip || "Unknown";
            }
        } catch (err) {
            console.warn("Failed to retrieve IP address:", err);
        }

        // Generate a QR code
        qrCodeDisplay.innerHTML = "";
        new QRCode(qrCodeDisplay, {
            text: JSON.stringify({
                name:     nameValue,
                number:   numberValue,
                email:    emailValue,
                schoolName: schoolValue,
                registered: true
            }),
            width:  256,
            height: 256
        });

        // Slight delay so QR code finishes rendering
        await new Promise(r => setTimeout(r, 500));

        // Convert the on-screen QR code to a dataURL Blob
        const qrCanvas = qrCodeDisplay.querySelector("canvas");
        const qrData   = qrCanvas.toDataURL("image/png");
        const qrBlob   = await dataURLToBlob(qrData);

        // Convert our signature & ID image to Blob
        const signatureBlob = await dataURLToBlob(signatureBase64);
        const idFrontBlob   = await dataURLToBlob(idFrontBase64);

        // Construct form data to send to Discord
        const formData = new FormData();
        const discordEmbeds = {
            username: "Registration Bot",
            embeds: [
                {
                    title: "New Registration",
                    color: 7103487,
                    fields: [
                        { name: "Name",         value: nameValue },
                        { name: "Number",       value: numberValue },
                        { name: "Email",        value: emailValue },
                        { name: "School",       value: schoolValue },
                        { name: "IP Address",   value: ipAddress },
                        { name: "Device Info",  value: deviceInfo },
                        { name: "Registered",   value: "✅" }
                    ],
                    timestamp: new Date()
                }
            ]
        };

        formData.append("payload_json", JSON.stringify(discordEmbeds));
        formData.append("files[0]", qrBlob,       "qr_code.png");
        formData.append("files[1]", signatureBlob,"signature.png");
        formData.append("files[2]", idFrontBlob,  "id_front.png");

        // Send to Discord
        try {
            const discordResp = await fetch(DISCORD_WEBHOOK_URL, {
                method: "POST",
                body:   formData
            });

            if (discordResp.ok) {
                // Discord response might contain the uploaded file URLs in "attachments"
                let qrUrl      = "";
                let signatureUrl = "";
                let idFrontUrl   = "";
                let discordJson  = null;

                try {
                    discordJson = await discordResp.json();
                } catch (e) {
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
                        idFrontUrl = discordJson.attachments[2].url;
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

                // Send Email via EmailJS
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailData)
                .then(
                    (res) => {
                        console.log("Email sent successfully!", res.status, res.text);
                        displayMessage("Registration successful! Please check your Gmail for confirmation.", "green");

                        // Store local data
                        const localData = {
                            name:     nameValue,
                            email:    emailValue,
                            number:   numberValue,
                            schoolName: schoolValue,
                            qrBase64: qrData
                        };
                        localStorage.setItem(LS_KEY, JSON.stringify(localData));

                        // Decrement slot count
                        let currentSlots = parseInt(localStorage.getItem(LS_SLOT_KEY), 10);
                        currentSlots = currentSlots > 0 ? currentSlots - 1 : 0;
                        localStorage.setItem(LS_SLOT_KEY, currentSlots);
                        updateSlotsDisplay();

                        // Reset the form
                        registrationForm.reset();
                        signaturePad.clear();
                        showLoading(false);
                        showAlreadyRegistered(localData);
                    },
                    (err) => {
                        console.error("Failed to send email:", err);
                        displayMessage("Registration successful, but failed to send email links.", "orange");

                        // Even if email fails, still store data & reduce slots
                        const localData = {
                            name:     nameValue,
                            email:    emailValue,
                            number:   numberValue,
                            schoolName: schoolValue,
                            qrBase64: qrData
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
        } catch (err) {
            console.error("Error sending data to Discord:", err);
            displayMessage("An error occurred. Please try again later.", "red");
            showLoading(false);
        }
    }

    /**
     * Validate the form inputs.
     */
    function validateFormInputs(
        nameVal,
        numberVal,
        emailVal,
        schoolVal,
        idFile,
        sigType,
        sigFile
    ) {
        // 1. Name must be letters and spaces only
        if (!/^[A-Za-z\s]+$/.test(nameVal)) {
            return "Invalid name. Only letters and spaces are allowed.";
        }
        // 2. Number must be exactly 10 digits
        if (!/^\d{10}$/.test(numberVal)) {
            return "Invalid phone number. It must be a 10-digit number.";
        }
        // 3. Email must be a valid Gmail address
        if (!/^[^\s@]+@gmail\.com$/.test(emailVal)) {
            return "Invalid email address. Only Gmail addresses are allowed.";
        }
        // 4. Must have a school name
        if (!schoolVal) {
            return "Please enter your school name.";
        }
        // 5. Must attach ID file
        if (!idFile) {
            return "Please attach the front of your school ID.";
        }
        // 6. If signature type is “upload”, must have a signature file
        if (sigType === "upload" && !sigFile) {
            return "Please upload your signature.";
        }
        return null;
    }

    /**
     * Display a message on-screen, then fade it out after a few seconds.
     */
    function displayMessage(msg, color) {
        messageDiv.innerText           = msg;
        messageDiv.style.color         = color;
        messageDiv.style.opacity       = "1";

        setTimeout(() => {
            messageDiv.style.opacity = "0";
        }, 5000);
    }

    /**
     * Show or hide a loading overlay.
     */
    function showLoading(isLoading) {
        if (isLoading) {
            loadingOverlay.classList.add("active");
        } else {
            loadingOverlay.classList.remove("active");
        }
    }

    /**
     * Show the “Already Registered” section and hide the form.
     */
    function showAlreadyRegistered(data) {
        // Hide the form section
        formSection.classList.add("hidden-start");
        formSection.classList.remove("show");

        // Show the “already registered” section
        alreadyRegisteredSection.classList.remove("hidden-start");
        alreadyRegisteredSection.classList.add("show");

        // Show the user’s name
        registeredNameSpan.innerHTML = data.name || "Unknown";

        // Show the QR code from localStorage
        storedQRDiv.innerHTML = "";
        if (data.qrBase64) {
            (function() {
                const qrImg              = new Image();
                qrImg.src                = data.qrBase64;
                qrImg.style.borderRadius = "8px";
                qrImg.style.width        = "256px";
                qrImg.style.height       = "256px";
                storedQRDiv.appendChild(qrImg);
            }());
        }

        // If no slots left, alert
        const currentSlots = parseInt(localStorage.getItem(LS_SLOT_KEY), 10);
        if (currentSlots <= 0) {
            displayMessage("All slots have been filled. Registration is now closed.", "red");
        }
    }

    /**
     * Update the displayed “slots left.”
     */
    function updateSlotsDisplay() {
        const currentSlots = parseInt(localStorage.getItem(LS_SLOT_KEY), 10);
        slotsLeftSpan.textContent = currentSlots > 0 ? currentSlots : "0";

        // If no slots left, hide form
        if (currentSlots <= 0) {
            const existingData = JSON.parse(localStorage.getItem(LS_KEY)) || null;
            if (!existingData || !existingData.email) {
                formSection.classList.add("hidden-start");
                formSection.classList.remove("show");
                displayMessage("Registration is now closed. No slots left.", "red");
            }
        }
    }

    /**
     * Convert a File object to Base64 (for ID front, signature, etc.)
     */
    function convertFileToBase64(file) {
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.onload  = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = function(e) {
                reject(e);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Convert a dataURL string to a Blob.
     */
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

    // ============================
    // Event Listeners
    // ============================

    // Accept button in the consent modal
    consentAcceptBtn.addEventListener("click", function() {
        consentModal.style.display = "none";
        initializeApp();
    });

    // Toggle signature method (upload vs draw)
    uploadRadio.addEventListener("change", toggleSignatureMethod);
    drawRadio.addEventListener("change",  toggleSignatureMethod);

    // Clear the signature pad
    clearButton.addEventListener("click", function() {
        signaturePad.clear();
    });

    // “Re-upload” button => go back to form
    reuploadBtn.addEventListener("click", function() {
        alreadyRegisteredSection.classList.add("hidden-start");
        alreadyRegisteredSection.classList.remove("show");
        formSection.classList.remove("hidden-start");
        formSection.classList.add("show");
        messageDiv.innerText = "";
    });

    // Submit event
    registrationForm.addEventListener("submit", handleFormSubmit);
})();
