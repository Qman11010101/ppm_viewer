var filename;

function downloadImage(type) {
    let mime, quality;
    switch (type) {
        case "png":
            mime = "image/png";
            quality = 1;
            break;
        case "jpg":
            mime = "image/jpeg";
            quality = Math.min(Number(document.getElementById("image-quality").value) / 100, 1);
            break;
    }

    const canvas = document.getElementById("image-output");
    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL(mime, quality);
    downloadLink.download = filename + "." + type;
    downloadLink.click();
}

function removeExtension(filename) {
    const splitedName = filename.split(".");
    splitedName.pop();
    return splitedName.join(".");
}

// Parsers
function parsePPM(lines) {
    const format = lines.shift();
    if (format.trim() !== "P3") throw new Error("Specified file is not PPM format.");
    const wh = lines.shift();
    const toneLevel = lines.shift();
    let colorData = [];
    for (let i = 0; i < lines.length; i++) {
        let pixelRGB = lines[i].split(" ").map(s => Number(s));
        colorData.push(Math.floor(pixelRGB[0] / Number(toneLevel) * 255));
        colorData.push(Math.floor(pixelRGB[1] / Number(toneLevel) * 255));
        colorData.push(Math.floor(pixelRGB[2] / Number(toneLevel) * 255));
        colorData.push(255); // アルファチャンネル
    }
    return {
        data: colorData,
        width: Number(wh.split(" ")[0]),
        height: Number(wh.split(" ")[1]),
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("input-ppm").addEventListener("change", async function (e) {
        const imageFile = e.target.files[0];
        filename = removeExtension(imageFile.name);
        const imageBlob = new Blob([imageFile], { type: "text/plain" });
        const fileString = await imageBlob.text();
        const fileLines = fileString.split("\n").filter(e => !e.startsWith("#"));
        // 別フォーマット対応部分後で挿入可能？PGMとPBMにも対応して拡張子PNM増やす
        let img;
        try {
            img = parsePPM(fileLines);
        } catch (e) {
            alert(e);
            return;
        }

        const canvasWrapper = document.getElementById("canvas-wrapper");
        canvasWrapper.style.display = "block";
        const canvas = document.getElementById("image-output");
        canvas.width = img.width;
        canvas.height = img.height;
        canvasWrapper.style.width = `min(100%, ${img.width}px)`;
        canvas.style.width = `min(100%, ${img.width}px)`;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        for (let i = 0; i < img.data.length; i++) imageData.data[i] = img.data[i];
        ctx.putImageData(imageData, 0, 0);

        const downloadButtonsWrapper = document.getElementById("download-buttons-wrapper");
        downloadButtonsWrapper.style.display = "block";
    });
});
