import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js?v=3";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const message = document.getElementById("message");

const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = "message " + type;
}


// LOGIN TAB
loginTab.addEventListener("click", () => {
  loginForm.hidden = false;
  signupForm.hidden = true;

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  showMessage("");
});


// CREATE ACCOUNT TAB
signupTab.addEventListener("click", () => {
  loginForm.hidden = true;
  signupForm.hidden = false;

  loginTab.classList.remove("active");
  signupTab.classList.add("active");

  showMessage("");
});


// LOGIN
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  event.stopPropagation();

  const email = document
    .getElementById("loginEmail")
    .value
    .trim();

  const password = document
    .getElementById("loginPassword")
    .value;

  if (!email || !password) {
    showMessage("Please enter your email and password.", "error");
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  showMessage("Checking your account...");

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      console.error(error);

      showMessage(
        "Login failed: " + error.message,
        "error"
      );

      loginButton.disabled = false;
      loginButton.textContent = "Log in";
      return;
    }

    if (!data.user) {
      showMessage(
        "Login failed. Please try again.",
        "error"
      );

      loginButton.disabled = false;
      loginButton.textContent = "Log in";
      return;
    }

    showMessage(
      "Login successful. Opening dashboard...",
      "success"
    );

    window.location.href = "dashboard.html";

  } catch (error) {
    console.error(error);

    showMessage(
      "Connection error: " + error.message,
      "error"
    );

    loginButton.disabled = false;
    loginButton.textContent = "Log in";
  }
});


// CREATE ACCOUNT
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  event.stopPropagation();

  const fullName = document
    .getElementById("fullName")
    .value
    .trim();

  const email = document
    .getElementById("signupEmail")
    .value
    .trim();

  const password = document
    .getElementById("signupPassword")
    .value;

  if (!fullName || !email || !password) {
    showMessage(
      "Please complete all fields.",
      "error"
    );
    return;
  }

  signupButton.disabled = true;
  signupButton.textContent = "Creating account...";

  showMessage("Creating your account...");

  try {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

    if (error) {
      console.error(error);

      showMessage(
        "Account error: " + error.message,
        "error"
      );

      signupButton.disabled = false;
      signupButton.textContent = "Create my account";
      return;
    }

    if (data.session) {
      window.location.href = "dashboard.html";
      return;
    }

    showMessage(
      "Account created. You can now log in.",
      "success"
    );

    signupForm.reset();

    signupForm.hidden = true;
    loginForm.hidden = false;

    signupTab.classList.remove("active");
    loginTab.classList.add("active");

  } catch (error) {
    console.error(error);

    showMessage(
      "Connection error: " + error.message,
      "error"
    );
  }

  signupButton.disabled = false;
  signupButton.textContent = "Create my account";
});
