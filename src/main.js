import "./style.css";

document.querySelector("#app").innerHTML = `
  <div>
    <h2>User Registration</h2>
    <div class="card">
      <form id="userForm" class="user-form">
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input type="text" id="firstName" name="firstName" required>
        </div>
        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input type="text" id="lastName" name="lastName" required>
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
        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </div>
  </div>
`;

// Function to add UTM parameters
function getUTMParams() {
  return {
    utm_source: "facebook",
    utm_medium: "social",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  };
}

// Function to update URL with new parameters
function updateURLWithParams(params) {
  const url = new URL(window.location);

  // Add each parameter to the URL if it has a value
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim() !== "") {
      url.searchParams.set(key, value);
    }
  });

  // Update the browser URL without refreshing the page
  window.history.pushState({ path: url.href }, "", url.href);
}

// Handle form submission
document.querySelector("#userForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const userData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  };

  // Get UTM parameters
  const utmParams = getUTMParams();

  // Prepare parameters to add to URL
  const urlParams = {};

  // Add email to URL parameters
  if (userData.email) {
    urlParams.email = userData.email;
  }

  // Add UTM parameters if they exist
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      urlParams[key] = value;
    }
  });

  // Update URL with email and UTM parameters
  if (Object.keys(urlParams).length > 0) {
    // updateURLWithParams(urlParams);
  }

  // alert("Form submitted successfully! Check URL for email/UTM parameters.");
  // throw new Error("Test error thrown from form submission");
});
