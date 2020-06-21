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
  const url = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;
  if (localStorage.getItem("centuries")) {
    return JSON.parse(localStorage.getItem("centuries"));
  }
  try {
    const response = await fetch(url);
    const { records } = await response.json();
    localStorage.setItem("centuries", JSON.stringify(records));
    return records;
  } catch (error) {
    console.error(error);
  }
}
async function fetchAllClassifications() {
  const url = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;
  if (localStorage.getItem("classifications")) {
    return JSON.parse(localStorage.getItem("classifications"));
  }
  try {
    const response = await fetch(url);
    const { records } = await response.json();
    localStorage.setItem("centuries", JSON.stringify(records));
    return records;
  } catch (error) {
    console.error(error);
  }
}
async function prefetchCategoryLists() {
  try {
    const [classifications, centuries] = await Promise.all([
      fetchAllClassifications(),
      fetchAllCenturies(),
    ]);
    console.log(centuries);
    console.log(classifications);
    $(".classification-count").text(`(${classifications.length})`);
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

async function fetchAllCenturies() {
  if (localStorage.getItem("centuries")) {
    return JSON.parse(localStorage.getItem("centuries"));
  }
  try {
    const response = await fetch(
      `${BASE_URL}?${KEY}&size=100&sort=temporalorder`
    );
    const { info, records } = await response.json();
    localStorage.setItem("centuries", JSON.stringify(records));
    return records;
  } catch (error) {
    console.error(error);
  }
}
async function fetchAllClassifications() {
  if (localStorage.getItem("classifications")) {
    return JSON.parse(localStorage.getItem("classifications"));
  }
  try {
    const response = await fetch(`${BASE_URL}?${KEY}&size=100&sort=name`);
    const { info, records } = await response.json();
    localStorage.setItem("classifications", JSON.stringify(records));
    return records;
  } catch (error) {
    console.error(error);
  }
}
async function prefetchCategoryLists() {
  try {
    const [classifications, centuries] = await Promise.all([
      fetchAllClassifications(),
      fetchAllCenturies(),
    ]);
    $(".classification-count").text(`(${classifications.length})`);
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
  const rootSearch = root.find(".results");
  if (info.next) {
    root.find(".next").data("url", info.next).attr("disabled", false);
  } else {
    root.find(".next").data("url", null).attr("disabled", true);
  }
  if (info.prev) {
    root.find(".previous").data("url", info.previous).attr("disabled", false);
  } else {
    root.find(".previous").data("url", null).attr("disabled", true);
  }
  rootSearch.empty();
  records.forEach(function (records) {
    rootSearch.append(renderPreview(records));
  });

  updatePreview();
}
