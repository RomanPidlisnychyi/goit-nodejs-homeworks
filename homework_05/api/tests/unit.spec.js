const should = require('should');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const userController = require('../users/userController');
const userModel = require('../users/userModel');
const { UnauthorizedError } = require('../helpers/errorConstructor');

describe('Unit test authorize middleware', () => {
  describe('#authorize', () => {
    let sandbox, req, res, findByIdStub, verifyStub, userId, actualResult;

    const next = err => {
      if (err) {
        actualResult = err;
        return;
      }
      actualResult = 'done';
    };

    before(async () => {
      sandbox = sinon.createSandbox();

      req = {
        get(headerTitle) {
          return this.headers[headerTitle];
        },
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZjg3NjIwMWQzNGQ4MTk0YzZhMGZhMiIsImlhdCI6MTYxMDM3NDAyMCwiZXhwIjoxNjEwNTQ2ODIwfQ.EBgE15k6gQPpZFSP3HTCm0yYGEBbzt1aMOu8156s3GI',
        },
      };

      userId = '5ff876201d34d8194c6a0fa2';

      verifyStub = sandbox
        .stub(jwt, 'verify')
        .callsFake(() => ({ id: userId }));

      findByIdStub = sandbox.stub(userModel, 'findById').callsFake(userId => ({
        _id: userId,
        email: 'Lucky@box',
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZjg3NjIwMWQzNGQ4MTk0YzZhMGZhMiIsImlhdCI6MTYxMDM3NDAyMCwiZXhwIjoxNjEwNTQ2ODIwfQ.EBgE15k6gQPpZFSP3HTCm0yYGEBbzt1aMOu8156s3GI',
      }));
    });

    after(() => {
      sandbox.restore();
    });

    it('should authorize middleware success', async () => {
      await userController.authorize(req, res, next);

      actualResult.should.be.eql('done');
    });

    it('shold throw error header Authorization empty', async () => {
      req.headers.Authorization = '';
      await userController.authorize(req, res, next);

      actualResult.should.be.eql(new UnauthorizedError(actualResult.message));
    });

    it('shold throw error invalid token', async () => {
      req.headers.Authorization =
        'Bearer tyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZjg3NjIwMWQzNGQ4MTk0YzZhMGZhMiIsImlhdCI6MTYxMDM3NDAyMCwiZXhwIjoxNjEwNTQ2ODIwfQ.EBgE15k6gQPpZFSP3HTCm0yYGEBbzt1aMOu8156s3GI';

      await userController.authorize(req, res, next);

      actualResult.should.be.eql(new UnauthorizedError(actualResult.message));
    });
  });
});
