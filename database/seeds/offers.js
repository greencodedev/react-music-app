exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('Offer').delete()
    .then(function () {
      // Inserts seed entries
      return knex('Offer').insert([{
          id: 1,
          name: "100 credits",
          credits: 100,
          price: "4.49", //.0449
        },
        {
          id: 2,
          name: "250 credits",
          credits: 250,
          price: "9.49", //0.03796
          discount: 15, //*15.4565701559
        },
        {
          id: 3,
          name: "500 credits",
          credits: 500,
          price: "18.49", //0.03698
          discount: 18, //*17.6391982183
        }
      ]);
    });
};
