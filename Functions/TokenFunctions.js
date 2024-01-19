var jwt = require('jsonwebtoken');

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

async function STUDENT(req, res, next) {
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
            if (decoded.role != "Student") {
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

module.exports = {
    generateToken,
    ADMIN,
    STUDENT,
    FACULTY,
    FACULTYSTUDENT
};