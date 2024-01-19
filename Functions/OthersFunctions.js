async function recordattendance(client, StudentId, Subject, Date, Status) {
    try {
        const database = client.db('AttendanceSystem');
        const collection = database.collection('Attendance');

        // Create a user object
        const attendance = {
            student_id: StudentId,
            subject: Subject,
            date: Date,
            status: Status
        };
        // Insert the user object into the collection
        await collection.insertOne(attendance);
        console.log("Attendance recorded successfully");
    }
    catch (error) {
        console.error("Error recording attendance:", error);
    }
}

async function deleteStudent(client, studentId) {
    try {
        const database = client.db('AttendanceSystem');
        const collection = database.collection('Users');

        // Delete the student based on their student_id
        const result = await collection.deleteOne({ student_id: studentId });
        return result;
    } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
    }
}

async function report(client, StudentId) {
    try {
        const database = client.db('AttendanceSystem');
        const collection = database.collection('Attendance');
        const user = await collection.find({ student_id: StudentId }).toArray();
        return user;
    } catch (error) {
        console.error('Error finding user by student_id:', error);
        throw error;
    }
}

async function addStudent(client, code, studentID) {
    try {
        const database = client.db('AttendanceSystem');
        const collection = database.collection('Subjects');

        const result = await collection.updateOne(
            { code: { $eq: code } },
            { $addToSet: { students: studentID } }
        );

        // Successful operation
        return result;
    } catch (error) {
        console.error('Error adding student:', error);
        return { success: false, message: 'Internal Server Error' };
    }
}

module.exports = {
    recordattendance,
    deleteStudent,
    report,
    addStudent
};