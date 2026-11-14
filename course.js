import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");

const message = document.getElementById("courseMessage");
const lessonList = document.getElementById("lessonList");

const {
  data: { user }
} = await supabase.auth.getUser();

if (!user) {
  window.location.href = "auth.html";
} else if (!courseId) {
  message.textContent = "No course was selected.";
} else {
  loadCourse();
}

async function loadCourse() {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id,title,description")
    .eq("id", courseId)
    .single();

  if (courseError) {
    message.textContent = "This course could not be loaded.";
    return;
  }

  document.getElementById("courseTitle").textContent = course.title;
  document.getElementById("courseDescription").textContent =
    course.description || "";

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("published", true)
    .order("position", { ascending: true });

  if (error) {
    message.textContent = "Unable to load lessons.";
    return;
  }

  lessonList.innerHTML = "";

  if (!lessons || lessons.length === 0) {
    message.textContent =
      "Starter lessons are available below.";

    showStarterLessons();
    return;
  }

  message.textContent = "";

  lessons.forEach((lesson) => {
    renderDatabaseLesson(lesson);
  });
}


/* =========================================================
  
