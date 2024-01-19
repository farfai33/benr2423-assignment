async function viewStudentListByLecturer(client, lecturerId) {
    try {
        const database = client.db('AttendanceSystem');
        const collection = database.collection('Users');

        const staff = await collection.findOne({ role: 'staff', staff_id: lecturerId });

        if (!staff) {
            console.log('Lecturer not found');
            return [];
        }

        const students = await collection.find({ role: 'Student', PA: staff.username }).toArray();

        const studentList = students.map(student => ({
            username: student.username,
            student_id: student.student_id,
            email: student.email,
            phone: student.phone
        }));

        return studentList;
    } catch (error) {
        console.error('Error finding students for lecturer:', error);
        throw error;
    }
}

async function viewDetails(client, StudentId) {
    try {
        const database = client.db('AttendanceSystem');
        const collection = database.collection('Users');

        // Find the user by username
        const user = await collection.findOne({ student_id: { $eq: StudentId } });

        return user;
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw error;
    }
}

module.exports = {
    viewStudentListByLecturer,
    viewDetails
};