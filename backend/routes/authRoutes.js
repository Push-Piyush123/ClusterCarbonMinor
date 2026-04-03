const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company');
const MSME = require('../models/MSME');
const Aggregator = require('../models/Aggregator');
const Verifier = require('../models/Verifier');
const Admin = require('../models/Admin');
const InviteCode = require('../models/InviteCode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists for aggregators
const uploadDirAggregator = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDirAggregator)) {
    fs.mkdirSync(uploadDirAggregator, { recursive: true });
}

// Set up Map for Multer local disk storage (Aggregator docs)
const storageAggregator = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirAggregator);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure Multer to accept files up to 10MB (Aggregator)
const uploadAggregator = multer({
    storage: storageAggregator,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Ensure uploads directory exists for verifiers
const uploadDirVerifier = path.join(__dirname, '../uploads/verifier-certs');
if (!fs.existsSync(uploadDirVerifier)) {
    fs.mkdirSync(uploadDirVerifier, { recursive: true });
}

// Set up Map for Multer local disk storage (Verifier certs)
const storageVerifier = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirVerifier);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure Multer to accept files up to 10MB (Verifier)
const uploadVerifier = multer({
    storage: storageVerifier,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const { authMiddleware } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register-admin-full
// @desc    Register a user securely with an Admin invite code, map to an Admin doc
router.post('/register-admin-full', async (req, res) => {
    try {
        const {
            adminName, email, department, inviteCode, password
        } = req.body;

        // 1. Validate Invite Code First
        const existingCode = await InviteCode.findOne({ code: inviteCode });

        if (!existingCode) {
            return res.status(400).json({ message: "Invalid invite code" });
        }
        if (existingCode.isUsed) {
            return res.status(400).json({ message: "Invite code already used" });
        }
        if (new Date() > existingCode.expiresAt) {
            return res.status(400).json({ message: "Invite code expired" });
        }

        // 2. Validate User inputs
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // 3. Validate Password strength (min 8 chars, 1 uppercase, 1 number, 1 special char)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character."
            });
        }

        // 4. Create the User document
        const user = new User({
            name: adminName,
            email,
            password,
            role: "Admin"
        });

        // 5. Create the linked Admin document
        const admin = new Admin({
            adminName,
            email,
            department,
            inviteCode, // Store inviteCode for audit trail
            user: user._id
        });

        // 6. Save both the User and Admin atomically to MongoDB
        await user.save();
        await admin.save();

        // 7. Mark the Invite Code as used
        existingCode.isUsed = true;
        existingCode.usedBy = user._id; // New Admin user context
        // existingCode.usedAt = new Date(); -- Note: The backend model isn't enforcing this specifically required field, adding anyway for security
        existingCode.usedAt = new Date();
        await existingCode.save();

        // 8. Generate a JWT token for standard login flow
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 9. Return response to frontend
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            admin,
            token
        });

    } catch (error) {
        console.error("Error connecting to /register-admin-full", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   POST /api/auth/register-verifier-full
// @desc    Register a user, save a file upload, and map to a Verifier doc
router.post('/register-verifier-full', uploadVerifier.single('accreditationCertificate'), async (req, res) => {
    try {
        const {
            verifierName, agencyName, accreditationId, areaOfExpertise,
            email, phoneNumber, password
        } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // 2. Check if accreditationId already exists
        const existingVerifier = await Verifier.findOne({ accreditationId });
        if (existingVerifier) {
            return res.status(400).json({ message: "Accreditation ID already in use." });
        }

        // 3. Validate Password strength (min 8 chars, 1 uppercase, 1 number, 1 special char)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character."
            });
        }

        // 4. Handle file upload (Requires a file since it's an accreditation cert)
        if (!req.file) {
            return res.status(400).json({ message: "Accreditation certificate is required." });
        }

        let accreditationCertificate = {
            fileName: req.file.filename,
            filePath: `/uploads/verifier-certs/${req.file.filename}`, // relative path reference
            uploadedAt: new Date()
        };

        // 5. Create the User document
        const user = new User({
            name: verifierName,
            email,
            password,
            role: "Verifier"
        });

        // 6. Create the linked Verifier document
        const verifier = new Verifier({
            verifierName,
            agencyName,
            accreditationId,
            areaOfExpertise,
            email,
            phoneNumber,
            accreditationCertificate,
            user: user._id
        });

        // 7. Save both the User and Verifier atomically to MongoDB
        await user.save();
        await verifier.save();

        // 8. Generate a JWT token for standard login flow
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 9. Return response to frontend
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            verifier,
            token
        });

    } catch (error) {
        console.error("Error connecting to /register-verifier-full", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   POST /api/auth/register-aggregator-full
// @desc    Register a user, save a file upload, and map to an Aggregator
// uploadAggregator.single('verificationDocuments') extracts a single file from the FormData
router.post('/register-aggregator-full', uploadAggregator.single('verificationDocuments'), async (req, res) => {
    try {
        const {
            aggregatorName, entityType, email, phoneNumber,
            state, district, annualEmissionReductionPotential, password,
            termsAccepted
        } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email already exists." });
        }

        // 2. Validate Password strength (min 8 chars, 1 uppercase, 1 number, 1 special char)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character."
            });
        }

        // 3. Check terms accepted
        if (termsAccepted !== 'true' && termsAccepted !== true) {
            return res.status(400).json({ message: "Terms and conditions must be accepted." });
        }

        // 4. Handle file upload (if provided)
        let verificationDocs = null;
        if (req.file) {
            verificationDocs = {
                fileName: req.file.filename,
                filePath: `/uploads/${req.file.filename}`, // relative path reference
                uploadedAt: new Date()
            };
        }

        // 5. Create the User document
        const user = new User({
            name: aggregatorName,
            email,
            password,
            role: "Aggregator"
        });

        // 6. Create the linked Aggregator document
        const aggregator = new Aggregator({
            aggregatorName,
            entityType,
            email,
            phoneNumber,
            state,
            district,
            annualEmissionReductionPotential,
            termsAccepted: termsAccepted === 'true' || termsAccepted === true,
            verificationDocuments: verificationDocs,
            user: user._id
        });

        // 7. Save both the User and Aggregator atomically to MongoDB
        await user.save();
        await aggregator.save();

        // 8. Generate a JWT token for standard login flow
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 9. Return response to frontend
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            aggregator,
            token
        });

    } catch (error) {
        console.error("Error connecting to /register-aggregator-full", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   POST /api/auth/register-msme-full
// @desc    Register a user and map their registration data to an MSME
router.post('/register-msme-full', async (req, res) => {
    try {
        const {
            msmeName, yearsInOperation, udyamRegistrationId, country,
            industrySector, state, businessCategory, cityTown,
            industrialClusterArea, clusterPincode, primaryFuelType,
            productionUnitType, annualEnergyConsumption, energyUnit,
            peakOperatingMonths, annualEstimatedCO2Emissions,
            annualOperatingHours, productionCapacity, energyProjectType,
            equipmentDetails, projectStartDate, estimatedCompletionDate,
            expectedEmissionReduction, smartMeterAvailable,
            dataSubmissionFrequency, ownerName, gstNumber, emailAddress,
            panNumber, phoneNumber, password
        } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email: emailAddress });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email already exists." });
        }

        // 2. Create the User document first
        const user = new User({
            name: ownerName,
            email: emailAddress,
            password,
            role: "MSME"
        });

        // 3. Create the linked MSME document
        const msme = new MSME({
            msmeName,
            yearsInOperation,
            udyamRegistrationId,
            country: country || "India",
            industrySector,
            state,
            businessCategory,
            cityTown,
            industrialClusterArea,
            clusterPincode,
            primaryFuelType,
            productionUnitType,
            annualEnergyConsumption,
            energyUnit,
            peakOperatingMonths,
            annualEstimatedCO2Emissions,
            annualOperatingHours,
            productionCapacity,
            energyProjectType,
            equipmentDetails,
            projectStartDate,
            estimatedCompletionDate,
            expectedEmissionReduction,
            smartMeterAvailable,
            dataSubmissionFrequency,
            ownerName,
            gstNumber,
            emailAddress,
            panNumber,
            phoneNumber,
            user: user._id
        });

        // 4. Save both the User and MSME atomically to MongoDB
        await user.save();
        await msme.save();

        // 5. Generate a JWT token for standard login flow
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 6. Return response to frontend
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            msme,
            token
        });

    } catch (error) {
        console.error("Error connecting to /register-msme-full", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   POST /api/auth/register-company-full
// @desc    Register a user and map all their phase 2.1 registration data to a Company
router.post('/register-company-full', async (req, res) => {
    try {
        const {
            // All frontend company fields mapped directly
            companyName, registrationNumber, industryType, companySize,
            country, state, annualCO2Emissions, sustainabilityDetails,
            netZeroTargetYear, expectedAnnualCreditPurchase, primaryContactName,
            phoneNumber, email, city, gstNumber, officeAddress, panNumber,
            preferredContactMethod, password
        } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email already exists." });
        }

        // 2. Create the User document first
        const user = new User({
            name: primaryContactName, // Using the primary contact name for user
            email,
            password,
            role: "Company"
        });

        // 3. Create the linked Company document
        const company = new Company({
            companyName,
            registrationNumber,
            industryType,
            companySize,
            country: country || "India", // Default fallback just in case
            state,
            annualCO2Emissions,
            sustainabilityDetails,
            netZeroTargetYear,
            expectedAnnualCreditPurchase,
            primaryContactName,
            phoneNumber,
            email,
            city,
            gstNumber,
            officeAddress,
            panNumber,
            preferredContactMethod: preferredContactMethod || "Email", // Default fallback
            user: user._id // Link it to the newly assigned User ObjectId
        });

        // 4. Save both the User and Company atomically to MongoDB
        await user.save();
        await company.save();

        // 5. Generate a JWT token for standard login flow
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 6. Return response to frontend
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            company, // Entire Company Mongoose document
            token
        });

    } catch (error) {
        console.error("Error connecting to /register-company-full", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   POST /api/auth/register-company
// @desc    Register a new company user
router.post('/register-company', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user with same email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email already exists." });
        }

        // Create new user with role "Company"
        // The password will automatically trigger the pre('save') hash code in models/User.js 
        const user = new User({
            name,
            email,
            password,
            role: "Company"
        });

        await user.save();

        // Use jsonwebtoken to sign JWT payload
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Return user metadata and JWT token without the password
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error("Error connecting to /register-company", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   POST /api/auth/register-aggregator
// @desc    Register a new aggregator user
router.post('/register-aggregator', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email already exists." });
        }

        // Create user with role "Aggregator"
        const user = new User({
            name,
            email,
            password,
            role: "Aggregator"
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error("Error connecting to /register-aggregator", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   POST /api/auth/login
// @desc    Login and authenticate as an existing user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email and explicitly request the "password" field
        // Since `{ select: false }` was used on the UserSchema it doesn't normally return it
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare standard password payload against bcrypt hashed MongoDB payload using bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error("Error connecting to /login", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// @route   GET /api/auth/me
// @desc    Verify current active authenticated session user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // req.user logic is populated by authMiddleware previously. Let's find out exactly who it is
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // password field is dropped because `{ select: false }` config in User schema
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error("Error connecting to /me", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
