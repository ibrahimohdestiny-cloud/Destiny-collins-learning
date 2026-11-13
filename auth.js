import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const signupTab = document.getElementById("signupTab");
const loginTab = document.getElementById("loginTab");
function showMode(mode) {
  const signup = mode === "signup";
  signupForm.hidden = !signup; loginForm.hidden = signup;
  signupTab.classList.toggle("active", signup); loginTab.classList.toggle("active", !signup);
  message.textContent = "";
}
signupTab.addEventListener("click", () => showMode("signup"));
loginTab.addEventListener("click", () => showMode("login"));
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault(); message.textContent = "Creating your account…";
  const data = new FormData(signupForm);
  const { data: result, error } = await supabase.auth.signUp({
    email: data.get("email").trim(), password: data.get("password"),
    options: { data: { full_name: data.get("fullName").trim() } }
  });
  if (error) { message.textContent = error.message; return; }
  if (result.session) location.href = "dashboard.html";
  else message.textContent = "Account created. Check your email for the confirmation link, then return here to log in.";
});
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); message.textContent = "Signing in…";
  const data = new FormData(loginForm);
  const { error } = await supabase.auth.signInWithPassword({ email: data.get("email").trim(), password: data.get("password") });
  if (error) { message.textContent = error.message; return; }
  location.href = "dashboard.html";
});
