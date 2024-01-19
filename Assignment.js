
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://b022210217:Meg04fEK7vmuXK0h@class0.qzwsbgr.mongodb.net/?retryWrites=true&w=majority";

const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const create = require('./Functions/CreateFunctions.js');

app.use(express.json())
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.post('/login', async (req, res) => {
  console.log('Request received for /login');
  const { username, password } = req.body;

  try {
    console.log('Attempting to find user by username:', username);
    const user = await findUserByUsername(username);

    if (!user) {
      console.log('User not found:', username);
      return res.status(401).send('Invalid username or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      console.log('Login successful for user:', username);
      const token = await generateToken(user);
      res.send('Login Succesful, your token is \n' + token);
    } else {
      console.log('Incorrect password for user:', username);
      res.status(401).send('Invalid username or password');
    }
  }
  catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});
 
app.post('/admin/create-user/students', ADMIN, async (req, res) => {
  try {
    const { username, password, student_id, email, phone, PA } = req.body;

    // Check if the username already exists
    const existingUser = await existingusers(username);

    if (existingUser.length > 0) {
      // If a user with the same username already exists, return a 400 response
      console.log(existingUser);
      return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // If the username is unique, proceed to create the new student
    await create.createStudent(client, username, hashedPassword, student_id, email, phone, PA);
    return res.status(201).send("User created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}
);

app.post('/admin/create-user/staff', ADMIN, async (req, res) => {
  const { username, password, staff_id, email, phone } = req.body;

  try {
    const existingUser = await existingusers(username);

    if (existingUser.length > 0) {
      // If a user with the same username already exists, return a 400 response
      console.log(existingUser);
      return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await create.createStaff(client, username, hashedPassword, staff_id, email, phone);
    res.status(201).send("User created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
})

app.post('/admin/create-faculty', ADMIN, async (req, res) => {
  try {
    const { name, code, program, students, session } = req.body;

    // Check if the username already exists
    const existingFaculty = await existingfaculties(code);

    if (existingFaculty.length > 0) {
      // If a user with the same username already exists, return a 400 response
      console.log(existingFaculty);
      return res.status(400).send('Faculty already exists');
    }

    // If the username is unique, proceed to create the new student
    await create.createFaculty(client, name, code, program, students, session);
    return res.status(201).send("Faculty created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/faculty/create-program', FACULTY, async (req, res) => {
  try {
    const { name, code, faculty, subject, students, session } = req.body;

    // Check if the username already exists
    const existingProgram = await existingprograms(code);

    if (existingProgram.length > 0) {
      // If a user with the same username already exists, return a 400 response
      console.log(existingProgram);
      return res.status(400).send('Program already exists');
    }

    // If the username is unique, proceed to create the new student
    await create.createPrograms(client, name, code, faculty, subject, students, session);
    return res.status(201).send("Program created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/faculty/create-subject', FACULTY, async (req, res) => {
  try {
    const { name, code, credit, faculty, program, session } = req.body;

    // Check if the username already exists
    const existingSubject = await existingsubjects(code);

    if (existingSubject.length > 0) {
      // If a user with the same username already exists, return a 400 response
      console.log(existingSubject);
      return res.status(400).send('Subject already exists');
    }

    await create.createSubject(client, name, code, credit, faculty, program, session);
    return res.status(201).send("Subject created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/students/record/:student_id', student, (req, res) => {
  const { subject, date, status } = req.body;
  try {
    recordattendance(req.body.student_id, subject, date, status);
    res.status(201).send("Attendance recorded successfully");
  } catch (error) {

    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.delete('/delete-student/:student_id', ADMIN, async (req, res) => {
  const studentID = req.params.student_id;
  try {
    const student = await findStudentById(studentID);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    const result = await deleteStudent(studentID);
    if (result.deletedCount > 0) {
      res.status(200).send('Student data has been deleted');
    }
    else {
      res.status(500).send('Failed to delete student data');
    }
  }
  catch (error) {
    console.error("Error deleting student data:", error);
    res.status(500).send('Internal Server Error');
  }
}
);

app.get('/view-student-list/:staff_id', FACULTY,  async (req, res) => {
  try {
    const list = await viewStudentListByLecturer(req.params.staff_id);
    return res.status(201).json({ Details: 'Students', list});
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/view-details', FACULTYSTUDENT, async (req, res) => {
  const { student_id } = req.body;

  try {
    const details = await viewDetails(student_id);
    return res.status(201).json({ message: "View Details successful", details });
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/report', FACULTYSTUDENT, async (req, res) => {
  const { student_id } = req.body;

  try {
    const details = await viewDetails(student_id);
    const attendanceDetails = await report(details.student_id);

    if (attendanceDetails && attendanceDetails.length > 0) {
      const datesAndStatus = attendanceDetails.map(entry => ({
        date: entry.date,
        status: entry.status
      }));

      console.log(datesAndStatus);
      return res.status(200).send("Successful");
    } else {
      return res.status(404).send("Attendance details not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.patch('/faculty/update-student', FACULTY, async (req, res) => {
  const { student_id, code } = req.body;

  try {
    addStudent(code, student_id);
    return res.status(201).send("Student added successfully");
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

async function recordattendance(StudentId, Subject, Date, Status) {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Attendance');

    // Create a user object
    const attendance = {
      student_id: StudentId,
      subject : Subject,
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

async function ADMIN(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'Holy', function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    else {
      console.log(decoded.role)
      if (decoded.role != "Admin") {
        return res.status(401).send('Admin only');
      }
    }
    next();
  });
}

async function findStudentById(studentId) {
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

async function student(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'Holy', function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    else {
      console.log(decoded);
      if(decoded.role != "Student"){
        return res.status(401).send('Student only');
      }
      if (decoded.studentID != req.params.student_id) {
        console.log(decoded.studentID, req.params.student_id);
        return res.status(401).send('Your own student ID only');
      }
    }
    next();
  });
}

async function FACULTY(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'Holy', function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    else {
      console.log(decoded);
      if (decoded.role != "staff") {  
        console.log(decoded.role);
        return res.status(401).send('Faculty Level Only');
      }
    }
    next();
  });
}

async function FACULTYSTUDENT(req, res, next) {
  let header = req.headers.authorization;
  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'Holy', function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    else {
      console.log(decoded);
      if (decoded.role != "staff" && decoded.role != "Student") {
        console.log(decoded.role);
        return res.status(401).send('Faculty and Student Access Only');
      }
    }
    next();
  });
}

async function deleteStudent(studentId) {
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

async function viewStudentListByLecturer(lecturerId) {
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

async function viewDetails(StudentId) {
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

async function report(StudentId) {
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

async function findUserByUsername(username) {
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

async function existingusers(Username) {
  return await client
    .db('AttendanceSystem')
    .collection('Users')
    .find({ "username": { $eq: Username } })
    .toArray();
}

async function existingsubjects(Code) {
  return await client
    .db('AttendanceSystem')
    .collection('Subjects')
    .find({ "code": { $eq: Code } })
    .toArray();
}

async function existingprograms(Code) {
  return await client
    .db('AttendanceSystem')
    .collection('Programs')
    .find({ "code": { $eq: Code } })
    .toArray();
}

async function existingfaculties(Code) {
  return await client
    .db('AttendanceSystem')
    .collection('Faculty')
    .find({ "code": { $eq: Code } })
    .toArray();
}

async function generateToken(userData) {
  const token = jwt.sign(
    {
      username: userData.username,
      studentID: userData.student_id,
      role: userData.role
    },
    'Holy',
    { expiresIn: '1h' }
  );
  console.log(token);
  return token;
}

async function addStudent(code, studentID) {
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});