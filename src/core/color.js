var colors = [
  '#1BA5E0',
  '#E68415',
  '#E61F15',
  '#2B6B1B',
  '#97A30B',
  ];

var color = function () {
  var i = 0;

  return function() {
    i = i % colors.length;
    return colors[i++];
  };
};

crayon.color = color();
