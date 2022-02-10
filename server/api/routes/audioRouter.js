const router = require("express").Router();
const userDb = require("../../../database/model/userModel");
const {
    checkDownloadByUser,
    insertDownload,
    getExclusiveDownloads
} = require("../../../database/model/soundDownloadModel");
const {
    getSounds,
    getSoundsBy,
    searchSounds,
    getSoundCount,
    getColumn,
    getSoundById,
    updateSound,
} = require("../../../database/model/soundModel");
// const {
//     getTags,
//     getInstruments,
//     getGenre
// } = require("../../../database/model/singleModel");
const {
    getPackBy,
    getPacks
} = require("../../../database/model/packModel");
const s3Client = require("s3").createClient();
const AWS = require('aws-sdk');
AWS.config.update({
    region: "us-west-1"
})
// Create S3 service object
const s3 = new AWS.S3({
    apiVersion: '2006-03-01'
});

router.get("/", async (req, res) => {
    const {
        offset = 0,
            limit = 25,
            tags,
            genre,
            instrument_type,
            type,
            searchQuery,
    } = req.query;
    let filtering = false;
    if (tags || genre || instrument_type || type) filtering = true;
    const filters = {
        tags: tags ? tags.split(",") : [],
        genre: genre ? genre.split(",") : [],
        instrument_type: instrument_type ? instrument_type.split(",") : [],
        type: type ? type.split(",") : []
    }
    let sounds = []
    if (!filtering && !searchQuery) sounds = await getSounds(limit, offset)
    else if (filtering) {
        //* first fetch full sound list w/ first filter selected
        let firstKey;
        let firstFilter;
        Object.keys(filters).forEach(async key => {
            if (filters[key].length && !firstKey) {
                firstKey = key
                firstFilter = filters[key][0]
                filters[key] = filters[key].filter(e => e !== firstFilter)
            }
        })
        sounds = await getSoundsBy(firstKey, firstFilter)

        //* second filter down each category of filters on sounds
        if (sounds.length)
            Object.keys(filters).forEach(key => {
                if (filters[key].length)
                    filters[key].forEach(async value => sounds = sounds.filter(s => s[key] && s[key].includes(value)))
            })

    } else if (searchQuery) {
        // console.log("Searching")
        const queries = searchQuery.split(" ");
        let i = 0;
        let searchedSounds = []
        // console.log(queries)
        while (i < queries.length) {
            await searchSounds(queries[0]).then(res => res.forEach(e => {
                if (!searchedSounds.includes(e)) searchedSounds.push(e)
            }))
            i++;
        }
        sounds = searchedSounds
    }

    if (sounds) res.status(200).send(sounds)
    else res.status(500).json({
        "msg": "unable to fetch sounds"
    })
})

router.get("/count", async (req, res) => {
    const [count] = await getSoundCount()
    res.status(200).json(count['count(*)'])
});

router.get("/category/:category", async (req, res) => {
    const category = req.params.category;
    const list = []
    const itemsFetched = await getColumn(category);
    itemsFetched.forEach((e) => {
        const item = e[category];
        item ?
            item.split(",").forEach(e => {
                if (!list.includes(e)) list.push(e)
            }) : null
    })
    res.status(200).json(list)
});


router.get("/stream/:key", (req, res) => {
    const key = req.params.key;
    // console.log("/stream", key)
    //! key: SH Essential Drums/SH_Essential_Hat_01.wav
    downloadStream(res, key).pipe(res) // Pipe download stream to response
})

router.get("/cover/:key", (req, res) => {
    const key = req.params.key;
    //! key: 'SH Essential Drums'

    s3.getObject({
        Bucket: 'samplehouse',
        Key: `covers/${key}.png`,
    }, (err, data) => {
        // if (err) console.error("Error /cover key:", key, err)//! out for testing
        // else console.log("Success", data.Body)
        if (data) res.status(200).json(data.Body)
    })
})

