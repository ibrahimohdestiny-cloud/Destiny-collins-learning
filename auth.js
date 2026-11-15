import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from "./config.js";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const signupTab = document.getElementById("signupTab");
const loginTab = document.getElementById("loginTab");

const message = document.getElementById("message");


/* =========================
   SWITCH BETWEEN SIGNUP
   AND LOGIN
========================= */

function showMode(mode) {

  const isSignup = mode === "signup";

  signupForm.hidden = !isSignup;
  loginForm.hidden = isSignup;

  signupTab.classList.toggle(
    "active",
    isSignup
  );

  loginTab.classList.toggle(
    "active",
    !isSignup
  );

  message.textContent = "";
}


/* =========================
   TAB BUTTONS
========================= */

signupTab.addEventListener(
  "click",
  () => showMode("signup")
);

loginTab.addEventListener(
  "click",
  () => showMode("login")
);


/* =========================
   CREATE ACCOUNT
========================= */

signupForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    message.textContent =
      "Creating your account...";

    const formData =
      new FormData(signupForm);

    const fullName =
      formData.get("fullName").trim();

    const email =
      formData.get("email").trim();

    const password =
      formData.get("password");


    const {
      data,
      error
    } = await supabase.auth.signUp({

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

      message.textContent =
        error.message;

      return;
    }


    if (data.session) {

      window.location.href =
        "dashboard.html";

      return;
    }


    message.textContent =
      "Account created. You can now log in.";
  }
);


/* =========================
   LOGIN
========================= */

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    message.textContent =
      "Signing in...";

    const formData =
      new FormData(loginForm);

    const email =
      formData.get("email").trim();

    const password =
      formData.get("password");


    if (!email || !password) {

      message.textContent =
        "Please enter your email and password.";

      return;
    }


    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({

      email,

      password

    });


    if (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      message.textContent =
        error.message;

      return;
    }


    if (data.session) {

      message.textContent =
        "Login successful. Opening dashboard...";

      window.location.href =
        "dashboard.html";

      return;
    }


    message.textContent =
      "Login was not completed. Please try again.";
  }
);
