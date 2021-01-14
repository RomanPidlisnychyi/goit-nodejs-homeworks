const request = require('supertest');
const shoul = require('should');
const Server = require('../server');
const userModel = require('../users/userModel');

describe('Acceptance tests suitcase', () => {
  let server, newUser;
  // let newUser;
  const email = 'example@gmail.com';
  const password = 'qwerty';

  before(async () => {
    const userServer = new Server();
    server = await userServer.start();
  });

  after(() => {
    server.close();
  });

  describe('PATCH /users/avatars', () => {
    before(async () => {
      await request(server).post('/auth/register').send({ email, password });

      await request(server)
        .post('/auth/login')
        .send({ email, password })
        .then(res => {
          newUser = JSON.parse(res.req.res.text);
        });
    });

    after(async () => {
      const {
        user: { email },
      } = newUser;

      await userModel.findOneAndDelete({ email });
    });

    it('should return 200 ok', async () => {
      const {
        token,
        user: { subscription },
      } = newUser;
      await request(server)
        .patch('/users/avatars')
        .set('Authorization', `Bearer ${token}`)
        .attach('file_name', 'w123.jpg')
        .expect(response => {
          response.status.should.be.eql(200);
          response.body.should.be.eql({
            email,
            subscription,
            avatarURL: response.body.avatarURL,
          });
        });
    });

    it('should return 401 error', async () => {
      await request(server)
        .patch('/users/avatars')
        .attach('file_name', 'w123.jpg')
        .expect(401);
    });
  });
});
