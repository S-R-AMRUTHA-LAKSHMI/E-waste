const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// User schema and model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Request schema and model
const requestSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    itemDetails: { type: String, required: true },
    address: { type: String, required: true },
    pickupDate: { type: String, required: true },
    pickupTime: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'verified', 'completed'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
    isCollected: { type: Boolean, default: false },
    verificationResponses: {
        type: Map,
        of: String,
        default: {}
    },
    report: {
        reportId: String,
        verificationDate: Date,
        customerDetails: {
            name: String,
            phone: String,
            address: String,
            pickupDate: String,
            pickupTime: String
        },
        itemDetails: String,
        responses: {
            type: Map,
            of: String
        },
        amount: String,
        paymentStatus: String,
        collectionStatus: String
    }
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);

// Existing Auth Routes
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
});

// In server.js, modify the login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id.toString(), // Ensure ID is converted to string
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// In server.js, modify the requests route
app.get('/api/requests/:userId', async (req, res) => {
    try {
        if (!req.params.userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const requests = await Request.find({ assignedTo: req.params.userId });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
});
app.put('/api/requests/:requestId', async (req, res) => {
    try {
        const {
            amount,
            isPaid,
            isCollected,
            verificationResponses,
            report
        } = req.body;

        const status = isPaid && isCollected ? 'completed' : 'verified';

        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.requestId,
            {
                amount,
                isPaid,
                isCollected,
                verificationResponses,
                report,
                status
            },
            { new: true }
        );

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Error updating request' });
    }
});

// Route to create test requests (for development)
app.post('/api/requests', async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Error creating request' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));