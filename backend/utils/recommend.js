/**
 * Tag-matching recommendation engine
 * Scores courses by overlap with user's skills + interests
 */
const getRecommendedCourses = (user, allCourses) => {
  if (!user) return allCourses.slice(0, 6);

  const userTags = [...(user.skills || []), ...(user.interests || [])].map(t => t.toLowerCase());
  if (userTags.length === 0) return allCourses.filter(c => c.isFeatured).slice(0, 6);

  const scored = allCourses.map(course => {
    const courseTags = course.tags.map(t => t.toLowerCase());
    const overlap = courseTags.filter(t => userTags.includes(t)).length;
    const score = overlap + (course.isFeatured ? 0.5 : 0) + (course.rating / 10);
    return { course, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(s => s.course);
};

module.exports = { getRecommendedCourses };