const User = require("../../model/User/User");
const DataLoader = require('dataloader');

const batchUsers = async (user_ids) => {
    const users = await User.find({
        _id: { $in: user_ids },
    });

    const dataMap = new Map();
    users.forEach((el) => {
        dataMap.set(el._id.toString(), el);
    });
    return user_ids.a((id) => dataMap.get(id.toString()));
};
exports.userLoader = () => new DataLoader(batchUsers);