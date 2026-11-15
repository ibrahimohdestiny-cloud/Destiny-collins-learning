import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from "./config.js";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");

const courseTitle = document.getElementById("courseTitle");
const courseDescription = document.getElementById("courseDescription");
const lessonList = document.getElementById("lessonList");
const courseMessage = document.getElementById("courseMessage");

let currentUser = null;
let lessons = [];

/* =========================
   START
========================= */

async function start() {
  try {
    courseMessage.textContent = "Loading classroom...";

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      window.location.href = "auth.html";
      return;
    }

    currentUser = user;

    if (!courseId) {
      courseTitle.textContent = "Course not found";
      courseMessage.textContent = "No course ID was provided.";
      return;
    }

    await loadCourse();

  } catch (error) {
    console.error("CLASSROOM ERROR:", error);
    courseMessage.textContent =
      "Something went wrong. Please refresh the page.";
  }
}

/* =========================
   LOAD COURSE
========================= */

async function loadCourse() {

  const {
    data: course,
    error: courseError
  } = await supabase
    .from("courses")
    .select("id,title,description")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    console.error("COURSE ERROR:", courseError);

    courseMessage.textContent =
      "Could not load the course: " + courseError.message;

    return;
  }

  if (!course) {
    courseTitle.textContent = "Course not found";
    courseMessage.textContent =
      "This course could not be found in the database.";
    return;
  }

  courseTitle.textContent = course.title;
  courseDescription.textContent = course.description || "";

  await loadLessons();
}

/* =========================
   LOAD LESSONS
========================= */

async function loadLessons() {

  lessonList.innerHTML = "";
  courseMessage.textContent = "Loading lessons...";

  const {
    data,
    error
  } = await supabase
    .from("lessons")
    .select(
      "id,course_id,title,body,video_url,position,published"
    )
    .eq("course_id", courseId)
    .eq("published", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("LESSON ERROR:", error);

    courseMessage.textContent =
      "Could not load lessons: " + error.message;

    return;
  }

  lessons = data || [];

  console.log("COURSE ID:", courseId);
  console.log("LESSONS:", lessons);

  if (lessons.length === 0) {
    courseMessage.textContent =
      "No published lessons were found for this course.";
    return;
  }

  courseMessage.textContent = "";

  renderLessons();
}

/* =========================
   SHOW LESSON LIST
========================= */

function renderLessons() {

  lessonList.innerHTML = "";

  lessons.forEach((lesson, index) => {

    const card = document.createElement("article");
    card.className = "lesson";

    const title = document.createElement("h3");
    title.textContent =
      `Lesson ${index + 1}: ${lesson.title}`;

    const description = document.createElement("p");
    description.textContent =
      lesson.body || "Lesson content coming soon.";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn small";
    button.textContent = "Start Lesson";

    button.addEventListener("click", () => {
      openLesson(index);
    });

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(button);

    lessonList.appendChild(card);
  });
}

/* =========================
   OPEN LESSON
========================= */

