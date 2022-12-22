//#region global variables
let htmlBlur;
let htmlWindow;
let htmlScrollable;
let htmlMicro;
let htmlMicroLabel;
let arrEquipment = ["e-z_curl_bar", "barbell", "dumbbell", "cable", "kettlebell", "machine"];
let arrTypes = [
  "cardio",
  "olympic_weightlifting",
  "powerlifting",
  "strength",
  "stretching",
  "strongman",
];
//#endregion

//#region func__
function encodeQueryData(data) {
  const listParams = [];
  for (let d in data) listParams.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  return listParams.join("&");
}
//#endregion

//#region http__
const ninja_httpGetAsync = function (theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(JSON.parse(xmlHttp.responseText));
    }
  };
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.setRequestHeader("X-Api-Key", "ttb2dg/fzG2YF20LoY5xhQ==CCAmMFTJQu5ZEG2L");
  xmlHttp.send(null);
  return;
};

const tenor_httpGetAsync = function (theUrl, exerciseName, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(
        JSON.parse(xmlHttp.responseText)["results"][0]["media_formats"]["gif"]["url"],
        exerciseName
      );
    }
  };
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.send(null);
  return;
};
//#endregion

//#region show__
const ninja_showExercises = function (jsonObject) {
  console.log("NINJA:");
  console.log(jsonObject);
  const exercises = document.querySelector(".js-exercises");
  exercises.innerHTML = "";
  jsonObject.forEach((element) => {
    var name = element["name"];
    if (name.length > 25) name = name.substring(0, 24) + "...";
    var id = name.toLowerCase().replace(/(|)/g, "").replace(/ /g, "_");
    localStorage.setItem(id, JSON.stringify(element));
    exercises.innerHTML += `<a class="o-gif-list__item c-custom-gif-container js-exercise" href="#" onclick="toggle('${id}')">
        <span class="c-input c-custom-gif">
          <label class="c-custom-gif__label" for="">${name}</label>
          <img class="c-custom-gif__image" id="${id}" src="Unavailable.gif" alt="Unavailable.gif">
        </span>
        <svg class="c-symbol c-custom_gif__symbol" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
          viewBox="-5 -5 24 24">
          <g id="info-icon-svgrepo-com" transform="translate(0 0)">
            <path id="Path_3" data-name="Path 3"
              d="M11.953,2.054a7,7,0,1,0-.006,9.9A7,7,0,0,0,11.953,2.054ZM7.977,11.442a.2.2,0,0,1-.2.2H6.218a.2.2,0,0,1-.2-.2V5.637a.2.2,0,0,1,.2-.2H7.782a.2.2,0,0,1,.2.2ZM7,4.63A1.134,1.134,0,1,1,8.134,3.5,1.135,1.135,0,0,1,7,4.63Z"
              transform="translate(0 0)" />
          </g>
        </svg>
      </a>`;
    tenor_getGif(name);
  });
};

const tenor_showGif = function (gifUrl, exerciseName) {
  var id = exerciseName.toLowerCase().replace(/(|)/g, "").replace(/ /g, "_");
  document.getElementById(id).src = gifUrl;
};
//#endregion

//#region get__
const ninja_getExercises = function (muscle, type, difficulty) {
  let url = "https://api.api-ninjas.com/v1/exercises";
  let data = {};
  if (muscle != "any" || type != "any" || difficulty != "any") url += "?";
  if (muscle != "any") data["muscle"] = muscle;
  if (type != "any") data["type"] = type;
  if (difficulty != "any") data["difficulty"] = difficulty;
  url += encodeQueryData(data);
  ninja_httpGetAsync(url, ninja_showExercises);
};

const tenor_getGif = function (exerciseName) {
  var apikey = "AIzaSyBj_9kWfF0BRjHDIuFlXmt_LG5U5y0F6rk";
  var clientkey = "my_test_app";
  var lmt = 1;

  var search_url =
    "https://tenor.googleapis.com/v2/search?q=" +
    exerciseName +
    "&key=" +
    apikey +
    "&client_key=" +
    clientkey +
    "&limit=" +
    lmt;

  tenor_httpGetAsync(search_url, exerciseName, tenor_showGif);
};
//#endregion

//#region listenTo__

const toggle = function (id) {
  if (id != 0) {
    let json = JSON.parse(localStorage.getItem(id));
    let props = document.querySelectorAll(".c-ex-prop");
    props.forEach((prop) => {
      prop.classList.remove("active");
    });
    let element = document.querySelector(".js-ex-name");
    element.innerHTML = json["name"];
    if (arrTypes.includes(json["type"])) {
      let element = document.querySelector(`.js-type-${json["type"]}`);
      element.classList.toggle("active");
    }
    if (arrEquipment.includes(json["equipment"])) {
      let element = document.querySelector(`.js-eq-${json["equipment"]}`);
      element.classList.toggle("active");
    }
    let instructions = document.querySelector(".js-instructions");
    instructions.textContent = json["instructions"];
    console.log(json["instructions"]);
    htmlMicro.classList.remove("beginner");
    htmlMicro.classList.remove("intermediate");
    htmlMicro.classList.remove("expert");
    htmlMicro.classList.add(json["difficulty"]);
    htmlMicroLabel.innerHTML = json["difficulty"];
  }

  htmlBlur.classList.toggle("active");
  htmlWindow.classList.toggle("active");
  htmlScrollable.classList.toggle("active");
  htmlMicro.classList.toggle("active");
};

const listenToUI = function () {
  const btnFindExercises = document.querySelector(".js-find-exercises");
  btnFindExercises.addEventListener("click", function () {
    localStorage.clear();
    const muscle = document.querySelector(".js-filter-muscle").value;
    const type = document.querySelector(".js-filter-type").value;
    const radioButtons = document.querySelectorAll('input[name="radios"]');
    let difficulty;
    for (const radioButton of radioButtons) {
      if (radioButton.checked) {
        difficulty = radioButton.value;
        break;
      }
    }
    ninja_getExercises(muscle, type, difficulty);
  });
};
//#endregion

const init = function () {
  htmlBlur = document.querySelector(".js-blur");
  htmlWindow = document.querySelector(".js-window");
  htmlScrollable = document.querySelector(".js-scrollable");
  htmlMicro = document.querySelector(".js-micro");
  htmlMicroLabel = document.querySelector(".js-micro-label");
  listenToUI();
};

document.addEventListener("DOMContentLoaded", init);
