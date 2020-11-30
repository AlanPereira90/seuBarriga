exports.seed = async(knex) => {
  
  await knex('users').insert([
    {id: -101, name: 'User 3', mail: 'user3@mail.com', password: '$2a$10$wrLYFaKtp6W3xbOQXdSys.APiJiYcS1YkIYYNdqCVXxIVNbiYMRbS'},
    {id: -102, name: 'User 4', mail: 'user4@mail.com', password: '$2a$10$wrLYFaKtp6W3xbOQXdSys.APiJiYcS1YkIYYNdqCVXxIVNbiYMRbS'}
  ])

  await knex('accounts').insert([
    {id: -101, name: 'accO Saldo Principal', user_id: -101},
    {id: -102, name: 'accD Saldo Principal', user_id: -101},
    {id: -103, name: 'accO Alternativa', user_id: -102},
    {id: -104, name: 'accD Alternativa', user_id: -102}
  ])
};
