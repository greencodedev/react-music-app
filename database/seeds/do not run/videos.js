exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('Video').delete()
    .then(function () {
      // Inserts seed entries
      return knex('Video').insert([{
          title: "Deep Focus - Music For Studying, Concentration and Work",
          description: "This relaxing music to study combines soothing ambient music with beautiful nature images, so you can play in the background while you focus on your exams. Please feel free to leave your comments and suggestions and to share your love by liking this video and subscribing to our channel.",
          url: "https://www.youtube.com/embed/oPVte6aMprI",
        },
        {
          title: "Monster Pacific Ocean Grouper Fishing",
          description: "In this episode of BlacktipH, we go fishing for monster pacific grouper at Casa Vieja Lodge in Guatemala. The day started with Josh and Franz catching bait. Franz uses a triple hook chicken rig with multiple bait species on the hooks. Once we got to the spot, I was immediately hooked up to the first grouper of the day!",
          url: "https://www.youtube.com/embed/pgYEX_sa2p0",
        },
        {
          title: "Looney Tunes",
          description: "This Classic Remastered and Restored Looney Tunes Compilation features over 5 hours of Bugs Bunny, Daffy Duck, Porky Pig & More from the golden-era of cartoon shorts. These Newly remastered & restored by 8thManDVD Cartoon Classics! Studios in 1080p.",
          url: "https://www.youtube.com/embed/4wEO_JuON9E",
        }, {
          title: "Deep Focus - Music For Studying, Concentration and Work",
          description: "This relaxing music to study combines soothing ambient music with beautiful nature images, so you can play in the background while you focus on your exams. Please feel free to leave your comments and suggestions and to share your love by liking this video and subscribing to our channel.",
          url: "https://www.youtube.com/embed/oPVte6aMprI",
        },
        {
          title: "Monster Pacific Ocean Grouper Fishing",
          description: "In this episode of BlacktipH, we go fishing for monster pacific grouper at Casa Vieja Lodge in Guatemala. The day started with Josh and Franz catching bait. Franz uses a triple hook chicken rig with multiple bait species on the hooks. Once we got to the spot, I was immediately hooked up to the first grouper of the day!",
          url: "https://www.youtube.com/embed/pgYEX_sa2p0",
        },
        {
          title: "Looney Tunes",
          description: "This Classic Remastered and Restored Looney Tunes Compilation features over 5 hours of Bugs Bunny, Daffy Duck, Porky Pig & More from the golden-era of cartoon shorts. These Newly remastered & restored by 8thManDVD Cartoon Classics! Studios in 1080p.",
          url: "https://www.youtube.com/embed/4wEO_JuON9E",
        },
      ])
    });
};
