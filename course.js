import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const params = new URLSearchParams(
  window.location.search
);

const courseId = params.get("id");

const message =
  document.getElementById("courseMessage");

const lessonList =
  document.getElementById("lessonList");

const courseTitle =
  document.getElementById("courseTitle");

const courseDescription =
  document.getElementById("courseDescription");


/* =========================================================
   CHECK LOGIN
   ========================================================= */

const {
  data: { user },
  error: authError
} = await supabase.auth.getUser();

if (authError || !user) {

  window.location.href = "auth.html";

} else if (!courseId) {

  message.textContent =
    "No course was selected.";

} else {

  loadCourse();
}


/* =========================================================
   LOAD COURSE
   ========================================================= */

async function loadCourse() {

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

    message.textContent =
      "This course could not be loaded.";

    return;
  }

  courseTitle.textContent =
    course.title;

  courseDescription.textContent =
    course.description || "";


  const {
    data: lessons,
    error
  } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("published", true)
    .order("position", {
      ascending: true
    });


  if (error) {

    console.error(error);

    message.textContent =
      "Unable to load lessons.";

    return;
  }


  lessonList.innerHTML = "";


  if (!lessons || lessons.length === 0) {

    message.textContent =
      "CorelDRAW lessons are ready.";

    showStarterLessons();

    return;
  }


  message.textContent = "";


  lessons.forEach((lesson) => {

    renderDatabaseLesson(lesson);

  });
}


/* =========================================================
   STARTER LESSON DATA
   ========================================================= */

function showStarterLessons() {

  const lessons = [

    {
      number: 1,

      title:
        "CorelDRAW Workspace & Interface",

      description:
        "Learn the main parts of the CorelDRAW workspace and understand where the most important tools are located.",

      video:
        "v-MpITB8nNM",

      steps: [
        "Open CorelDRAW.",
        "Locate the Toolbox on the left side.",
        "Find the Property Bar at the top.",
        "Find the Color Palette.",
        "Identify the main page area.",
        "Practice selecting different tools."
      ],

      exercise:
        "Open CorelDRAW and identify the Toolbox, Property Bar, Color Palette and page area."
    },


    {
      number: 2,

      title:
        "Shapes & Text",

      description:
        "Learn how to create basic shapes and add text to your CorelDRAW designs.",

      video:
        "dehrBWCKxeA",

      steps: [
        "Open a new CorelDRAW document.",
        "Select the Rectangle tool.",
        "Draw a rectangle.",
        "Create a circle using the Ellipse tool.",
        "Create a star.",
        "Select the Text tool.",
        "Click on the page and type a heading."
      ],

      exercise:
        "Create a rectangle, circle and star. Add a text heading to your design."
    },


    {
      number: 3,

      title:
        "Colors & Outlines",

      description:
        "Learn how to change object colors and apply outlines to your designs.",

      video:
        null,

      steps: [
        "Create three different shapes.",
        "Select the first shape.",
        "Choose a color from the Color Palette.",
        "Change the color of the second shape.",
        "Change the color of the third shape.",
        "Apply different outlines to the shapes."
      ],

      exercise:
        "Create three shapes and give each one a different fill and outline."
    },


    {
      number: 4,

      title:
        "Creating a Simple Logo",

      description:
        "Learn how to combine shapes and text to create a simple logo.",

      video:
        null,

      steps: [
        "Create a new document.",
        "Draw two or more shapes.",
        "Choose colors for your shapes.",
        "Add your logo text.",
        "Arrange the shapes and text.",
        "Group the objects when your design is finished."
      ],

      exercise:
        "Create a logo using at least two shapes and one text element."
    },


    {
      number: 5,

      title:
        "Designing a Flyer",

      description:
        "Learn how to combine text, shapes and colors to create a simple flyer.",

      video:
        null,

      steps: [
        "Create a new page.",
        "Choose a suitable background.",
        "Add a large heading.",
        "Add supporting text.",
        "Add shapes or graphics.",
        "Arrange the elements neatly.",
        "Review your flyer before saving it."
      ],

      exercise:
        "Design a one-page flyer for a school, business or event."
    },


    {
      number: 6,

      title:
        "Final CorelDRAW Project",

      description:
        "Use the skills from the previous lessons to create a complete CorelDRAW project.",

      video:
        null,

      steps: [
        "Create a new CorelDRAW document.",
        "Plan your design.",
        "Add your title.",
        "Create or add a logo.",
        "Use shapes and colors.",
        "Add supporting text and graphics.",
        "Check alignment and spacing.",
        "Save your finished project."
      ],

      exercise:
        "Create a complete design containing a title, logo, shapes, colors, text and supporting graphics."
    }

  ];


  lessons.forEach((lesson) => {

    renderStarterLesson(lesson);

  });
}


/* =========================================================
   CREATE STARTER LESSON CARD
   ========================================================= */

