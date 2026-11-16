import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from "./config.js";


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


/* MESSAGE */

function showMessage(text) {
  message.textContent = text;
}


/* LOGIN / SIGNUP TABS */

function showLogin() {

  loginForm.hidden = false;
  signupForm.hidden = true;

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  showMessage("");
}


function showSignup() {

  loginForm.hidden = true;
  signupForm.hidden = false;

  loginTab.classList.remove("active");
  signupTab.classList.add("active");

  showMessage("");
}


loginTab.addEventListener("click", showLogin);

signupTab.addEventListener("click", showSignup);


/* LOGIN */

loginForm.addEventListener("submit", async function (event) {

  event.preventDefault();

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

    const result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });


    if (result.error) {

      console.error(result.error);

      showMessage(
        "Login failed: " + result.error.message
      );

      loginButton.disabled = false;
      loginButton.textContent = "Log in";

      return;
    }


    if (!result.data || !result.data.user) {

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


    window.location.href = "dashboard.html";

  } catch (error) {

    console.error(error);

    showMessage(
      "Connection error. Please try again."
    );

    loginButton.disabled = false;
    loginButton.textContent = "Log in";
  }

});


/* CREATE ACCOUNT */

signupForm.addEventListener("submit", async function (event) {

  event.preventDefault();

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

    const result = await supabase.auth.signUp({

      email: email,

      password: password,

      options: {
        data: {
          full_name: fullName
        }
      }

    });


    if (result.error) {

      console.error(result.error);

      showMessage(
        "Account error: " + result.error.message
      );

      signupButton.disabled = false;
      signupButton.textContent = "Create my account";

      return;
    }


    if (result.data.session) {

      showMessage(
        "Account created. Opening dashboard..."
      );

      window.location.href = "dashboard.html";

      return;
    }


    showMessage(
      "Account created. You can now log in."
    );


    signupForm.reset();

    showLogin();


  } catch (error) {

    console.error(error);

    showMessage(
      "Connection error. Please try again."
    );

  }


  signupButton.disabled = false;
  signupButton.textContent = "Create my account";

});
