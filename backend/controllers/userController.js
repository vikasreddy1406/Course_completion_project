import { User } from "../models/User.js"


const registerUser = async (req, res) => {
    const { name, email, password,role,designation} = req.body;  

    try {
        
        if (!name || !email || !password || !role ) {
            return res.status(400).json({ message: "Some fields are missing" });
        }

        const existedUser = await User.findOne({ email });
        if (existedUser) {
            return res.status(201).json({ message: "User with this email already exists" }); 
        }

        
        const user = new User({
            name,
            email,
            password,
            role,
            designation,
            performance_score: 0  
        });

        
        await user.save();

       
        const createdUser = await User.findById(user._id).select("-password");

        if (!createdUser) {
            return res.status(500).json({ message: "Error while creating the user" });
        }

        
        return res.status(200).json(createdUser);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Some fields are missing" });  
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(201).json({ message: 'User not found' });  
        }

        const isPasswordValid = await user.isPasswordCorrect(password);  
        if (!isPasswordValid) {
            return res.status(202).json({ message: "Invalid Password" });  
        }

        const accessToken = user.generateAccessToken();
        const loggedInUser = await User.findById(user._id).select("-password");

        return res
            .status(200)
            .json({
                message: "Login successful",
                loggedInUser,
                accessToken
            });

    } catch (error) {
        return res.status(500).json({ message: error.message });  
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }, 'name _id designation');
        if (!employees.length) {
            return res.status(203).json({ message: 'No employees found' });
        }

        return res.status(200).json(employees);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export {
    registerUser,
    loginUser,
    getAllEmployees,
}
