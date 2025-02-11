function latLngToTileCoords(lat: number, lon: number, zoom: number) {
    const scale = 256 * Math.pow(2, zoom); // 256 pixels per tile, scale depends on zoom level
    const x = (lon + 180) / 360 * scale;
    const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * scale;
    
    const tileX = Math.floor(x / 256); // tile x-coordinate
    const tileY = Math.floor(y / 256); // tile y-coordinate
    
    return { x: tileX, y: tileY };
}

export default latLngToTileCoords;