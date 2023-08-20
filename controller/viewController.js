const Tour = require('./../models/toursModel');

exports.getOverview = async (req, res) => {
    try {
        // 1 get tour data from collection
        const tours = await Tour.find();
        // 2 build template
        // 3 render that template using tour data from 1)
    res.status(200).render('overview',{
        tours
    });
    }catch(err) {
        console.log(err);
    }
};

exports.getTour = async(req, res) => {
    try {
        // 1 get the data, for requested tour {include review and guide }
        const tour = await Tour.findOne({slug: req.params.slug})
        // 2 build template
        // 3 render that template using tour data from 1)

     res.status(200).render('tour',{
        title: 'The Forest Hiker Tour'
    });

    }catch(err) {
        console.log(err);
    };
};

exports.getLoginForm = async (req, res) => {
    try {

        res.status(200).render('login',{
            title : 'Log into the Account'
        });

    }catch(err) {
        console.log(err);
    };
};