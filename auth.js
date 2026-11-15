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

function showMessage(text) {
  message.textContent = text;
}

function showMode(mode) {
  const isSignup = mode === "signup";

  signupForm.hidden = !isSignup;
  loginForm.hidden = isSignup;

  signupTab.classList.toggle("active", isSignup);
  loginTab.classList.toggle("active", !isSignup);

  showMessage("");
}

signupTab.addEventListener("click", () => {
  showMode("signup");
});

loginTab.addEventListener("click", () => {
  showMode("login");
});


/* CREATE ACCOUNT */
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  showMessage("Creating your account...");

  const formData = new FormData(signupForm);

  const fullName = formData.get("fullName")?.trim();
  const email = formData.get("email")?.trim();
  const password = formData.get("password");

  if (!fullName || !email || !password) {
    showMessage("Please fill in all fields.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
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
    showMessage(error.message);
    return;
  }

  if (data.session) {
    window.location.href = "dashboard.html";
    return;
  }

  showMessage(
    "Account created successfully. You can now log in."
  );

  signupForm.reset();
  showMode("login");
});


/* LOGIN */
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  showMessage("Signing in...");

  const formData = new FormData(loginForm);

  const email = formData.get("email")?.trim();
  const password = formData.get("password");

  if (!email || !password) {
    showMessage("Please enter your email and password.");
    return;
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    console.error(error);
    showMessage(error.message);
    return;
  }

  if (!data.user) {
    showMessage("Login failed. Please try again.");
    return;
  }

  showMessage("Login successful. Opening classroom...");

  window.location.href = "dashboard.html";
});
