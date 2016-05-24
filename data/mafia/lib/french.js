module.exports = {

  nb2word: function(nb) {
    switch(nb) {
      case 0: return "zero";
      case 1: return "one";
      case 2: return "two";
      case 3: return "three";
      case 4: return "four";
      case 5: return "five";
      case 6: return "six";
      case 7: return "seven";
      case 8: return "eight";
      case 9: return "nine";
      case 10: return "ten";
      case 11: return "eleven";
      case 12: return "twelve";
      default: return ""+nb;
    }
  },

  /**
   * Joins an object as a french sentence.
   *
   * join({ a: 1, b: 2 }) = "un a et deux b"
   *
   * @param  Object obj      Keys are "noun" and values are "nb of noun"
   * @param  String beforeNb
   * @param  String afterNb
   * @return String
   */
  join: function(obj, beforeNb, afterNb) {

    beforeNb = beforeNb || "";
    afterNb  = afterNb  || "";

    var array = [];
    for(var i in obj) { // to array
      array.push({k: i, v: obj[i]});
    }

    if(array.length === 0)
      return false;

    var output = "";
    array.forEach(function(e, i, a) {

      if(i > 0) {
        output += i < a.length-1 ? ", " : " et ";
      }
      output += beforeNb + this.nb2word(e.v) + afterNb + " " + e.k;
      if(e.v > 1)
        output += "s"; //should be improved

    }.bind(this));

    return output;
  }

};
