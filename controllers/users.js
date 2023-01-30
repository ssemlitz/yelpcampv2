const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
  res.render('users/register')
}

module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body
    const user = new User({email, username})
    const registeredUser = await User.register(user, password)
    console.log('this is registeredUser:', registeredUser)
    req.login(registeredUser, error =>{
      if (error) return next(error)
      req.flash('success', 'Welcome to Yelp Camp!')
      res.redirect('/campgrounds')
    })
  } catch (error) {
    req.flash('error', error.message)
    res.redirect('/register')
  }
}

module.exports.renderLogin = (req, res) => {
  res.render('users/login')
}

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome back!')
  // if there's a redirectURL, it will go to that, if not, it will default to redirecting to '/campgrounds'
  const redirectURL = req.session.returnTo || '/campgrounds'
  res.redirect(redirectURL)
  delete req.session.returnTo
}

module.exports.logout = (req, res) => {
  req.logout(function(error){
    if (error) {
      return next(error)
    }
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
  })
} 