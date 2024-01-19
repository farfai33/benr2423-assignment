const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://b022210217:Meg04fEK7vmuXK0h@class0.qzwsbgr.mongodb.net/?retryWrites=true&w=majority";

const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');

const create = require('./Functions/CreateFunctions.js');
const token = require('./Functions/TokenFunctions.js');
const find = require('./Functions/FindFunctions.js');
const view = require('./Functions/ViewFunctions.js');
const exist = require('./Functions/ExistingFunctions.js');
const others = require('./Functions/OthersFunctions.js');

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
    const user = await find.findUserByUsername(client, username);

    if (!user) {
      console.log('User not found:', username);
      return res.status(401).send('Invalid username or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      console.log('Login successful for user:', username);
      const Token = await token.generateToken(user);
      res.send('Login Succesful, your token is \n' + Token);
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

app.post('/admin/create-user/students', token.ADMIN, async (req, res) => {
  try {
    const { username, password, student_id, email, phone, PA } = req.body;

    // Check if the username already exists
    const existingUser = await exist.existingusers(client, username);

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
});

app.post('/admin/create-user/staff', token.ADMIN, async (req, res) => {
  const { username, password, staff_id, email, phone } = req.body;

  try {
    const existingUser = await exist.existingusers(client, username);

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
});

app.post('/admin/create-faculty', token.ADMIN, async (req, res) => {
  try {
    const { name, code, program, students, session } = req.body;

    const existingFaculty = await exist.existingfaculties(client, code);

    if (existingFaculty.length > 0) {
      console.log(existingFaculty);
      return res.status(400).send('Faculty already exists');
    }

    await create.createFaculty(client, name, code, program, students, session);
    return res.status(201).send("Faculty created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/faculty/create-program', token.FACULTY, async (req, res) => {
  try {
    const { name, code, faculty, subject, students, session } = req.body;

    const existingProgram = await exist.existingprograms(client, code);

    if (existingProgram.length > 0) {
      console.log(existingProgram);
      return res.status(400).send('Program already exists');
    }

    await create.createPrograms(client, name, code, faculty, subject, students, session);
    return res.status(201).send("Program created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/faculty/create-subject', token.FACULTY, async (req, res) => {
  try {
    const { name, code, credit, faculty, program, session } = req.body;

    const existingSubject = await exist.existingsubjects(client, code);

    if (existingSubject.length > 0) {
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

app.post('/students/record/:student_id', token.STUDENT, (req, res) => {
  const { subject, date, status } = req.body;
  try {
    others.recordattendance(client, req.params.student_id, subject, date, status);
    res.status(201).send("Attendance recorded successfully");
  } catch (error) {

    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get('/view-details/:student_id', token.FACULTYSTUDENT, async (req, res) => {
  try {
    const details = await view.viewDetails(client, req.params.student_id);
    return res.status(201).json({ message: "View Details successful", details });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get('/view-student-list/:staff_id', token.FACULTY, async (req, res) => {
  try {
    const list = await view.viewStudentListByLecturer(client, req.params.staff_id);
    return res.status(201).json({ Details: 'Students', list });
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post('/report', token.FACULTYSTUDENT, async (req, res) => {
  const { student_id } = req.body;

  try {
    const details = await view.viewDetails(client, student_id);
    const attendanceDetails = await others.report(client, details.student_id);

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

app.patch('/faculty/update-student', token.FACULTY, async (req, res) => {
  const { student_id, code } = req.body;

  try {
    others.addStudent(client, code, student_id);
    return res.status(201).send("Student added successfully");
  }
  catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.delete('/delete-student/:student_id', token.ADMIN, async (req, res) => {
  const studentID = req.params.student_id;
  try {
    const student = await find.findStudentById(client, studentID);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    const result = await others.deleteStudent(client, studentID);
    if (result.deletedCount > 0) {
      res.status(200).send('Student data has been deleted');
    } else {
      res.status(500).send('Failed to delete student data');
    }
  } catch (error) {
    console.error("Error deleting student data:", error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});