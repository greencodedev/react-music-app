exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('Plan').delete()
    .then(function () {
      // Inserts seed entries
      return knex('Plan').insert([{
          id: 1,
          tier: 1,
          name: "Basic",
          credits: 100,
          price: "5.99",
          included: "Samples (one shots),Loops,MIDI Files,Private Discord",
          payPal_id: "P-8F674631NK829381UMBMO32I",
          payPal_id_sandbox: "P-6AU98231SF026804DMBMOY5I",
        },
        {
          id: 2,
          tier: 2,
          name: "Standard",
          credits: 250,
          price: "10.99",
          discount: 27, //*26.61%
          included: "VST Access,Instructional Videos (coming soon),Samples (one shots),Loops,Exclusive Loops,MIDI Files,Private Discord",
          payPal_id: "P-3T8352882B254490VMBMO4EY",
          payPal_id_sandbox: "P-1C95019562040184VMAKFDXA",
        }, {
          id: 3,
          tier: 3,
          name: "Studio",
          credits: 500,
          price: "19.99",
          discount: 33, //*33.2554257095%
          included: "VST Access,Instructional Videos (coming soon),Samples (one shots),Loops,Exclusive Loops,MIDI Files,Private Discord",
          payPal_id: "P-42A22492UF520700GMBMO4LQ",
          payPal_id_sandbox: "P-48G78859E2352503XMAKFEAA",
        }
      ]);
    });
};
