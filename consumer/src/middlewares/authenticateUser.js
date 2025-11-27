import axios from 'axios';

export default async (req, res, next) => {
  const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000';
  const token = req.headers.authorization.split(' ')[1];

  const response = await axios.get(`${USER_SERVICE_URL}/api/user/authenticate-user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.data.status !== 'success') {
    return next(new AppError('User is not authenticated!'));
  }

  console.log('User is authunticated');

  next();
};
