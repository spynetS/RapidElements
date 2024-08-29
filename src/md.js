export function createNoTailwindClass() {
  const style = document.createElement("style");
  style.innerHTML = `
      .no-tailwind h1,
      .no-tailwind h2,
      .no-tailwind h3,
      .no-tailwind h4,
      .no-tailwind h5,
      .no-tailwind h6,
      .no-tailwind p,
      .no-tailwind div,
      .no-tailwind span,
      .no-tailwind a,
      .no-tailwind ul,
      .no-tailwind li,
      .no-tailwind table,
      .no-tailwind tr,
      .no-tailwind th,
      .no-tailwind td {
          all: revert;
          font-family: inherit;
          color: inherit;
          background-color: inherit;
      }
  `;
  document.head.appendChild(style);
}

export function parseMd(markdown) {
  // Convert headers, allowing for leading whitespace
  markdown = markdown.replace(/^\s*######\s+(.*)$/gim, "<h6>$1</h6>");
  markdown = markdown.replace(/^\s*#####\s+(.*)$/gim, "<h5>$1</h5>");
  markdown = markdown.replace(/^\s*####\s+(.*)$/gim, "<h4>$1</h4>");
  markdown = markdown.replace(/^\s*###\s+(.*)$/gim, "<h3>$1</h3>");
  markdown = markdown.replace(/^\s*##\s+(.*)$/gim, "<h2>$1</h2>");
  markdown = markdown.replace(/^\s*#\s+(.*)$/gim, "<h1>$1</h1>");

  // Convert bold text
  markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>");
  markdown = markdown.replace(/__(.*?)__/gim, "<b>$1</b>");

  // Convert italic text
  markdown = markdown.replace(/\*(.*?)\*/gim, "<i>$1</i>");
  markdown = markdown.replace(/_(.*?)_/gim, "<i>$1</i>");

  // Convert links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  // Convert unordered lists, allowing for leading whitespace
  markdown = markdown.replace(/^\s*\* (.*)/gim, "<ul>\n<li>$1</li>\n</ul>");
  markdown = markdown.replace(/^\s*\n\*\s+(.*)/gim, "<ul>\n<li>$1</li>\n</ul>");

  // Convert ordered lists, allowing for leading whitespace
  markdown = markdown.replace(
    /^\s*\d+\.\s+(.*)/gim,
    "<ol>\n<li>$1</li>\n</ol>",
  );
  markdown = markdown.replace(
    /^\s*\n\d+\.\s+(.*)/gim,
    "<ol>\n<li>$1</li>\n</ol>",
  );

  // Convert blockquotes, allowing for leading whitespace
  markdown = markdown.replace(
    /^\s*\>\s+(.*)/gim,
    "<blockquote>$1</blockquote>",
  );

  // Convert line breaks
  markdown = markdown.replace(/\n$/gim, "<br />");

  return markdown.trim();
}

// searches all elements with attribute markdown and replaces the markdown inside with
// html code
export function replaceMd() {
  let markdowns = document.querySelectorAll("[markdown]");
  for (let i = 0; i < markdowns.length; i++) {
    let elmnt = markdowns[i];
    let to_convert = elmnt.innerHTML;
    elmnt.classList.add("no-tailwind");
    let converted = parseMd(to_convert);
    elmnt.innerHTML = converted;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll("[include-md]");

  elements.forEach(function (elmnt) {
    const include_md = elmnt.getAttribute("include-md");
    if (include_md) {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = parseMd(this.responseText);
            elmnt.classList.add("no-tailwind");
          }
          if (this.status == 404) {
            elmnt.innerHTML = "Page not found.";
          }
        }
      };
      xhttp.open("GET", include_md, true);
      xhttp.send();
    }
  });
});
