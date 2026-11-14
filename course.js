
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from "./config.js";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const params = new URLSearchParams(
  window.location.search
);

const courseId = params.get("id");

const courseTitle = document.getElementById("courseTitle");
const courseDescription = document.getElementById("courseDescription");
const lessonList = document.getElementById("lessonList");
const message = document.getElementById("courseMessage");

let currentUser = null;
let lessons = [];

/* ================================
   START CLASSROOM
================================ */

async function startClassroom() {
  try {
    message.textContent = "Checking your account...";

    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      window.location.href = "auth.html";
      return;
    }

    currentUser = user;

    if (!courseId) {
      message.textContent = "No course was selected.";
      return;
    }

    await loadCourse();

  } catch (error) {
    console.error(error);
    message.textContent = "Something went wrong loading the classroom.";
  }
}

/* ================================
   LOAD COURSE
================================ */

async function loadCourse() {
  message.textContent = "Loading course...";
  lessonList.innerHTML = "";

  const {
    data: course,
    error: courseError
  } = await supabase
    .from("courses")
    .select("id,title,description")
    .eq("id", courseId)
    .single();

  if (courseError) {
    console.error(courseError);
    message.textContent = "Could not load this course.";
    return;
  }

  courseTitle.textContent = course.title;
  courseDescription.textContent = course.description || "";

  const {
    data,
    error: lessonError
  } = await supabase
    .from("lessons")
    .select("id,title,body,video_url")
    .eq("course_id", courseId);

  if (lessonError) {
    console.error(lessonError);
    message.textContent = "Could not load lessons. Check Supabase permissions.";
    return;
  }

  lessons = data || [];

  message.textContent = "";

  if (lessons.length === 0) {
    message.textContent = "No lessons have been added to this course yet.";
    return;
  }

  // Keep lesson order consistent.
  const order = [
    "CorelDRAW",
    "Microsoft Excel",
    "Microsoft Word",
    "Microsoft PowerPoint"
  ];

  lessons.sort((a, b) => {
    const aIndex = order.indexOf(a.title);
    const bIndex = order.indexOf(b.title);

    return (aIndex === -1 ? 999 : aIndex) -
           (bIndex === -1 ? 999 : bIndex);
  });

  renderLessons();
}

/* ================================
   RENDER LESSON LIST
================================ */

function renderLessons() {
  lessonList.innerHTML = "";

  lessons.forEach((lesson, index) => {
    const card = document.createElement("article");
    card.className = "lesson";

    const title = document.createElement("h3");
    title.textContent = `Lesson ${index + 1}: ${lesson.title}`;

    const description = document.createElement("p");
    description.textContent =
      lesson.body || "Full lesson content coming soon.";

    const button = document.createElement("button");
    button.className = "btn small";
    button.type = "button";
    button.textContent = "Start Lesson";

    button.addEventListener("click", () => {
      openLesson(index);
    });

    card.append(title, description, button);
    lessonList.appendChild(card);
  });
}

/* ================================
   OPEN LESSON
================================ */

function openLesson(index) {
  const lesson = lessons[index];

  if (!lesson) return;

  lessonList.innerHTML = "";

  const page = document.createElement("article");
  page.className = "lesson";

  const title = document.createElement("h2");
  title.textContent = lesson.title;

  const body = document.createElement("p");
  body.textContent = lesson.body || "Lesson content coming soon.";

  page.append(title, body);

  /* VIDEO */

  if (lesson.video_url) {
    const heading = document.createElement("h4");
    heading.textContent = "Lesson Video";
    page.appendChild(heading);

    addVideo(page, lesson.video_url, lesson.title);
  }

  /* PRACTICAL EXERCISE */

  const exerciseHeading = document.createElement("h4");
  exerciseHeading.textContent = "Practical Exercise";

  const exercise = document.createElement("p");
  exercise.textContent = getExercise(lesson.title);

  page.append(exerciseHeading, exercise);

  /* COMPLETE LESSON */

  const completeButton = document.createElement("button");
  completeButton.className = "btn small";
  completeButton.type = "button";
  completeButton.textContent = "Complete Lesson";

  completeButton.addEventListener("click", () => {
    saveProgress(lesson.id, completeButton);
  });

  page.appendChild(completeButton);

  /* BACK BUTTON */

  const backButton = document.createElement("button");
  backButton.className = "btn small secondary";
  backButton.type = "button";
  backButton.textContent = "← Back to Lessons";
  backButton.style.marginLeft = "10px";

  backButton.addEventListener("click", () => {
    renderLessons();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  page.appendChild(backButton);

  /* PREVIOUS AND NEXT */

  const navigation = document.createElement("div");
  navigation.style.marginTop = "25px";
  navigation.style.display = "flex";
  navigation.style.gap = "10px";
  navigation.style.flexWrap = "wrap";

  if (index > 0) {
    const previous = document.createElement("button");
    previous.className = "btn small secondary";
    previous.textContent = "← Previous Lesson";

    previous.addEventListener("click", () => {
      openLesson(index - 1);
    });

    navigation.appendChild(previous);
  }

  if (index < lessons.length - 1) {
    const next = document.createElement("button");
    next.className = "btn small";
    next.textContent = "Next Lesson →";

    next.addEventListener("click", () => {
      openLesson(index + 1);
    });

    navigation.appendChild(next);
  }

  page.appendChild(navigation);
  lessonList.appendChild(page);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ================================
   PRACTICAL EXERCISES
================================ */

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

/* ================================
   VIDEO PLAYER
================================ */

function addVideo(container, videoUrl, title) {
  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    const notice = document.createElement("p");
    notice.textContent = "The video link is not a valid YouTube URL or video ID.";
    container.appendChild(notice);
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "video-wrap";

  const iframe = document.createElement("iframe");

  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
  iframe.title = `${title} video`;
  iframe.loading = "lazy";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;

  wrapper.appendChild(iframe);
  container.appendChild(wrapper);
}

function getYouTubeId(value) {
  if (!value) return null;

  const input = value.trim();

  // Accept a YouTube video ID directly.
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);

    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0];
    }

    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtube-nocookie.com")
    ) {
      if (url.searchParams.get("v")) {
        return url.searchParams.get("v");
      }

      const parts = url.pathname.split("/");
      const embedIndex = parts.indexOf("embed");

      if (embedIndex !== -1) {
        return parts[embedIndex + 1];
      }
    }
  } catch (error) {
    console.error("Invalid video URL:", error);
  }

  return null;
}

/* ================================
   SAVE LESSON PROGRESS
================================ */

async function saveProgress(lessonId, button) {
  button.disabled = true;
  button.textContent = "Saving...";

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: currentUser.id,
        lesson_id: lessonId
      },
      {
        onConflict: "user_id,lesson_id"
      }
    );

  if (error) {
    console.error(error);

    button.disabled = false;
    button.textContent = "Try Again";

    return;
  }

  button.textContent = "Lesson Completed ✓";
}

/* ================================
   RUN
================================ */

startClassroom();
