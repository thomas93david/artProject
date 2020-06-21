const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = "apikey=89643ce0-b0ad-11ea-b9ba-79f51ab17128"; // USE YOUR KEY HERE

async function fetchObjects() {
  onFetchStart();
  onFetchEnd();
  const url = `${BASE_URL}/object?${KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
    // console.log(data);
  } catch (error) {
    console.error(error);
  }
}
fetchObjects().then((x) => console.log(x));
fetchObjects();

async function fetchAllCenturies() {
  onFetchStart();
  onFetchEnd();
  const century_URL = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;
  // "https://api.harvardartmuseums.org/century?apikey=89643ce0-b0ad-11ea-b9ba-79f51ab17128&size=100&sort=temporalorder"; ss and gs
  let sideBar = localStorage.getItem("centuries");
  if (typeof sideBar !== "undefined" && sideBar !== null) {
    if (sideBar) {
      return JSON.parse(localStorage.getItem("centuries"));
    }
  } else {
    localStorage.clear();
  }
  try {
    const response = await fetch(century_URL);
    const { records } = await response.json();
    localStorage.setItem("centuries", JSON.stringify({ records }));
    return { records };
    // localStorage.setItem("centuries");
    // return { records };
  } catch (error) {
    console.error(error);
  }
}

fetchAllCenturies();

async function fetchAllClassifications() {
  onFetchStart();
  onFetchEnd();
  let sideBar = localStorage.getItem("classifications");
  if (typeof sideBar !== "undefined" && sideBar !== null) {
    if (sideBar) {
      return JSON.parse(localStorage.getItem("classifications"));
    }
  } else {
    localStorage.clear();
  }
  const classifications_URL = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;

  try {
    const response = await fetch(classifications_URL);
    const { records } = await response.json();
    localStorage.setItem("classifications", JSON.stringify({ records }));
    return { records };
  } catch (error) {
    console.error(error);
  }
}
fetchAllClassifications();

async function prefetchCategoryLists() {
  try {
    const [classifications, centuries] = await Promise.all([
      fetchAllClassifications(),
      fetchAllCenturies(),
    ]);
    $(".classification-count").text(`(${classifications.length})`);
    console.log("Below me");

    classifications.forEach((classification) => {
      $("#select-classification").append(
        $(
          `<option value="${classification.name}">${classification.name}</option>`
        )
      );
    });
    $(".century-count").text(`(${centuries.length})`);
    centuries.forEach((century) => {
      $("#select-century").append(
        $(`<option value="${century.name}">${century.name}</option>`)
      );
    });
  } catch (error) {
    console.error(error);
  }
}

prefetchCategoryLists();

function buildSearchString() {
  onFetchStart();
  onFetchEnd();
  const sel_CAL = $("#select-classification").val();
  const sel_CEN = $("#select-century").val();
  const key_WORD = $("#keywords").val();
  const value_URL = `${BASE_URL}/object?apikey=${KEY}&classification=${sel_CAL}&century=${sel_CEN} &keyword=${key_WORD}`;
  const search_URL = encodeURI(value_URL);

  $("#search").on("submit", async function (event) {
    $("#search").preventDefault();

    try {
      const response = await fetch(search_URL);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
    }
  });
}

function onFetchStart() {
  $("#loading").addClass("active");
}

function onFetchEnd() {
  $("#loading").removeClass("active");
}

function renderPreview(record) {
  const { id, primaryimageURL, title, description } = record;
  const renPREV = $(`
<div class="object-preview">
    <a href=${id}>
      <img src=${primaryimageURL} />
      <h3>${title}/h3>
      <h3>${description}</h3>
    </a>
  </div>
`).data("record", record);

  return renPREV;
}

function updatePreview(records) {
  const root = $("#preview");
  $(".results").empty();
  records.forEach(function (records) {
    $(".results").append(renderPreview(records));
  });
}
updatePreview();
