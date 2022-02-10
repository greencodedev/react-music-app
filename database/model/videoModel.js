const db = require("../database-config.js")
module.exports = {
    getVideos,
    insertVideo,
    updateVideo,
    removeVideo
};

function getVideos() {
    return db("Video")
}

function insertVideo(video) {
    return db("Video").insert(video)
}

function updateVideo(video) {
    return db("Video").update(video).where("id", video.id)
}

function removeVideo(id) {
    return db("Video").where({
        id
    }).del();
}
