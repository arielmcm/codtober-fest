class Spy {

  static create () {
    return jest.fn();
  }

  static resolve (value = null) {
    return jest.fn().mockReturnValue(Promise.resolve(value));
  }

  static reject (value = null) {
    return jest.fn().mockReturnValue(Promise.reject(value));
  }

  static throwError (error = new Error()) {
    return jest.fn(() => {
      throw error;
    });
  }

  static returnValue (value = null) {
    return jest.fn().mockReturnValue(value);
  }

  static returnValues (...values) {
    const spy = jest.fn();
    values.forEach(value => spy.mockReturnValueOnce(value));
    return spy;
  }

}

module.exports = Spy;
