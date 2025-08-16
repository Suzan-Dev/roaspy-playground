import "./style.css";

/**
 * Roaspy Playground - Business Tracking Script Tester
 *
 * A clean, maintainable testing interface for Roaspy tracking scripts.
 * Features: localStorage persistence, clean URLs, duplicate prevention.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  SCRIPT_URL: (() => {
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return isDev ? "http://localhost:8001" : "https://t.staging.roaspy.com";
  })(),
  UTM_DEFAULTS: {
    utm_source: "facebook",
    utm_medium: "social",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  },
};

const STORAGE_KEYS = {
  BUSINESS_ID: "roaspy_business_id",
  LAST_LOADED: "roaspy_last_loaded",
};

// ============================================================================
// APPLICATION TEMPLATE
// ============================================================================

document.querySelector("#app").innerHTML = `
  <div class="app-container">
    <div id="status" class="status-message"></div>
    
    <div class="main-content">
      <div class="left-column">
        <div class="card">
          <h3>🔧 Business Configuration</h3>
          <form id="businessForm" class="business-form">
            <div class="form-group">
              <label for="businessId">Business ID:</label>
              <input 
                type="text" 
                id="businessId" 
                name="businessId" 
                placeholder="Enter your business ID" 
                required
                autocomplete="off"
              >
              <small class="form-hint">This will load the tracking script for your business</small>
            </div>
            <div class="button-group">
              <button type="submit" class="submit-btn primary">Load Tracking Script</button>
              <button type="button" id="clearStorageBtn" class="submit-btn clear" style="display: none;">Clear Saved ID</button>
            </div>
          </form>
        </div>
        
        <div class="card script-status" id="scriptStatusCard" style="display: none;">
          <h4>📊 Script Status</h4>
          <div id="scriptInfo" class="script-info"></div>
        </div>
      </div>
      
      <div class="right-column">
        <div class="card" id="userFormCard" style="display: none;">
          <h3>👤 User Registration</h3>
          <p class="form-description">Test your tracking script with sample user data</p>
          <form id="userForm" class="user-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name:</label>
                <input type="text" id="firstName" name="firstName" required>
              </div>
              <div class="form-group">
                <label for="lastName">Last Name:</label>
                <input type="text" id="lastName" name="lastName" required>
              </div>
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="phone">Phone:</label>
              <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="submit-btn secondary">Submit Test Data</button>
          </form>
        </div>
      </div>
    </div>
  </div>
`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getUTMParams = () => ({ ...CONFIG.UTM_DEFAULTS });

const updateURLWithParams = (params) => {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim() !== "") {
      url.searchParams.set(key, value);
    }
  });
  window.history.pushState({ path: url.href }, "", url.href);
};

const cleanURL = (paramsToRemove = []) => {
  const url = new URL(window.location);
  paramsToRemove.forEach((param) => url.searchParams.delete(param));
  window.history.replaceState({ path: url.href }, "", url.href);
};

// ============================================================================
// LOCALSTORAGE MANAGEMENT
// ============================================================================

const saveBusinessId = (businessId) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUSINESS_ID, businessId);
    localStorage.setItem(STORAGE_KEYS.LAST_LOADED, new Date().toISOString());
    console.log(`💾 Business ID saved: ${businessId}`);
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
};

const getSavedBusinessId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.BUSINESS_ID);
  } catch (error) {
    console.warn("Failed to read from localStorage:", error);
    return null;
  }
};

const clearSavedBusinessId = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.BUSINESS_ID);
    localStorage.removeItem(STORAGE_KEYS.LAST_LOADED);
    console.log("🗑️ Business ID cleared");
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
};

// ============================================================================
// UI MANAGEMENT
// ============================================================================

const showStatusMessage = (message, type = "info") => {
  const statusElement = document.querySelector("#status");
  statusElement.innerHTML = `<div class="${type}">${message}</div>`;
};

const toggleElement = (elementId, show) => {
  const element = document.querySelector(`#${elementId}`);
  if (element) {
    element.style.display = show ? "block" : "none";
  }
};

const updateScriptStatus = (businessId, success) => {
  const scriptInfo = document.querySelector("#scriptInfo");

  if (success) {
    scriptInfo.innerHTML = `
      <div>✅ <strong>Status:</strong> Active</div>
      <div>🏢 <strong>Business ID:</strong> ${businessId}</div>
      <div>📡 <strong>Script URL:</strong> ${
        CONFIG.SCRIPT_URL
      }/script/${businessId}.js</div>
      <div>⏰ <strong>Loaded:</strong> ${new Date().toLocaleTimeString()}</div>
    `;
  } else {
    scriptInfo.innerHTML = `
      <div>❌ <strong>Status:</strong> Failed to load</div>
      <div>🏢 <strong>Business ID:</strong> ${businessId}</div>
      <div>⚠️ <strong>Error:</strong> Script could not be loaded from server</div>
    `;
  }

  toggleElement("scriptStatusCard", true);
};

const updateButtonState = (button, text, disabled = false) => {
  if (button) {
    button.textContent = text;
    button.disabled = disabled;
    button.style.opacity = disabled ? "0.6" : "1";
  }
};

// ============================================================================
// SCRIPT LOADING
// ============================================================================

const loadTrackingScript = (businessId) => {
  // Remove any existing tracking scripts (allows reloading same business ID)
  const existingScripts = document.querySelectorAll("script[data-business-id]");
  existingScripts.forEach((script) => script.remove());

  console.log(`📡 Loading tracking script for business ID: ${businessId}`);

  // Create script element
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = `${CONFIG.SCRIPT_URL}/script/${businessId}.js`;
  script.setAttribute("data-business-id", businessId);
  script.setAttribute("data-loaded-at", new Date().toISOString());

  script.onload = () => {
    console.log(`✅ Script loaded successfully for business ID: ${businessId}`);
    showStatusMessage(
      `✅ Script loaded successfully for business ID: ${businessId}`,
      "success"
    );
    updateScriptStatus(businessId, true);
    toggleElement("userFormCard", true);
  };

  script.onerror = () => {
    console.error(`❌ Failed to load script for business ID: ${businessId}`);
    showStatusMessage(
      `❌ Failed to load script for business ID: ${businessId}`,
      "error"
    );
    updateScriptStatus(businessId, false);
  };

  document.head.appendChild(script);
};

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const handleBusinessFormSubmit = (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const businessId = formData.get("businessId")?.trim();

  if (!businessId) {
    showStatusMessage("❌ Please enter a valid business ID", "error");
    return;
  }

  // Allow reloading same business ID - remove any existing scripts first

  // Save and load
  saveBusinessId(businessId);

  const clearBtn = document.querySelector("#clearStorageBtn");
  if (clearBtn) clearBtn.style.display = "block";

  showStatusMessage(
    `⏳ Loading script for business ID: ${businessId}...`,
    "loading"
  );
  loadTrackingScript(businessId);

  // Update button state
  const submitBtn = event.target.querySelector('button[type="submit"]');
  updateButtonState(submitBtn, "Script Loaded", true);
};

const handleUserFormSubmit = (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const userData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  };

  // Add UTM parameters and email to URL for tracking
  const utmParams = getUTMParams();
  const urlParams = {};

  if (userData.email) urlParams.email = userData.email;

  Object.entries(utmParams).forEach(([key, value]) => {
    if (value && value.trim()) urlParams[key] = value;
  });

  if (Object.keys(urlParams).length > 0) {
    updateURLWithParams(urlParams);
  }

  showStatusMessage(
    "✅ User form submitted successfully! Check browser console for details.",
    "success"
  );

  console.log("User data submitted:", userData);
  console.log("UTM parameters:", utmParams);
  console.log("URL parameters added:", urlParams);
};

const handleClearStorage = () => {
  clearSavedBusinessId();

  // Reset UI
  const businessIdInput = document.querySelector("#businessId");
  const clearBtn = document.querySelector("#clearStorageBtn");
  const loadBtn = document.querySelector('button[type="submit"]');

  if (businessIdInput) businessIdInput.value = "";
  if (clearBtn) clearBtn.style.display = "none";

  updateButtonState(loadBtn, "Load Tracking Script", false);

  toggleElement("userFormCard", false);
  toggleElement("scriptStatusCard", false);

  showStatusMessage(
    "🗑️ Saved business ID cleared. Enter a new business ID to get started.",
    "info"
  );
};

// ============================================================================
// INITIALIZATION
// ============================================================================

const initializeApp = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlBusinessId = urlParams.get("businessId");
  const savedBusinessId = getSavedBusinessId();
  const businessIdToUse = urlBusinessId || savedBusinessId;

  if (businessIdToUse) {
    // Pre-populate form
    const businessIdInput = document.querySelector("#businessId");
    const clearBtn = document.querySelector("#clearStorageBtn");

    if (businessIdInput) businessIdInput.value = businessIdToUse;
    if (clearBtn) clearBtn.style.display = "block";

    if (urlBusinessId) {
      saveBusinessId(urlBusinessId);
      cleanURL(["businessId"]);
      showStatusMessage(
        `ℹ️ Business ID loaded from URL and saved locally: ${urlBusinessId}`,
        "info"
      );
    } else {
      const lastLoaded = localStorage.getItem(STORAGE_KEYS.LAST_LOADED);
      const timeAgo = lastLoaded
        ? new Date(lastLoaded).toLocaleString()
        : "unknown";
      showStatusMessage(
        `💾 Business ID auto-loaded from storage: ${savedBusinessId} (saved: ${timeAgo})`,
        "info"
      );
    }

    // Auto-load script after a brief delay
    setTimeout(() => {
      showStatusMessage(
        `⏳ Auto-loading script for business ID: ${businessIdToUse}...`,
        "loading"
      );
      loadTrackingScript(businessIdToUse);

      const loadBtn = document.querySelector('button[type="submit"]');
      updateButtonState(loadBtn, "Script Loaded", true);
    }, 1000);
  } else {
    showStatusMessage(
      "👋 Welcome! Enter your business ID to get started.",
      "info"
    );
  }
};

const setupEventListeners = () => {
  const businessForm = document.querySelector("#businessForm");
  const userForm = document.querySelector("#userForm");
  const clearStorageBtn = document.querySelector("#clearStorageBtn");

  if (businessForm)
    businessForm.addEventListener("submit", handleBusinessFormSubmit);
  if (userForm) userForm.addEventListener("submit", handleUserFormSubmit);
  if (clearStorageBtn)
    clearStorageBtn.addEventListener("click", handleClearStorage);
};

// ============================================================================
// APPLICATION STARTUP
// ============================================================================

const startApp = () => {
  initializeApp();
  setupEventListeners();
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
