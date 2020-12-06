const searchBoxElement = document.getElementById("search-box");
const outputElement = document.getElementById("output");

searchBoxElement.addEventListener("input", async (e) => {
  if (e.target.value.length) {
    const params = new URLSearchParams({
      phrase: e.target.value,
    });

    const response = await fetch(`/api/search?${params.toString()}`);
    const result = await response.json();
    const items = result.items;

    const itemsHtml = `<ul>
       ${items
         .map(
           (item) =>
             `<li><a href="/editor.html?filename=${encodeURIComponent(item.filename)}">${item.filename}</a></li>`
         )
         .join("")}
     </ul>`;

    outputElement.innerHTML = itemsHtml;

    console.log(result.durationInMs);
  }
});
