const photoStripImages = document.querySelectorAll(".photo-strip img[data-src]");

if (photoStripImages.length > 0) {
  const eventPath = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : `${window.location.pathname}/`;
  const eventUrl = new URL(eventPath, window.location.origin);

  for (const image of photoStripImages) {
    image.src = new URL(image.dataset.src, eventUrl).toString();
  }
}
