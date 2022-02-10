const {
  hashSync
} = require("bcryptjs");

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('User').delete()
    .then(function () {
      // Inserts seed entries
      return knex('User').insert([{
          id: "f0889260-4acf-11eb-91bb-4b49c1af32be",
          email: 'jack@testing.com',
          password: hashSync('password', 13),
          isVerified: true,
          first_name: "Jack",
          last_name: "Barry",
          role: "admin",
          balance: 2000,
          created: Date.now()
        },
        {
          id: "f0889260-4acf-11eb-91bb-4b4493019fcc",
          email: 'user1@testing.com',
          password: hashSync('password', 13),
          isVerified: true,
          first_name: "Test",
          last_name: "1",
          role: "testing",
          active_subscription: true,
          balance: 200,
          created: Date.now()
        },
        {
          id: "f0889260-4acf-35wf-91bb-4b4493019fcc",
          email: 'user2@testing.com',
          password: hashSync('password', 13),
          isVerified: true,
          first_name: "Test",
          last_name: "2",
          role: "testing",
          active_subscription: true,
          balance: 200,
          created: Date.now()
        },
        {
          id: "f0889260-7od-11eb-91bb-4b4493019fcc",
          email: 'user3@testing.com',
          password: hashSync('password', 13),
          isVerified: true,
          first_name: "Test",
          last_name: "3",
          role: "testing",
          active_subscription: true,
          balance: 200,
          created: Date.now()
        },
        {
          id: "f087865-7od-11eb-91bb-4b4493019fcc",
          email: 'user4@testing.com',
          password: hashSync('password', 13),
          isVerified: false,
          first_name: "Test",
          last_name: "4",
          role: "testing",
          active_subscription: false,
          balance: 0,
          created: Date.now()
        },
        {
          id: "de4fc280-59d4-11eb-aff7-07250d070e64",
          email: "craigfechtermusic@gmail.com",
          password: hashSync('password', 13),
          isVerified: true,
          first_name: "Craig",
          last_name: "Fechter",
          role: "admin",
          balance: 1000000,
          created: Date.now()
        },
        {
          id: "b0889260-7od-11eb-91bb-4b4493019fbb",
          email: 'beta@testing.com',
          password: hashSync('password', 13),
          isVerified: true,
          first_name: "Beta",
          last_name: "Tester",
          role: "beta",
          balance: 500,
          created: Date.now()
        },
      ]);
    });
};
