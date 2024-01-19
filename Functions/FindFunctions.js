async function findUserByUsername(client, username) {
    try {
        const database = client.db('AttendanceSystem');
        const collection = database.collection('Users');

        // Find the user by username
        const user = await collection.findOne({ username });

        return user;
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw error;
    }
}

async function findStudentById(client, studentId) {
    try {
        const database = client.db('AttendanceSystem');
        const collection = database.collection('Users');

        // Find the student based on their student_id
        const student = await collection.findOne({ student_id: studentId });
        return student;
    } catch (error) {
        console.error("Error finding student:", error);
        throw error;
    }
}

module.exports = {
    findUserByUsername,
    findStudentById
};