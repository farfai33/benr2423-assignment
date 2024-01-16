
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://b022210217:Meg04fEK7vmuXK0h@class0.qzwsbgr.mongodb.net/?retryWrites=true&w=majority";

const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

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

app.get('/', (req, res) => {
  res.send('Hello World!')
});

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
    createStudent(username, hashedPassword, student_id, email, phone, PA);
    return res.status(201).send("User created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}
);

app.post('/admin/create-user/staff', ADMIN, async (req, res) => {
  const { username, password, staff_id, email, role, phone } = req.body;

  try {
    const existingUser = await existingusers(username);

    if (existingUser.length > 0) {
      // If a user with the same username already exists, return a 400 response
      console.log(existingUser);
      return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createStaff(username, hashedPassword, staff_id, email, role, phone);
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
    createFaculty(name, code, program, students, session);
    return res.status(201).send("Faculty created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/faculty/create-program', second, async (req, res) => {
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
    createPrograms(name, code, faculty, subject, students, session);
    return res.status(201).send("Program created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/faculty/create-subject', second, async (req, res) => {
  try {
    const { name, code, credit, faculty, program, session } = req.body;

    // Check if the username already exists
    const existingSubject = await existingsubjects(code);

    if (existingSubject.length > 0) {
      // If a user with the same username already exists, return a 400 response
      console.log(existingSubject);
      return res.status(400).send('Subject already exists');
    }

    // If the username is unique, proceed to create the new student
    createSubject(name, code, credit, faculty, program, session);
    return res.status(201).send("Subject created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/students/record/:student_id', student, (req, res) => {
  const { student_id, date, status } = req.body;
  try {
    recordattendance(student_id, date, status);
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

app.post('/view-student-list', second, async (req, res) => {
  try {
    const list = await viewStudentList();
    console.log(list);
    return res.status(201).send("View successfully completed");
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/view-details', async (req, res) => {
  const { student_id } = req.body;

  try {
    viewDetails(student_id);
    return res.status(201).send("View Details successful");
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/report', async (req, res) => {
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

app.patch('/faculty/update-student', second, async (req, res) => {
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

async function recordattendance(StudentId, Date, Status) {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Attendance');

    // Create a user object
    const attendance = {
      student_id: StudentId,
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

async function second(req, res, next) {
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
      if (decoded.role != "Staff" && decoded.role != "Admin") {
        return res.status(401).send('Admin or Staff only');
      }
      console.log(decoded.role)
    }
    next();
  });
}

async function createStudent(Username, Password, StudentId, Email, Phone, PA) {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Users');

    // Create a user object
    const user = {
      username: Username,
      password: Password,
      student_id: StudentId,
      email: Email,
      role: "Student",
      phone: Phone,
      PA: PA,
    };

    // Insert the user object into the collection
    await collection.insertOne(user);
    console.log("User created successfully");
  }
  catch (error) {
    console.error("Error creating user:", error);
  }
}

async function createStaff(Username, Password, StaffId, Email, Role, Phone) {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Users');

    // Create a user object
    const user = {
      username: Username,
      password: Password,
      staff_id: StaffId,
      email: Email,
      role: "Staff",
      phone: Phone
    };
    // Insert the user object into the collection
    await collection.insertOne(user);

    console.log("User created successfully");
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

async function createFaculty(Name, Code, Programs, Students, Session) {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Faculties');

    // Create a user object
    const faculty = {
      name: Name,
      code: Code,
      program: Programs,
      students: Students,
      session: Session
    };
    // Insert the user object into the collection
    await collection.insertOne(faculty);

    console.log("Faculty created successfully");
  } catch (error) {
    console.error("Error creating faculty:", error);
  }
}

async function createPrograms(Name, Code, Faculty, Subjects, Students, Session) {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Programs');

    // Create a user object
    const program = {
      name: Name,
      code: Code,
      faculty: Faculty,
      subject: Subjects,
      students: Students,
      session: Session
    };
    // Insert the user object into the collection
    await collection.insertOne(program);

    console.log("Program created successfully");
  } catch (error) {
    console.error("Error creating program:", error);
  }
}

async function createSubject(Name, Code, Credit, Faculty, Program, Session) {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Subjects');

    // Create a user object
    const subject = {
      name: Name,
      code: Code,
      credit: Credit,
      faculty: Faculty,
      program: Program,
      session: Session
    };
    // Insert the user object into the collection
    await collection.insertOne(subject);

    console.log("Subject created successfully");
  } catch (error) {
    console.error("Error creating subject:", error);
  }
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
      if (decoded.studentID != req.params.student_id) {
        console.log(decoded.studentID, req.params.student_id);
        return res.status(401).send('Your own student ID only');
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

async function viewStudentList() {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Users');

    // Find the user by username
    const user = await collection.find({ role: { $eq: "Student" } }).toArray();

    return user;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
}
async function viewDetails(StudentId) {
  try {
    const database = client.db('AttendanceSystem');
    const collection = database.collection('Attendance');

    // Find the user by username
    const user = await collection.findOne({ StudentId });

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