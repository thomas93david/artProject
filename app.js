const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = "apikey=89643ce0-b0ad-11ea-b9ba-79f51ab17128"; // USE YOUR KEY HERE

async function fetchObjects() {
  onFetchStart();
  const url = `${BASE_URL}/object?${KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}
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
  } finally {
    onFetchEnd();
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
    localStorage.setItem("classifications", JSON.stringify(records));
    return records;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
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

function buildSearchString() {
  let selCal = $("#select-classification").val();
  let selCen = $("#select-century").val();
  let keywords = $("#keywords").val();

  const encodedURL = encodeURI(
    `${BASE_URL}/object?${KEY}&${selCal}&${selCen}&${keywords}`
  );
  return encodedURL;
}
buildSearchString();

$("#search").on("submit", async function (event) {
  event.preventDefault();
  onFetchStart();
  try {
    const searchString = buildSearchString();
    const response = await fetch(searchString);
    const { records, info } = await response.json();
    console.log(records);
    console.log(info);
    updatePreview(records, info);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

function updatePreview(records, info) {
  const root = $("#preview");
  const rootSearch = root.find(".results");
  rootSearch.empty();
  records.forEach(function (record) {
    rootSearch.append(renderPreview(record));
  });

  if (info.next) {
    root.find(".next").data("url", info.next).attr("disabled", false);
  } else {
    root.find(".next").data("url", null).attr("disabled", true);
  }
  if (info.prev) {
    root.find(".previous").data("url", info.prev).attr("disabled", false);
  } else {
    root.find(".previous").data("url", null).attr("disabled", true);
  }
}

$("#preview").on("click", ".object-preview", function (event) {
  event.preventDefault();
  $(".object-preview").closest();
  const record = $(this).data("record");
  const featureElement = $("#feature");
  featureElement.html(renderFeature(record));
});

$("#preview .next, #preview .previous").on("click", async function () {
  onFetchStart();
  try {
    const url = $(this).data("url");
    const response = await fetch(url);
    const { records, info } = await response.json();
    updatePreview(records, info);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

$("#feature").on("click", "a", async function (event) {
  const href = $(this).attr("href");
  if (href.startsWith("mailto:")) {
    return;
  }
  event.preventDefault();
  onFetchStart();
  try {
    const response = await fetch(href);
    const { records, info } = await response.json();
    updatePreview(records, info);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

function searchURL(searchType, searchString) {
  return `${BASE_URL}/object?${KEY}&${searchType}=${searchString}`;
}

function factHTML(title, content, searchTerm = null) {
  // if content is empty or undefined, return an empty string ''
  if (!content) {
    return "";
  }
  // otherwise, if there is no searchTerm, return the two spans
  if (!searchTerm) {
    return `<span class="title">${title}</span>
      <span class="content">${content}</span>`;
  }
  // otherwise, return the two spans, with the content wrapped in an anchor tag
  return `<span class="title">${title}</span>
  <span class="content"><a href="${BASE_URL}/object?${KEY}&${searchTerm}=${encodeURI(
    content.split("-").join("|")
  )}">${content}</a>
</span>
`;
}

function photosHTML(images, primaryimageurl) {
  if (images.length > 0) {
    return images
      .map((image) => `<img src="${image.baseimageurl}" />`)
      .join("");
  } else if (primaryimageurl) {
    return `<img src=${primaryimageurl}" />`;
  } else {
    return "";
  }
}

function renderFeature(record) {
  const {
    title,
    dated,
    images,
    primaryimageurl,
    description,
    culture,
    style,
    technique,
    medium,
    dimensions,
    people,
    department,
    division,
    contact,
    creditline,
  } = record;

  const template = $(`<div class="object-feature">
 <header>
      <h3>${title}<h3>
      <h4>${dated}</h4>
    </header>
    <section class="facts">
      ${factHTML("Description", description)}
      ${factHTML("Culture", culture, "culture")}
      ${factHTML("Style", style)}
      ${factHTML("Technique", technique)}
      ${factHTML("Medium", medium)}
      ${factHTML("Dimensions", dimensions)}
      ${
        people
          ? people
              .map((person) => factHTML("Person", person.displayname, "person"))
              .join("")
          : ""
      }
      ${factHTML("Department", department)}
      ${factHTML("Division", division)}
      ${factHTML(
        "Contact",
        `<a target="_blank" href="mailto:${contact}">${contact}</a>`
      )}
      ${factHTML("Credit", creditline)}
    </section>
    <section class="photos">
      ${photosHTML(images, primaryimageurl)}
    </section>
  </div>`);
  return template;
}

function onFetchStart() {
  $("#loading").addClass("active");
}
function onFetchEnd() {
  $("#loading").removeClass("active");
}
function clear() {
  localStorage.clear();
}
prefetchCategoryLists();

function renderPreview(record) {
  const { description, primaryimageurl, title } = record;
  const element = $(`<div class="object-preview">
<a href="#">
${
  primaryimageurl && title
    ? `<img src="${primaryimageurl}"/> <h3>${title}</h3>`
    : title
    ? `<h3>${title}</h3>`
    : description
    ? `<h3>${description}</h3>`
    : `<img src='${primaryimageurl}'/>`
}
</a >
</div>`);

  element.data("record", record);
  return element;
}
