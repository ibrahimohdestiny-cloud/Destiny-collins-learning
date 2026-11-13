import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const params = new URLSearchParams(location.search), courseId = params.get("id");
const { data: { user } } = await supabase.auth.getUser();
if (!user) location.href = "auth.html";
else if (!courseId) document.getElementById("courseMessage").textContent = "No course was selected.";
else {
  const { data: course, error } = await supabase.from("courses").select("id,title,description").eq("id", courseId).single();
  if (error) document.getElementById("courseMessage").textContent = "This course is unavailable. Your trial may have ended, or the course is not published.";
  else {
    document.getElementById("courseTitle").textContent = course.title;
    document.getElementById("courseDescription").textContent = course.description || "";
    const { data: lessons, error: lessonError } = await supabase.from("lessons").select("id,title,body,position").eq("course_id", courseId).eq("published", true).order("position");
    const list = document.getElementById("lessonList");
    if (lessonError) document.getElementById("courseMessage").textContent = "Lessons are locked or could not be loaded.";
    else if (!lessons?.length) list.textContent = "Lessons are being prepared for this classroom.";
    else for (const lesson of lessons) {
      const item = document.createElement("article"); item.className = "lesson";
      const h = document.createElement("h3"); h.textContent = lesson.title;
      const p = document.createElement("p"); p.textContent = lesson.body || "Lesson content will be added soon.";
      const done = document.createElement("button"); done.className = "btn small"; done.textContent = "Mark as completed";
      done.addEventListener("click", async () => {
        const { error: saveError } = await supabase.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lesson.id }, { onConflict: "user_id,lesson_id" });
        done.textContent = saveError ? "Could not save" : "Completed ✓"; done.disabled = !saveError;
      });
      item.append(h,p,done); list.append(item);
    }
  }
}