function openLesson(index) {

  const lesson = lessons[index];

  if (!lesson) return;

  lessonList.innerHTML = "";

  const page = document.createElement("article");
  page.className = "lesson";

  const title = document.createElement("h2");
  title.textContent = lesson.title;

  page.appendChild(title);

  /* LESSON DESCRIPTION */

  if (lesson.body) {

    const body = document.createElement("p");
    body.textContent = lesson.body;

    page.appendChild(body);
  }

  /* VIDEO */

  if (lesson.video_url) {

    const videoHeading = document.createElement("h4");
    videoHeading.textContent = "Lesson Video";

    page.appendChild(videoHeading);

    addVideo(
      page,
      lesson.video_url,
      lesson.title
    );
  }

  /* PRACTICAL EXERCISE */

  const exerciseHeading = document.createElement("h4");
  exerciseHeading.textContent = "Practical Exercise";

  const exercise = document.createElement("p");
  exercise.textContent =
    getExercise(lesson.title);

  page.appendChild(exerciseHeading);
  page.appendChild(exercise);

  /* COMPLETE */

  const completeButton =
    document.createElement("button");

  completeButton.type = "button";
  completeButton.className = "btn small";
  completeButton.textContent =
    "Complete Lesson";

  completeButton.addEventListener(
    "click",
    () => saveProgress(
      lesson.id,
      completeButton
    )
  );

  page.appendChild(completeButton);

  /* BACK */

  const backButton =
    document.createElement("button");

  backButton.type = "button";
  backButton.className =
    "btn small secondary";

  backButton.textContent =
    "← Back to Lessons";

  backButton.style.marginLeft = "10px";

  backButton.addEventListener(
    "click",
    renderLessons
  );

  page.appendChild(backButton);

  /* PREVIOUS / NEXT */

  const navigation =
    document.createElement("div");

  navigation.style.marginTop = "25px";
  navigation.style.display = "flex";
  navigation.style.gap = "10px";
  navigation.style.flexWrap = "wrap";

  if (index > 0) {

    const previous =
      document.createElement("button");

    previous.type = "button";
    previous.className =
      "btn small secondary";

    previous.textContent =
      "← Previous Lesson";

    previous.addEventListener(
      "click",
      () => openLesson(index - 1)
    );

    navigation.appendChild(previous);
  }

  if (index < lessons.length - 1) {

    const next =
      document.createElement("button");

    next.type = "button";
    next.className =
      "btn small";

    next.textContent =
      "Next Lesson →";

    next.addEventListener(
      "click",
      () => openLesson(index + 1)
    );

    navigation.appendChild(next);
  }

  page.appendChild(navigation);

  lessonList.appendChild(page);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================
   EXERCISES
========================= */

function getExercise(title) {

  const exercises = {

    "CorelDRAW":
      "Open CorelDRAW. Create a rectangle, a circle and a star. Add text and apply different colors.",

    "Microsoft Excel":
      "Create a worksheet with five student names and their scores. Use SUM to calculate the total.",

    "Microsoft Word":
      "Create a one-page document with a heading, two paragraphs and a picture. Format the heading.",

    "Microsoft PowerPoint":
      "Create a presentation with five slides. Add a title, text and pictures to your slides."
  };

  return exercises[title] ||
    "Complete a practical project using the skills taught in this lesson.";
}

/* =========================
   VIDEO
========================= */

function addVideo(
  container,
  videoUrl,
  title
) {

  const videoId =
    getYouTubeId(videoUrl);

  if (!videoId) {

    const error =
      document.createElement("p");

    error.textContent =
      "The lesson video link is not valid.";

    container.appendChild(error);

    return;
  }

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "video-wrap";

  const iframe =
    document.createElement("iframe");

  iframe.src =
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;

  iframe.title =
    `${title} video`;

  iframe.loading = "lazy";

  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

  iframe.allowFullscreen = true;

  wrapper.appendChild(iframe);

  container.appendChild(wrapper);
}

/* =========================
   YOUTUBE ID
========================= */

function getYouTubeId(value) {

  if (!value) return null;

  const input = value.trim();

  if (
    /^[a-zA-Z0-9_-]{11}$/.test(input)
  ) {
    return input;
  }

  try {

    const url = new URL(input);

    if (url.hostname === "youtu.be") {

      return url.pathname
        .slice(1)
        .split("/")[0];
    }

    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtube-nocookie.com")
    ) {

      const video =
        url.searchParams.get("v");

      if (video) return video;

      const parts =
        url.pathname.split("/");

      const embed =
        parts.indexOf("embed");

      if (embed !== -1) {
        return parts[embed + 1];
      }
    }

  } catch (error) {

    console.error(
      "YouTube URL error:",
      error
    );
  }

  return null;
}

/* =========================
   SAVE PROGRESS
========================= */

async function saveProgress(
  lessonId,
  button
) {

  button.disabled = true;
  button.textContent = "Saving...";

  const {
    error
  } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: currentUser.id,
        lesson_id: lessonId
      },
      {
        onConflict:
          "user_id,lesson_id"
      }
    );

  if (error) {

    console.error(
      "PROGRESS ERROR:",
      error
    );

    button.disabled = false;
    button.textContent =
      "Try Again";

    return;
  }

  button.textContent =
    "Lesson Completed ✓";
}

/* =========================
   RUN CLASSROOM
========================= */

start();
