import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) location.href = "auth.html";
else {
  $("studentName").textContent = user.user_metadata?.full_name || user.email?.split("@")[0] || "student";
  const { data: profile, error: profileError } = await supabase.from("profiles").select("trial_ends_at,subscription_expires_at").eq("id", user.id).single();
  if (profileError) $("trialStatus").textContent = "Account setup pending";
  else {
    const end = new Date(profile.trial_ends_at);
    const activeSub = profile.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date();
    const activeTrial = end > new Date();
    $("trialStatus").textContent = activeSub ? "Subscription active" : activeTrial ? `${Math.ceil((end - new Date()) / 86400000)} days remaining` : "Trial ended";
    $("trialDate").textContent = activeSub ? `Access until ${new Date(profile.subscription_expires_at).toLocaleDateString()}` : `Trial ends ${end.toLocaleDateString()}`;
    $("lockedNotice").hidden = activeSub || activeTrial;
  }
  const { data: courses, error: courseError } = await supabase.from("courses").select("id,title,description,slug").eq("published", true).order("title");
  const grid = $("courseGrid"); grid.innerHTML = "";
  if (courseError) grid.textContent = "Could not load courses. Check the database setup.";
  else if (!courses?.length) grid.textContent = "Courses will appear here when the academy administrator publishes them.";
  else {
    for (const course of courses) {
      const card = document.createElement("article"); card.className = "course-card";
      const title = document.createElement("h3"); title.textContent = course.title;
      const desc = document.createElement("p"); desc.textContent = course.description || "Lessons coming soon.";
      const link = document.createElement("a"); link.href = `course.html?id=${encodeURIComponent(course.id)}`; link.textContent = "Open classroom →";
      card.append(title, desc, link); grid.append(card);
    }
  }
  const { count, error: progressError } = await supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id);
  if (progressError) $("progressText").textContent = "Progress will appear after you complete lessons.";
  else $("progressText").textContent = `${count || 0} lessons completed`;
  $("progressBar").style.width = "0%"; // Total lesson count will be connected when lessons are added.
}
$("logout").addEventListener("click", async () => { await supabase.auth.signOut(); location.href = "index.html"; });
