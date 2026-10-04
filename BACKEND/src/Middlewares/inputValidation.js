const joi = require('joi');
const {INVALID_PARAMETER_SENDED} = require('../../constants');
const requestObjects = [
  'body',
  'cookies',
  'headers',
  'params',
  'query',
];

const validate = (schema = {}) => {

  return (req, res, next) => {
    let keys = Object.keys(schema);

    if (keys.length > 0) {
      keys = keys.filter(k => requestObjects.indexOf(k) > -1);
    } else {
      return next();
    }

    if (keys.length == 0) {
      return next();
    }

    let result;
    for (let i = 0; i < keys.length; i++) {
      const element = keys[i];
      result = joi.validate(req[element], schema[element]);
      if (result.error !== null) {
        break;
      }
    }
    if (result.error === null) {
      next();
    } else {
      res.status(400).json({
        status: INVALID_PARAMETER_SENDED,
        error:{
          code: result.error.details[0].type,
          message: result.error.details[0].message.replace(new RegExp('\"', 'g'),'')
        }
      });
    }
  };
};


module.exports = { validate };