function renderStarterLesson(lesson) {

  const card =
    document.createElement("article");

  card.className =
    "lesson";


  const title =
    document.createElement("h3");

  title.textContent =
    `Lesson ${lesson.number}: ${lesson.title}`;

  card.appendChild(title);


  const description =
    document.createElement("p");

  description.textContent =
    lesson.description;

  card.appendChild(description);


  const startButton =
    document.createElement("button");

  startButton.className =
    "btn small";

  startButton.textContent =
    "Start Lesson";


  startButton.addEventListener(
    "click",
    () => {

      openStarterLesson(
        lesson
      );

    }
  );


  card.appendChild(
    startButton
  );


  lessonList.appendChild(
    card
  );
}


/* =========================================================
   OPEN STARTER LESSON
   ========================================================= */

function openStarterLesson(lesson) {

  lessonList.innerHTML = "";


  const lessonPage =
    document.createElement("article");

  lessonPage.className =
    "lesson";


  /* TITLE */

  const title =
    document.createElement("h2");

  title.textContent =
    `Lesson ${lesson.number}: ${lesson.title}`;

  lessonPage.appendChild(title);


  /* DESCRIPTION */

  const description =
    document.createElement("p");

  description.textContent =
    lesson.description;

  lessonPage.appendChild(
    description
  );


  /* VIDEO */

  if (lesson.video) {

    const heading =
      document.createElement("h4");

    heading.textContent =
      "Lesson Video";

    lessonPage.appendChild(
      heading
    );

    addVideo(
      lessonPage,
      lesson.video,
      lesson.title
    );
  }


  /* LESSON STEPS */

  const stepsHeading =
    document.createElement("h4");

  stepsHeading.textContent =
    "What to do";

  lessonPage.appendChild(
    stepsHeading
  );


  const steps =
    document.createElement("ol");


  lesson.steps.forEach(
    (step) => {

      const item =
        document.createElement("li");

      item.textContent =
        step;

      item.style.marginBottom =
        "10px";

      steps.appendChild(
        item
      );

    }
  );


  lessonPage.appendChild(
    steps
  );


  /* EXERCISE */

  const exerciseHeading =
    document.createElement("h4");

  exerciseHeading.textContent =
    "Practical Exercise";

  lessonPage.appendChild(
    exerciseHeading
  );


  const exercise =
    document.createElement("p");

  exercise.textContent =
    lesson.exercise;

  lessonPage.appendChild(
    exercise
  );


  /* COMPLETE BUTTON */

  const completeButton =
    document.createElement("button");

  completeButton.className =
    "btn small";

  completeButton.textContent =
    "Complete Lesson";


  completeButton.addEventListener(
    "click",
    () => {

      completeButton.textContent =
        "Lesson Completed ✓";

      completeButton.disabled =
        true;

    }
  );


  lessonPage.appendChild(
    completeButton
  );


  /* BACK BUTTON */

  const backButton =
    document.createElement("button");

  backButton.className =
    "btn small secondary";

  backButton.textContent =
    "← Back to Lessons";

  backButton.style.marginLeft =
    "10px";


  backButton.addEventListener(
    "click",
    () => {

      lessonList.innerHTML = "";

      showStarterLessons();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );


  lessonPage.appendChild(
    backButton
  );


  lessonList.appendChild(
    lessonPage
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   DATABASE LESSON
   ========================================================= */

function renderDatabaseLesson(lesson) {

  const card =
    document.createElement("article");

  card.className =
    "lesson";


  const title =
    document.createElement("h3");

  title.textContent =
    lesson.title;

  card.appendChild(title);


  const body =
    document.createElement("p");

  body.textContent =
    lesson.body ||
    "Lesson content will be added soon.";

  card.appendChild(body);


  const startButton =
    document.createElement("button");

  startButton.className =
    "btn small";

  startButton.textContent =
    "Start Lesson";


  startButton.addEventListener(
    "click",
    () => {

      card.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      startButton.textContent =
        "Lesson Started ✓";

    }
  );


  card.appendChild(
    startButton
  );


  if (lesson.video_id) {

    addVideo(
      card,
      lesson.video_id,
      lesson.title
    );

  }


  addCompletedButton(
    card,
    lesson.id
  );


  lessonList.appendChild(
    card
  );
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


  wrapper.appendChild(
    iframe
  );


  article.appendChild(
    wrapper
  );
}


/* =========================================================
   DATABASE COMPLETION
   ========================================================= */

function addCompletedButton(
  article,
  lessonId
) {

  const button =
    document.createElement("button");

  button.className =
    "btn small secondary";

  button.textContent =
    "Mark as completed";


  button.addEventListener(
    "click",
    async () => {

      button.disabled =
        true;

      button.textContent =
        "Saving...";


      const {
        error
      } = await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id:
              user.id,

            lesson_id:
              lessonId
          },
          {
            onConflict:
              "user_id,lesson_id"
          }
        );


      if (error) {

        console.error(error);

        button.disabled =
          false;

        button.textContent =
          "Try again";

        return;
      }


      button.textContent =
        "Completed ✓";
    }
  );


  article.appendChild(
    button
  );
}
