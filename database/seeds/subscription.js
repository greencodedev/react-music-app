exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('Subscription').delete()
    .then(function () {
      // Inserts seed entries
      return knex('Subscription').insert([{
          // jack@testing.com
          user_id: "f0889260-4acf-11eb-91bb-4b49c1af32be",
          plan_id: 3,
          subscribe_start: Date.now(),
          subscribe_end: 1735714800000, //2025
        },
        { // user1@testing.com
          user_id: "f0889260-4acf-11eb-91bb-4b4493019fcc",
          plan_id: 1,
          subscribe_start: Date.now(),
          subscribe_end: 1735714800000, //2025
        },
        { // user2@testing.com
          user_id: "f0889260-4acf-35wf-91bb-4b4493019fcc",
          plan_id: 2,
          subscribe_start: Date.now(),
          subscribe_end: 1735714800000, //2025
        },
        { // user3@testing.com
          user_id: "f0889260-7od-11eb-91bb-4b4493019fcc",
          plan_id: 3,
          subscribe_start: Date.now(),
          subscribe_end: 1735714800000, //2025
        },
        { // craigfechtermusic@gmail.com
          user_id: "de4fc280-59d4-11eb-aff7-07250d070e64",
          plan_id: 3,
          subscribe_start: Date.now(),
          subscribe_end: 1735714800000, //2025
        },
      ]);
    });
};
