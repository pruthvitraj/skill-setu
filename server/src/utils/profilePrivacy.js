function visibleStudent(student) {
  const value = student.toObject ? student.toObject() : { ...student };
  if (value.privacy?.showScores === false) {
    delete value.skillScore; delete value.atsScore;
  }
  return value;
}
module.exports = { visibleStudent };
