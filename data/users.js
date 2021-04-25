const mongoCollections = require('../config/mongoCollections');
const { ObjectID } = require('mongodb');
const users = mongoCollections.users;

const getUserById = async (id) => {
  try {
    if (!id || typeof (id) !== 'string') throw 'You must provide an id to search for';
    let validId = ObjectID(id.toString())
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: validId });
    if (user === null) throw 'No book with that id';
    user._id = user._id.toString()
    return user;
  } catch (error) {
    return  null
  }
};

async function getAllUserName() {
  const userCollection = await users();
  const userName = await userCollection.find({}).toArray();
  let returnData = userName.map((ele)=>{return ele.username});
  return returnData;
}

const getUserByUsername = async (username) => {
  try {
    if (!username || typeof (username) !== 'string') throw 'You must provide an id to search for';
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (user === null) throw 'No book with that id';
    user._id = user._id.toString()
    return user;
  } catch (error) {
    return  null
  }
}

const createuser = async (username, firstname, lastname, email, password) => {
  try {
    const userCollection = await users();
    let data = {
     username,
     firstname, 
     lastname, 
     email, 
     password,
     createdAt:new Date(),
     movies:[]
    };
    data = await userCollection.insertOne(data);
    if (data.insertedCount === 0) throw 'Could not add book';

    let newId = data.insertedId;
    let returndata = await getUserById(newId.toString());

    return returndata;
  } catch (error) {
    return  null
  }
}

module.exports = {
  getUserById,
  getAllUserName,
  getUserByUsername,
  createuser
};
