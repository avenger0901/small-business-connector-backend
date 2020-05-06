const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  GET api/profile/me
//@desc   Get current users profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
          }).populate('user', ['name', 'avatar']);
        
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user'})
        }
        
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


//@route  post api/profile
//@desc   Create or update user profile
//@access Private
router.post(
    '/',
    [auth,
        [
            check('type', 'Type is required')
            .not()
            .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors:errors.array()})
        }

        const {
            type,
            company,
            about,
            website,
            location,
            contact,
            email,
            twitter,
            facebook,
            instagram
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;

        if(type) profileFields.type = type;
        if(company) profileFields.company = company;
        if(about) profileFields.about = about;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(contact) profileFields.contact = contact;


        //Build social object
        profileFields.social = {};
        if (email) profileFields.social.email = email;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user:req.user.id });

            if(profile) {
              // Update
              profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        //Create
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);
            
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }

    }
);

//@route  GET api/profile/me
//@desc   Get all profiles
//@access Public
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route  GET api/profile/user/user_id
//@desc   Get profile by user ID
//@access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
             user: req.params.user_id 
            }).populate('user', ['name', 'avatar']);

        if(!profile)
         return res.status(400).json( { msg: 'Profile not found' });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
      
        res.status(500).send('Server Error');
    }
});


//@route  DELETE api/profile/
//@desc   Delete profile, user & posts
//@access Private
router.delete('/', auth, async (req, res) => {
    try {
        //@todos  remove users posts
        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //Remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});












module.exports = router;