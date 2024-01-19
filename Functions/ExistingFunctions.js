async function existingusers(client, Username) {
    return await client
        .db('AttendanceSystem')
        .collection('Users')
        .find({ "username": { $eq: Username } })
        .toArray();
}

async function existingsubjects(client, Code) {
    return await client
        .db('AttendanceSystem')
        .collection('Subjects')
        .find({ "code": { $eq: Code } })
        .toArray();
}

async function existingprograms(client, Code) {
    return await client
        .db('AttendanceSystem')
        .collection('Programs')
        .find({ "code": { $eq: Code } })
        .toArray();
}

async function existingfaculties(client, Code) {
    return await client
        .db('AttendanceSystem')
        .collection('Faculty')
        .find({ "code": { $eq: Code } })
        .toArray();
}

module.exports = {
    existingusers,
    existingsubjects,
    existingprograms,
    existingfaculties
};