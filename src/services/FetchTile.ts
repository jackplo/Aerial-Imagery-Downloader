async function fetchTile(lat: number, lon: number, alt: number) {
  // Could possibly up the scale parameter here for higher quality images but probs not tho
  const url = `https://mt1.google.com/vt/lyrs=s&x=${lon}&y=${lat}&z=${alt}&scale=2&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);

  if (response.ok) {
    const imageBlob = await response.blob();
    const imageUrl = URL.createObjectURL(imageBlob);

    downloadTile(imageUrl);

    URL.revokeObjectURL(imageUrl);
  } else {
    console.error(`Failed to download ${url}`);
  }
}

function downloadTile(imageUrl: string) {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = `downloaded_tile.png`;
  link.click();
}

export default fetchTile;
