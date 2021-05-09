const { ObjectID } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');

const users = mongoCollections.users;

const errorValidator = require('../utils/errorValidation');

const getUserById = async (id) => {
  try {
    if (!id || typeof id !== 'string') throw 'You must provide a valid user id';
    let validId = ObjectID(id.toString());
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: validId });

    if (user === null) throw 'No user found with that id';
    user._id = user._id.toString();
    return user;
  } catch (error) {
    throw error;
  }
};

async function getAllUserName() {
  const userCollection = await users();
  const userName = await userCollection.find({}).toArray();
  let returnData = userName.map((ele) => {
    return ele.username;
  });
  return returnData;
}

async function getAllEmailId() {
  const userCollection = await users();
  const userName = await userCollection.find({}).toArray();
  let returnData = userName.map((ele) => {
    return ele.email;
  });
  return returnData;
}

const getUserByUsername = async (username) => {
  try {
    if (!username || typeof username !== 'string') throw 'You must provide a valid username';
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (user === null) return null;
    user._id = user._id.toString();
    return user;
  } catch (error) {
    throw error;
  }
};

const createuser = async (username, firstname, lastname, email, password) => {
  try {
    const userCollection = await users();
    let data = {
      username,
      firstname,
      lastname,
      email,
      password,
      createdAt: new Date(),
      movies: [],
    };
    data = await userCollection.insertOne(data);
    if (data.insertedCount === 0) throw 'Could not create user';

    let newId = data.insertedId;
    let returndata = await getUserById(newId.toString());

    return returndata;
  } catch (error) {
    throw error;
  }
};

const updateMovieList = async (userId, { externalId, status }) => {
  try {
    if (!userId) throw 'You must provide user id';
    if (!externalId) throw 'You must provide externalId for movie';
    if (!status) throw 'You must provide status for movie';

    if (typeof status !== 'string' || status?.trim()?.length === 0)
      return res
        .status(400)
        .json({ status: false, message: 'Please make sure status is of string type and is non empty' });

    errorValidator.validateObjectId(userId, 'User id');

    errorValidator.isMovieStatusValid(status);

    const userCollection = await users();
    const foundUser = await userCollection.findOne({ _id: ObjectID(userId) });
    if (foundUser === null) throw 'No user found with given id';

    const [isMoviePresent] = foundUser?.movies.filter((movie) => movie.external_id === externalId);

    if (!isMoviePresent) {
      const payload = {
        external_id: externalId,
        status: status.replace(/\s/g, '').toLocaleLowerCase(),
      };
      foundUser.movies.push(payload);
    } else {
      foundUser.movies = foundUser?.movies.map((m) => {
        if (m.external_id === externalId) {
          m.status = status.replace(/\s/g, '').toLocaleLowerCase();
          return m;
        }
        return m;
      });
    }

    const updateUser = await userCollection.updateOne({ _id: ObjectID(userId) }, { $set: foundUser });
    if (!updateUser.matchedCount && !updateUser.modifiedCount) throw 'Could not update user';

    return await getUserById(userId);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserById,
  getAllUserName,
  getAllEmailId,
  getUserByUsername,
  createuser,
  updateMovieList,
};
