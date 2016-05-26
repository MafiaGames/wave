module.exports = {

  nb2word: function(nb) {
    switch(nb) {
      case 0: return "ноль";
      case 1: return "один";
      case 2: return "два";
      case 3: return "три";
      case 4: return "четыре";
      case 5: return "пять";
      case 6: return "шесть";
      case 7: return "семь";
      case 8: return "восемь";
      case 9: return "девять";
      case 10: return "десять";
      case 11: return "одиннадцать";
      case 12: return "двенадцать";
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
