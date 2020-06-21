const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = "apikey=89643ce0-b0ad-11ea-b9ba-79f51ab17128"; // USE YOUR KEY HERE

async function fetchObjects() {
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
// fetchObjects().then((x) => console.log(x));
// fetchObjects();

async function fetchAllCenturies() {
  const century_URL = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;
  // "https://api.harvardartmuseums.org/century?apikey=89643ce0-b0ad-11ea-b9ba-79f51ab17128&size=100&sort=temporalorder"; ss and gs
  // if (localStorage.getItem("centuries")) {
  //   return JSON.parse(localStorage.getItem("centuries"));
  // }
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
  $(".classification-count").text(`(${classifications.length})`);
  classifications.forEach((classification) => {
    $("#select-classification").append(
      $(
        `<option value="${classification.name}">${classification.name}</option>`
      )
    );
  });

  $(".century-count").text(`(${centuries.length}))`);
  centuries.forEach((century) => {
    $("#select-century").append(
      $(`
    <option value="${century.name}"> ${century.name}</option>
    `)
    );
  });
  try {
    const [classifications, centuries] = await Promise.all([
      fetchAllClassifications(),
      fetchAllCenturies(),
    ]);
  } catch (error) {
    console.error(error);
  }
}
prefetchCategoryLists();
