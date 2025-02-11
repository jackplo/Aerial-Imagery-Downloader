function randomZoomRange(): number {
    const randomNumber = Math.floor(Math.random() * (22 - 18 + 1)) + 18;
    return randomNumber;
}

export default randomZoomRange;