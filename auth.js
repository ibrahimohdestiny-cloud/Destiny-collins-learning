import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from "./config.js?v=2";

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


function showMessage(text) {
  message.textContent = text;
}


/* LOGIN TAB */

loginTab.addEventListener("click", function () {
  loginForm.hidden = false;
  signupForm.hidden = true;

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  showMessage("");
});


/* SIGNUP TAB */

signupTab.addEventListener("click", function () {
  loginForm.hidden = true;
  signupForm.hidden = false;

  loginTab.classList.remove("active");
  signupTab.classList.add("active");

  showMessage("");
});


/* LOGIN */

loginForm.addEventListener("submit", async function (event) {

  event.preventDefault();
  event.stopPropagation();

  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  showMessage("Signing in...");

  const email = document
    .getElementById("loginEmail")
    .value
    .trim();

  const password = document
    .getElementById("loginPassword")
    .value;

  try {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      console.error("LOGIN ERROR:", error);

      showMessage(
        "Login failed: " + error.message
      );

      loginButton.disabled = false;
      loginButton.textContent = "Log in";

      return;
    }

    if (!data || !data.user) {

      showMessage(
        "Login failed. Please try again."
      );

      loginButton.disabled = false;
      loginButton.textContent = "Log in";

      return;
    }

    showMessage(
      "Login successful. Opening dashboard..."
    );

    window.location.assign("dashboard.html");

  } catch (error) {

    console.error("LOGIN CONNECTION ERROR:", error);

    showMessage(
      "Connection error: " + error.message
    );

    loginButton.disabled = false;
    loginButton.textContent = "Log in";
  }
});


/* CREATE ACCOUNT */

signupForm.addEventListener("submit", async function (event) {

  event.preventDefault();
  event.stopPropagation();

  signupButton.disabled = true;
  signupButton.textContent = "Creating account...";

  showMessage("Creating your account...");

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

  try {

    const { data, error } =
      await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

    if (error) {

      console.error("SIGNUP ERROR:", error);

      showMessage(
        "Account error: " + error.message
      );

      signupButton.disabled = false;
      signupButton.textContent = "Create my account";

      return;
    }

    if (data.session) {
      window.location.assign("dashboard.html");
      return;
    }

    showMessage(
      "Account created. You can now log in."
    );

    signupForm.reset();

    loginForm.hidden = false;
    signupForm.hidden = true;

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

  } catch (error) {

    console.error("SIGNUP ERROR:", error);

    showMessage(
      "Connection error: " + error.message
    );

  }

  signupButton.disabled = false;
  signupButton.textContent = "Create my account";
});
