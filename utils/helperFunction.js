const helpers = {
  section: function (name, options) {
    if (!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
    this._sections.login = true;
    return null;
  },
};

module.exports = helpers;
