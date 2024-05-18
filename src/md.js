function createNoTailwindClass() {
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

function parseMd(markdown) {
  // Convert headers
  markdown = markdown.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  markdown = markdown.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  markdown = markdown.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  markdown = markdown.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  markdown = markdown.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  markdown = markdown.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Convert bold text
  markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>");
  markdown = markdown.replace(/__(.*?)__/gim, "<b>$1</b>");

  // Convert italic text
  markdown = markdown.replace(/\*(.*?)\*/gim, "<i>$1</i>");
  markdown = markdown.replace(/_(.*?)_/gim, "<i>$1</i>");

  // Convert links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  // Convert unordered lists
  markdown = markdown.replace(/^\s*\n\* (.*)/gim, "<ul>\n<li>$1</li>\n</ul>");
  markdown = markdown.replace(/^\* (.*)/gim, "<li>$1</li>");

  // Convert ordered lists
  markdown = markdown.replace(/^\s*\n\d\. (.*)/gim, "<ol>\n<li>$1</li>\n</ol>");
  markdown = markdown.replace(/^\d\. (.*)/gim, "<li>$1</li>");

  // Convert blockquotes
  markdown = markdown.replace(/^\> (.*)/gim, "<blockquote>$1</blockquote>");

  // Convert line breaks
  markdown = markdown.replace(/\n$/gim, "<br />");

  return markdown.trim();
}

// searches all elements with attribute markdown and replaces the markdown inside with
// html code
function replaceMd() {
  let markdowns = document.querySelectorAll("[markdown]");
  for (let i = 0; i < markdowns.length; i++) {
    let elmnt = markdowns[i];
    to_convert = elmnt.innerHTML;
    elmnt.classList.add("no-tailwind");
    converted = parseMd(to_convert);
    elmnt.innerHTML = converted;
  }
}
