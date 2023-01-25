const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async(req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username });
        const registeredUser = await User.register(user, password);
        //회원가입 후 자동 로그인
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome!!!!!!!!');
            res.redirect('/campgrounds');
        })
    } catch(e){
        //중복이름
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'comeback');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'logout complate');
    res.redirect('/campgrounds');
}