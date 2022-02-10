exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('Sound').delete()
    .then(function () {
      // Inserts seed entries
      return knex('Sound').insert([{
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Galaga-01-Full-Dm-105.wav",
          "name": "SH_ArcadeNts_Galaga-01-Full-Dm-105",
          "exclusive": 1,
          "instrument_type": "bass,synth,pad,bass,synth,pad,bass,synth,pad",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro,80's,80s,retro,80's,80s,retro,80's",
          "genre": "synthpop,pop,synthwave,synthpop,pop,synthwave,synthpop,pop,synthwave",
          "tempo": 105,
          "key": "dm",
          "duration": 0.18
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Galaga-02-Chords-Dm-105.wav",
          "name": "SH_ArcadeNts_Galaga-02-Chords-Dm-105",
          "exclusive": 1,
          "instrument_type": "synth",
          "type": "one shot",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro,chords",
          "genre": "synthpop,pop,synthwave",
          "tempo": 105,
          "key": "dm",
          "duration": 0.18
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Galaga-03-Bassline-Dm-105.wav",
          "name": "SH_ArcadeNts_Galaga-03-Bassline-Dm-105",
          "exclusive": 1,
          "instrument_type": "bass",
          "type": "one shot",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro",
          "genre": "synthpop,pop,synthwave",
          "tempo": 105,
          "key": "dm",
          "duration": 0.18
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Gyruss-BrightPad-G-95.wav",
          "name": "SH_ArcadeNts_Gyruss-BrightPad-G-95",
          "exclusive": 0,
          "instrument_type": "pad",
          "type": "one shot",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro",
          "genre": "synthpop,pop,synthwave",
          "tempo": 95,
          "key": "g",
          "duration": 0.1
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Tetris-Bass-A#m-105.wav",
          "name": "SH_ArcadeNts_Tetris-Bass-A#m-105",
          "exclusive": 0,
          "instrument_type": "bass",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro",
          "genre": "synthpop,pop,synthwave",
          "tempo": 105,
          "key": "a#m",
          "duration": 0.09
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Tetris-Full-A#m-105.wav",
          "name": "SH_ArcadeNts_Tetris-Full-A#m-105",
          "exclusive": 0,
          "instrument_type": "bass,synth,vocorder",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro",
          "genre": "synthpop,pop,synthwave",
          "tempo": 105,
          "key": "a#m",
          "duration": 0.09
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Tetris-SynthChords-A#m-105.wav",
          "name": "SH_ArcadeNts_Tetris-SynthChords-A#m-105",
          "exclusive": 0,
          "instrument_type": "synth",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro",
          "genre": "synthpop,pop,synthwave",
          "tempo": 105,
          "key": "a#m",
          "duration": 0.09
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Tetris-VocorderChords-A#m-105.wav",
          "name": "SH_ArcadeNts_Tetris-VocorderChords-A#m-105",
          "exclusive": 0,
          "instrument_type": "vocorder",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro,chords",
          "genre": "synthpop,pop,synthwave",
          "tempo": 105,
          "key": "a#m",
          "duration": 0.09
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Tron-Arp+Chords-Bbm-110.wav",
          "name": "SH_ArcadeNts_Tron-Arp+Chords-Bbm-110",
          "exclusive": 0,
          "instrument_type": "pluck,synth",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro,chords",
          "genre": "synthpop,pop,synthwave",
          "tempo": 110,
          "key": "bbm",
          "duration": 0.08
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Tron-Arp-Bbm-110.wav",
          "name": "SH_ArcadeNts_Tron-Arp-Bbm-110",
          "exclusive": 0,
          "instrument_type": "pluck",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro",
          "genre": "synthpop,pop,synthwave",
          "tempo": 110,
          "key": "bbm",
          "duration": 0.08
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Tron-Full-Bbm-110.wav",
          "name": "SH_ArcadeNts_Tron-Full-Bbm-110",
          "exclusive": 0,
          "instrument_type": "bass,pluck,pad,synth",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro",
          "genre": "synthpop,pop,synthwave",
          "tempo": 110,
          "key": "bbm",
          "duration": 0.08
        },
        {
          "s3_uri": "s3://samplehouse/packs/Arcade Nights/SH_ArcadeNts_Tron-Pad-Bbm-110.wav",
          "name": "SH_ArcadeNts_Tron-Pad-Bbm-110",
          "exclusive": 0,
          "instrument_type": "pad",
          "type": "loop",
          "pack": "Arcade Nights",
          "tags": "80's,80s,retro",
          "genre": "synthpop,pop,synthwave",
          "tempo": 110,
          "key": "bbm",
          "duration": 0.08
        },
      ]);
    });
};

// s3_uri,name,exclusive,instrument_type,type,pack,tags,genre,tempo,key,duration
