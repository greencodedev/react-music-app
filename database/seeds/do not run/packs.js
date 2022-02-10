exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('Pack').delete()
        .then(function () {
            // Inserts seed entries
            return knex('Pack').insert([{
                    title: "SH Essential Drums",
                    artist: "SampleHouse",
                    description: "description here",
                    sound_tags: "tag1,tag2,tag3"
                },
                {
                    title: "SH Arcade Nights",
                    artist: "SampleHouse",
                    description: "description here"
                },
            ]);
        });
};
