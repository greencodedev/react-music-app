exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('Plugin').delete()
    .then(function () {
      // Inserts seed entries
      return knex('Plugin').insert([{
        id: "ae6a97d2-8811-11eb-8dcd-0242ac130",
        name: "Atmosia 2",
        description: "Atmosia 2 is a 4 voice Atmospheric/Cinematic instrument ideal for film, TV, advertising, and video game production as well as ambient and similar genres. A comprehensive extension to Atmosia 1 that now features over 580 sound sources from Atmosia 1, Electria 1, Mechia 1, and Firewalker as well as over 200 all new presets.",
        access_tier: 3,
        download_url: "https://www.sample.house/plug-in/Atmosia2.zip"
      }, {
        id: "ae6a9a16-8811-11eb-8dcd-0242ac130",
        name: "KEYz",
        description: "KEYz is a virtual instrument providing fast and easy access to a range of useful key sounds. Keyz features dual-voice playback and is designed so all the sound controls are on one page - envelopes, filters, effects so you can quickly modify the included presets, or design your all-new keyboard sounds.\n\nKeyz ships with over 80 different meticulously designed and sampled keyboard sounds, so you can mix and match these in any combination in the two voice playback system.",
        access_tier: 2,
        download_url: "https://www.sample.house/plug-in/KEYz.zip"
      }, {
        id: "ae6a9d36-8811-11eb-8dcd-0242ac130",
        name: "Kick Factory 2",
        description: "Kick Factory 2 is a sample-based instrument - it uses three layers - in each layer, you can select any of the 738 meticulously sampled different kick drums, so the combinations of sounds are huge. We have sampled a wide range of analog drum kits, iconic drum machines, and some obscure drum machines too. Each layer then has a range of modules to affect the sound, a multi-mode filter, an FM processor, a wave-shaper, reverb, delay, and a compressor. Finally, in the sound-shaping area, there are a set of modulators, for velocity, pitch, and filter frequency. All this gives you complete flexibility in getting the sound you are looking for.",
        access_tier: 3,
        download_url: "https://www.sample.house/plug-in/KickFactory2.zip"
      }, {
        id: "ae6a9f98-8811-11eb-8dcd-0242ac130",
        name: "LEADz",
        description: "LEADz is a virtual instrument providing fast and easy access to a range of useful Lead sounds. LEADz features dual-voice playback, and is designed so all the sound controls are on one page - envelopes, filters, effects so you can quickly modify the included presets, or design your all-new lead sounds.",
        access_tier: 3,
        download_url: "https://www.sample.house/plug-in/LEADz.zip"
      }, {
        id: "ae6aa06a-8811-11eb-8dcd-0242ac130",
        name: "PLUCKz",
        description: "PLUCKz is a virtual instrument providing fast and easy access to a range of useful Pluck sounds. PLUCKz features dual-voice playback and is designed so all the sound controls are on one page - envelopes, filters, effects so you can quickly modify the included presets, or design your all-new pluck sounds.\n\nPLUCKz ships with over 60 different meticulously designed and sampled pluck sounds, so you can mix and match these in any combination in the two voice playback system.",
        access_tier: 2,
        download_url: "https://www.sample.house/plug-in/PLUCKz.zip"
      }, {
        id: "53d75324-881a-11eb-8dcd-0242ac130003",
        name: "SHAPIRO 2",
        description: "Shapiro 2 is an eight oscillator synth, offering a different approach to sound-generation, using oscillators in matched pairs and allowing you to modulate the output in a range of different ways. Outputs from the oscillator-pairs pass through their own dynamic 'shaping' processes. First is an FM shaper - this isn't FM synthesis, instead, it is using a sine wave to shape the timbral output of the oscillator pairs. Next is a 'classic' Wave Shaper, which is followed by our one-of-a-kind field processor, which uses impulse responses in a convolution engine to move the timbre of the output. Finally there is a dedicated multi-mode filter section.",
        access_tier: 3,
        download_url: "https://www.sample.house/plug-in/Shapiro2.zip"
      }, {
        id: "53d75586-881a-11eb-8dcd-0242ac130003",
        name: "Snare Factory 2",
        description: "Snare Factory 2 is a sample-based instrument - it uses three layers - in each layer, you can select any of the 1,040 meticulously sampled different snare drums, so the combinations of sounds are huge. We have sampled a wide range of analog drum kits, iconic drum machines, and some obscure drum machines too. Each layer then has a range of modules to affect the sound, a multi-mode filter, an FM processor, a wave-shaper, reverb, delay, and a compressor. Finally, in the sound-shaping area, there are a set of modulators, for velocity, pitch, and filter frequency. All this gives you complete flexibility in getting the sound you are looking for.",
        access_tier: 2,
        download_url: "https://www.sample.house/plug-in/SnareFactory2.zip"
      }, {
        id: "53d759a0-881a-11eb-8dcd-0242ac130003",
        name: "The Modernist 2",
        description: "The Modernist 2 is a four-voice system, that is focused on reproducing detailed and varied samples of tuned percussion instruments. Each voice has a range of sound shaping and modulating capabilities. Also included are a set of master effects, tremolo effects, and an arpeggiator.",
        access_tier: 2,
        download_url: "https://www.sample.house/plug-in/TheModernist.zip"
      }, ]);
    });
};
