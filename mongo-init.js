// mongo-init.js - SIMPLE VERSION
db = db.getSiblingDB('everyday_discipline_dev');

// Tạo user cho application
db.createUser({
  user: 'deadev',
  pwd: 'devpassmongo123',
  roles: [
    {
      role: 'readWrite',
      db: 'everyday_discipline_dev',
    },
    {
      role: 'dbAdmin',
      db: 'everyday_discipline_dev',
    },
  ],
});

// Tạo test data
db.test_init.insertOne({
  message: 'Database initialized with app user',
  timestamp: new Date(),
});

print('✅ MongoDB initialized successfully');
