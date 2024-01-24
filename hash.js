function stringToId(str) {
  const encodedString = btoa(encodeURIComponent(str));
  return encodedString;
}

function idToString(id) {
  const decodedString = decodeURIComponent(atob(id));
  return decodedString;
}

// Example usage:
// const originalString = "hasbro/game-night-for-nintendo-switch";
// console.log("Original String:", originalString);

// const id = stringToId(originalString);
// console.log("ID:", id);

// const reversedString = idToString(id);
// console.log("Reversed String:", reversedString);

module.exports = {
  stringToId,
  idToString
};