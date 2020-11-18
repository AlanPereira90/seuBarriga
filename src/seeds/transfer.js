
exports.seed = async(knex) => {
  // Deletes ALL existing entries
  await knex('transactions').del()
  await knex('transfers').del()
  await knex('accounts').del()
  await knex('users').del()

  await knex('users').insert([
    {id: -1, name: 'User 1', mail: 'user1@mail.com', password: '$2a$10$wrLYFaKtp6W3xbOQXdSys.APiJiYcS1YkIYYNdqCVXxIVNbiYMRbS'},
    {id: -2, name: 'User 2', mail: 'user2@mail.com', password: '$2a$10$wrLYFaKtp6W3xbOQXdSys.APiJiYcS1YkIYYNdqCVXxIVNbiYMRbS'}
  ])

  await knex('accounts').insert([
    {id: -1, name: 'accO 1', user_id: -1},
    {id: -2, name: 'accD 1', user_id: -1},
    {id: -3, name: 'accO 2', user_id: -2},
    {id: -4, name: 'accD 2', user_id: -2}
  ])

  await knex('transfers').insert([
    {id:-1, description:'Transfer User 1', user_id:-1, acc_ori_id: -1, acc_dest_id: -2, ammount: 100, date: new Date()},
    {id:-2, description:'Transfer User 2', user_id:-2, acc_ori_id: -3, acc_dest_id: -4, ammount: 120, date: new Date()}
  ])

  await knex('transactions').insert([
    {description:'Transfer to accD 1', date: new Date(), ammount: -100, type: 'O', acc_id: -1, transfer_id: -1},
    {description:'Transfer from accO 1', date: new Date(), ammount: 100, type: 'I', acc_id: -2, transfer_id: -1},
    {description:'Transfer to accD 2', date: new Date(), ammount: -120, type: 'O', acc_id: -3, transfer_id: -2},
    {description:'Transfer from accO 2', date: new Date(), ammount: 120, type: 'I', acc_id: -4, transfer_id: -2}
  ])
};