router.get("/download/:key", async (req, res) => {
    const key = req.params.key;
    // console.log(key)
    const user = req.user;
    let soundName = key.split("/")[1]
    if (soundName.endsWith('.wav')) soundName = soundName.replace(".wav", "");
    else if (soundName.endsWith('.mid')) soundName = soundName.replace(".mid", "");
    const [previousDownload] = await checkDownloadByUser(user.id, soundName)
    const exclusiveDownloads = await getExclusiveDownloads();
    const prevExclusiveDownload = exclusiveDownloads.find((e) => e.name === soundName);
    const [sound] = await getSoundsBy("name", soundName)
    const exclusive = sound ? sound.exclusive : null;
    // console.log("download sound:", {
    //     sound
    // }, {
    //     key
    // })
    if (!sound) return res.status(404).json({
        msg: "Sound not found. Please contact us at support@sample.house"
    });
    //* don't allow beta users to download exclusive sounds
    if (user.role === 'beta' && exclusive)
        return res.status(403).json({
            msg: "Beta users are not able to download exclusive sounds"
        }).end()


    //* if exclusive sound already downloaded by another user
    if (prevExclusiveDownload && (prevExclusiveDownload.userId !== user.id))
        return res.status(403).json({
            msg: "Exclusive sound already downloaded by another user"
        }).end()
    // insert
    else if (!previousDownload) {
        // console.log("not downloaded");
        const creditCost = exclusive ? 15 : 1;
        if ((user.balance - creditCost) < 0) return res.status(222).json({
            msg: "Credit balance is insufficient"
        });
        user.balance -= creditCost;
        await insertDownload({
            name: soundName,
            soundId: sound.id,
            userId: user.id,
            downloaded_at: Date.now(),
            exclusive
        })
        await userDb.updateUser(user)
        sound.download_count++
        await updateSound(sound)
        res.status(225) //to update balance on client
    } else {
        res.status(226)
        // console.log("already downloaded")
    } //! testing
    downloadStream(res, key).pipe(res); //Pipe download stream to response
})

router.get("/packs", async (req, res) => {
    const packs = await getPacks()
    packs ? res.status(200).json(packs) : res.status(500);
})

router.get("/pack/:title", async (req, res) => {
    const title = req.params.title;
    const [pack] = await getPackBy("title", title)
    const sounds = await getSoundsBy("pack", title);
    if (sounds && pack) pack.sounds = sounds
    pack ? res.status(200).json(pack) : res.status(500).end()
})

router.get("/exclusiveDownloads", async (req, res) => {
    const downloads = await getExclusiveDownloads();
    // console.log(downloads)
    if (downloads) {
        const sounds = [];
        downloads.forEach(e => sounds.push(e.soundId));
        res.status(200).json(sounds)
    }
    // else res.status(500);
})

//todo refactor change this to /id/:id
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const sound = await getSoundById(id)
    if (sound) res.status(200).json(sound);
    else res.status(500)
})

router.use("/", (req, res) => {
    res.status(200).json({
        Route: "Sound Route up"
    });
});

module.exports = router;

function downloadStream(res, key) {
    //* this adds the .mid for downloading and the .wav for streaming/downloading (if streaming .wav is already in place on midi files)
    // console.log(key.includes("midi") && (!key.endsWith(".mid")) || !key.endsWith(".wav"))

    // if (key.includes("midi") && (!key.endsWith(".mid")) || !key.endsWith(".wav")) {
    // console.log(key)
    // console.log(!key.endsWith(".wav"))
    // if (!key.endsWith(".mid") || !key.endsWith(".wav")) {
    //     if (key.includes("midi")) {
    //         console.log("+ .mid")
    //         key = key + ".mid"
    //     } else {
    //         console.log("+ .wav")
    //         key = key + ".wav"
    //     }
    // }
    // console.log("downloadStream", {
    //     key
    // })
    const downloadStream = s3Client.downloadStream({
        Bucket: 'samplehouse',
        Key: `packs/${key}`
    });


    downloadStream.on('error', () => res.status(404).send({
        msg: 'There was an error getting this file. Please try again or contact us at support@sample.house'
    }).end())

    downloadStream.on('httpHeaders',
        (statusCode, headers, resp) => res.set({
            'Content-Type': headers['content-type']
        }));

    return downloadStream
}
