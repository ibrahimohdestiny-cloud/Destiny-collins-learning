import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from "./config.js?v=3";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const $ = (id) => document.getElementById(id);

async function loadDashboard() {
  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      window.location.href = "auth.html";
      return;
    }

    // Student name
    $("studentName").textContent =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "student";


    // Profile / trial
    const {
      data: profile,
      error: profileError
    } = await supabase
      .from("profiles")
      .select("trial_ends_at,subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      $("trialStatus").textContent = "Account setup pending";
      $("trialDate").textContent = "";
    } else {
      const now = new Date();

      const trialEnd = profile.trial_ends_at
        ? new Date(profile.trial_ends_at)
        : null;

      const subscriptionEnd =
        profile.subscription_expires_at
          ? new Date(profile.subscription_expires_at)
          : null;

      const activeSubscription =
        subscriptionEnd && subscriptionEnd > now;

      const activeTrial =
        trialEnd && trialEnd > now;

      if (activeSubscription) {
        $("trialStatus").textContent =
          "Subscription active";

        $("trialDate").textContent =
          "Access until " +
          subscriptionEnd.toLocaleDateString();

        $("lockedNotice").hidden = true;

      } else if (activeTrial) {
        const days =
          Math.ceil(
            (trialEnd - now) / 86400000
          );

        $("trialStatus").textContent =
          `${days} days remaining`;

        $("trialDate").textContent =
          "Trial ends " +
          trialEnd.toLocaleDateString();

        $("lockedNotice").hidden = true;

      } else {
        $("trialStatus").textContent =
          "Trial ended";

        $("trialDate").textContent =
          trialEnd
            ? "Trial ended " +
              trialEnd.toLocaleDateString()
            : "";

        $("lockedNotice").hidden = false;
      }
    }


    // Courses
    const {
      data: courses,
      error: courseError
    } = await supabase
      .from("courses")
      .select(
        "id,title,description,slug"
      )
      .eq("published", true)
      .order("title");

    const grid = $("courseGrid");

    grid.innerHTML = "";

    if (courseError) {
      console.error(
        "COURSE ERROR:",
        courseError
      );

      grid.innerHTML =
        "<p>Could not load courses. Please try again.</p>";

    } else if (!courses || courses.length === 0) {

      grid.innerHTML =
        "<p>No classrooms are available yet.</p>";

    } else {

      for (const course of courses) {

        const card =
          document.createElement("article");

        card.className =
          "course-card";

        const title =
          document.createElement("h3");

        title.textContent =
          course.title;

        const description =
          document.createElement("p");

        description.textContent =
          course.description ||
          "Lessons coming soon.";

        const link =
          document.createElement("a");

        link.href =
          `course.html?id=${encodeURIComponent(course.id)}`;

        link.textContent =
          "Open classroom →";

        card.append(
          title,
          description,
          link
        );

        grid.appendChild(card);
      }
    }


    // Learning progress
    const {
      count,
      error: progressError
    } = await supabase
      .from("lesson_progress")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("user_id", user.id);

    if (progressError) {

      console.error(
        "PROGRESS ERROR:",
        progressError
      );

      $("progressText").textContent =
        "Progress will appear after you complete lessons.";

    } else {

      $("progressText").textContent =
        `${count || 0} lessons completed`;
    }

    $("progressBar").style.width = "0%";

  } catch (error) {

    console.error(
      "DASHBOARD ERROR:",
      error
    );

    $("trialStatus").textContent =
      "Unable to load";

    $("courseGrid").innerHTML =
      "<p>There was a problem loading your classroom. Please refresh the page.</p>";

    $("progressText").textContent =
      "Unable to load progress.";
  }
}


// Logout
$("logout").addEventListener(
  "click",
  async () => {

    await supabase.auth.signOut();

    window.location.href =
      "index.html";
  }
);


loadDashboard();
