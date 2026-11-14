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
   STARTER CORELDRAW LESSONS
   ========================================================= */

function showStarterLessons() {
  const lessons = [
    {
      number: 1,
      title: "CorelDRAW Workspace & Interface",
      description:
        "Learn the main parts of the CorelDRAW workspace, including the Toolbox, Property Bar, rulers, dockers and Color Palette.",
      video: "v-MpITB8nNM",
      exercise:
        "Open CorelDRAW and identify the Toolbox, Property Bar, Color Palette and page area."
    },

    {
      number: 2,
      title: "Shapes & Text",
      description:
        "Learn how to create common shapes, edit them and add text to your designs.",
      video: "dehrBWCKxeA",
      exercise:
        "Create a rectangle, circle and star. Add a text heading to your design."
    },

    {
      number: 3,
      title: "Colors & Outlines",
      description:
        "Learn how to apply fills, outlines and different colors to objects.",
      video: null,
      exercise:
        "Create three shapes and give each one a different fill and outline."
    },

    {
      number: 4,
      title: "Creating a Simple Logo",
      description:
        "Combine shapes and text to create a clean and simple logo.",
      video: null,
      exercise:
        "Create a logo using at least two shapes and one text element."
    },

    {
      number: 5,
      title: "Designing a Flyer",
      description:
        "Combine text, shapes, colors and images to create a simple flyer.",
      video: null,
      exercise:
        "Design a one-page flyer for a school, business or event."
    },

    {
      number: 6,
      title: "Final CorelDRAW Project",
      description:
        "Put everything you have learned together in one complete design.",
      video: null,
      exercise:
        "Create a complete design containing a title, logo, shapes, colors, text and supporting graphics."
    }
  ];

  lessons.forEach((lesson) => {
    renderStarterLesson(lesson);
  });
}


/* =========================================================
   DATABASE LESSONS
   ========================================================= */

function renderDatabaseLesson(lesson) {
  const article = document.createElement("article");

  article.className = "lesson";

  const title = document.createElement("h3");

  title.textContent = lesson.title;

  const body = document.createElement("p");

  body.textContent =
    lesson.body || "Lesson content will be added soon.";

  article.appendChild(title);

  article.appendChild(body);

  /*
    If your Supabase lessons table has a video_id
    column, the YouTube video will appear here.
  */

  if (lesson.video_id) {
    addVideo(
      article,
      lesson.video_id,
      lesson.title
    );
  }

  addCompletedButton(
    article,
    lesson.id
  );

  lessonList.appendChild(article);
}


/* =========================================================
   STARTER LESSON DISPLAY
   ========================================================= */

function renderStarterLesson(lesson) {
  const article = document.createElement("article");

  article.className = "lesson";

  const title = document.createElement("h3");

  title.textContent =
    `Lesson ${lesson.number}: ${lesson.title}`;

  const description = document.createElement("p");

  description.textContent =
    lesson.description;

  article.appendChild(title);

  article.appendChild(description);

  if (lesson.video) {
    const videoHeading = document.createElement("h4");

    videoHeading.textContent =
      "Lesson video";

    article.appendChild(videoHeading);

    addVideo(
      article,
      lesson.video,
      lesson.title
    );
  }

  const exerciseHeading = document.createElement("h4");

  exerciseHeading.textContent =
    "Practical exercise";

  const exercise = document.createElement("p");

  exercise.textContent =
    lesson.exercise;

  article.appendChild(exerciseHeading);

  article.appendChild(exercise);

  const status = document.createElement("button");

  status.className = "btn small";

  status.textContent =
    "Starter lesson";

  status.disabled = true;

  article.appendChild(status);

  lessonList.appendChild(article);
}


/* =========================================================
   YOUTUBE VIDEO
   ========================================================= */

function addVideo(
  article,
  videoId,
  title
) {
  const wrapper =
    document.createElement("div");

  wrapper.className =
    "video-wrap";

  const iframe =
    document.createElement("iframe");

  iframe.src =
    `https://www.youtube.com/embed/${videoId}`;

  iframe.title =
    `${title} video`;

  iframe.loading =
    "lazy";

  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

  iframe.allowFullscreen =
    true;

  wrapper.appendChild(iframe);

  article.appendChild(wrapper);
}


/* =========================================================
   MARK LESSON AS COMPLETED
   ========================================================= */

function addCompletedButton(
  article,
  lessonId
) {
  const button =
    document.createElement("button");

  button.className =
    "btn small";

  button.textContent =
    "Mark as completed";

  button.addEventListener(
    "click",
    async () => {

      button.disabled = true;

      button.textContent =
        "Saving...";

      const { error } =
        await supabase
          .from("lesson_progress")
          .upsert(
            {
              user_id: user.id,
              lesson_id: lessonId
            },
            {
              onConflict:
                "user_id,lesson_id"
            }
          );

      if (error) {
        console.error(error);

        button.disabled = false;

        button.textContent =
          "Try again";

        return;
      }

      button.textContent =
        "Completed ✓";
    }
  );

  article.appendChild(button);
}
